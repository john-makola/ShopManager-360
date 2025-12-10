
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

// @route   GET api/transactions
// @desc    Get all transactions (Income & Expenses)
// @access  Private
router.get('/', auth, tenant, async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM transactions WHERE organization_id = $1 ORDER BY date DESC, created_at DESC',
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/transactions
// @desc    Record a new transaction
// @access  Private
router.post('/', auth, tenant, async (req, res) => {
  const { type, category, amount, date, description, payment_method, reference_id, customer_id, supplier_id } = req.body;

  try {
    const newTransaction = await req.db.query(
      `INSERT INTO transactions (organization_id, type, category, amount, date, description, payment_method, reference_id, customer_id, supplier_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.user.organization_id, type, category, amount, date || new Date(), description, payment_method, reference_id, customer_id, supplier_id]
    );

    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', auth, tenant, async (req, res) => {
  const { category, amount, date, description, payment_method } = req.body;
  const { id } = req.params;

  try {
    const update = await req.db.query(
      `UPDATE transactions SET category = $1, amount = $2, date = $3, description = $4, payment_method = $5 
       WHERE id = $6 AND organization_id = $7 RETURNING *`,
      [category, amount, date, description, payment_method, id, req.user.organization_id]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', auth, tenant, async (req, res) => {
  try {
    const deleteOp = await req.db.query(
      'DELETE FROM transactions WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    res.json({ msg: 'Transaction deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
