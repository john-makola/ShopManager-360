
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

// @route   GET api/orders
// @desc    Get all orders with items and expenses
// @access  Private
router.get('/', auth, tenant, async (req, res) => {
  try {
    const client = await req.db.connect();
    try {
        // Fetch Orders
        const ordersRes = await client.query(
          `SELECT o.*, c.name as customer_name_joined 
           FROM orders o 
           LEFT JOIN customers c ON o.customer_id = c.id
           WHERE o.organization_id = $1 
           ORDER BY o.created_at DESC`,
          [req.user.organization_id]
        );
        
        const orders = ordersRes.rows;

        // Populate Sub-jobs (Items) and Expenses for each order
        // Note: For high volume, a single JOIN query grouped by ID is better, 
        // but for simplicity and readability in this context:
        for (let order of orders) {
            // Fetch Items
            const itemsRes = await client.query(
                'SELECT * FROM order_items WHERE order_id = $1',
                [order.id]
            );
            
            // Fetch Expenses
            const expensesRes = await client.query(
                'SELECT * FROM order_expenses WHERE order_id = $1',
                [order.id]
            );

            // Map DB columns to Frontend Types if necessary, or ensure Frontend parses snake_case
            // Ideally, mapping is done here.
            order.subJobs = itemsRes.rows.map(i => ({
                id: i.id,
                description: i.description,
                size: i.size,
                units: i.units,
                costPerUnit: i.cost_per_unit,
                total: i.total
            }));

            order.expenses = expensesRes.rows.map(e => ({
                id: e.id,
                description: e.description,
                size: e.size,
                units: e.units,
                costPerUnit: e.cost_per_unit,
                total: e.total
            }));
            
            // Normalize camelCase for frontend
            order.customerId = order.customer_id;
            order.customerName = order.customer_name || order.customer_name_joined;
            order.customerPhone = order.customer_phone;
            order.serviceType = order.service_type;
            order.dueDate = order.due_date;
            order.createdAt = order.created_at;
            order.amountPaid = order.amount_paid;
            order.paymentStatus = order.payment_status;
            order.paymentMethod = order.payment_method;
            order.saleType = order.sale_type;
            order.invoiceNumber = order.invoice_number;
            order.handledBy = order.handled_by;
            order.commissionRate = order.commission_rate;
        }

        res.json(orders);
    } finally {
        client.release();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/orders
// @desc    Create a new order (Job)
// @access  Private
router.post('/', auth, tenant, async (req, res) => {
  const client = await req.db.connect(); 
  try {
    await client.query('BEGIN');
    
    const { 
        id, // Frontend might generate ID, or DB defaults
        customer_id, customerId, 
        customer_name, customerName,
        customer_phone, customerPhone,
        title, description, status, priority, 
        service_type, serviceType,
        quantity, price, cost, balance, 
        amount_paid, amountPaid,
        payment_status, paymentStatus,
        payment_method, paymentMethod,
        sale_type, saleType,
        due_date, dueDate,
        invoice_number, invoiceNumber,
        handled_by, handledBy,
        commission_rate, commissionRate,
        discount,
        sub_jobs, expenses 
    } = req.body;

    // Normalize inputs (Frontend sends camelCase)
    const cId = customerId || customer_id;
    const cName = customerName || customer_name;
    const cPhone = customerPhone || customer_phone;
    const sType = serviceType || service_type;
    const aPaid = amountPaid || amount_paid || 0;
    const pStatus = paymentStatus || payment_status;
    const pMethod = paymentMethod || payment_method;
    const sTypeSale = saleType || sale_type;
    const dDate = dueDate || due_date;
    const invNum = invoiceNumber || invoice_number;
    const hBy = handledBy || handled_by;
    const commRate = commissionRate || commission_rate || 0;

    // 1. Create Order
    // We assume the DB handles ID generation if not provided, or uses the UUID passed
    const orderRes = await client.query(
      `INSERT INTO orders (
          id, organization_id, customer_id, customer_name, customer_phone, title, description, status, priority, 
          service_type, quantity, price, cost, balance, amount_paid, payment_status, payment_method, 
          sale_type, due_date, invoice_number, handled_by, commission_rate, discount, created_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [
        id || require('uuid').v4(), // Fallback if no ID passed
        req.user.organization_id, 
        cId, cName, cPhone, title, description, status, priority, 
        sType, quantity, price, cost, balance, aPaid, pStatus, pMethod, 
        sTypeSale, dDate, invNum, hBy, commRate, discount
      ]
    );
    
    const newOrder = orderRes.rows[0];

    // 2. Insert Sub Jobs (Order Items)
    if (sub_jobs && sub_jobs.length > 0) {
        for (const item of sub_jobs) {
            await client.query(
                `INSERT INTO order_items (order_id, description, size, units, cost_per_unit, total)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [newOrder.id, item.description, item.size, item.units, item.costPerUnit || item.cost_per_unit, item.total]
            );
        }
    }

    // 3. Insert Job Expenses
    if (expenses && expenses.length > 0) {
        for (const exp of expenses) {
            await client.query(
                `INSERT INTO order_expenses (order_id, description, size, units, cost_per_unit, total)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [newOrder.id, exp.description, exp.size, exp.units, exp.costPerUnit || exp.cost_per_unit, exp.total]
            );
        }
    }

    // 4. Create Transaction Record (Income) if paid
    if (aPaid > 0) {
        await client.query(
            `INSERT INTO transactions (organization_id, type, category, amount, date, description, payment_method, reference_id, customer_id, job_id)
             VALUES ($1, 'Income', 'Sales', $2, CURRENT_DATE, $3, $4, $5, $6, $7)`,
            [req.user.organization_id, aPaid, `Payment for ${title}`, pMethod, newOrder.invoice_number || newOrder.id, cId, newOrder.id]
        );
    }

    await client.query('COMMIT');
    
    // Normalize return for frontend
    const result = {
        ...newOrder,
        subJobs: sub_jobs,
        expenses: expenses
    };
    res.json(result);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

// @route   PUT api/orders/:id
// @desc    Update order details
// @access  Private
router.put('/:id', auth, tenant, async (req, res) => {
  const { status, paymentStatus, balance, amountPaid, title, description, quantity, price, cost } = req.body;
  const { id } = req.params;

  try {
    // Basic update for status/payment changes from Kanban/List
    const update = await req.db.query(
      `UPDATE orders SET 
        status = COALESCE($1, status), 
        payment_status = COALESCE($2, payment_status), 
        balance = COALESCE($3, balance), 
        amount_paid = COALESCE($4, amount_paid),
        title = COALESCE($5, title),
        description = COALESCE($6, description),
        quantity = COALESCE($7, quantity),
        price = COALESCE($8, price),
        cost = COALESCE($9, cost)
       WHERE id = $10 AND organization_id = $11 RETURNING *`,
      [status, paymentStatus, balance, amountPaid, title, description, quantity, price, cost, id, req.user.organization_id]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/orders/:id
// @desc    Delete order
// @access  Private
router.delete('/:id', auth, tenant, async (req, res) => {
  try {
    const deleteOp = await req.db.query(
      'DELETE FROM orders WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.json({ msg: 'Order deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
