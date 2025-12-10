
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

// @route   GET api/customers
// @desc    Get all customers
// @access  Private
router.get('/', auth, tenant, async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM customers WHERE organization_id = $1 ORDER BY name ASC',
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/customers
// @desc    Add new customer
// @access  Private
router.post('/', auth, tenant, async (req, res) => {
  const { name, email, phone, balance, total_spent } = req.body;

  try {
    const newCustomer = await req.db.query(
      `INSERT INTO customers (organization_id, name, email, phone, balance, total_spent) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.organization_id, name, email, phone, balance || 0, total_spent || 0]
    );

    res.json(newCustomer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', auth, tenant, async (req, res) => {
  const { name, email, phone, balance, total_spent } = req.body;
  const { id } = req.params;

  try {
    const update = await req.db.query(
      `UPDATE customers SET name = $1, email = $2, phone = $3, balance = $4, total_spent = $5 
       WHERE id = $6 AND organization_id = $7 RETURNING *`,
      [name, email, phone, balance, total_spent, id, req.user.organization_id]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/customers/:id
// @desc    Delete customer
// @access  Private
router.delete('/:id', auth, tenant, async (req, res) => {
  try {
    const deleteOp = await req.db.query(
      'DELETE FROM customers WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    res.json({ msg: 'Customer deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
