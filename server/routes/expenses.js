
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

// @route   GET api/expenses
// @desc    Get expense catalog items
// @access  Private
router.get('/', auth, tenant, async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM expense_catalog WHERE organization_id = $1 ORDER BY description ASC',
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/expenses
// @desc    Add to expense catalog
// @access  Private
router.post('/', auth, tenant, async (req, res) => {
  const { code, description, category, size, units, cost_per_unit } = req.body;

  try {
    const newItem = await req.db.query(
      `INSERT INTO expense_catalog (organization_id, code, description, category, size, units, cost_per_unit) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.organization_id, code, description, category, size, units, cost_per_unit]
    );

    res.json(newItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/expenses/:id
// @desc    Update expense catalog item
// @access  Private
router.put('/:id', auth, tenant, async (req, res) => {
  const { code, description, category, size, units, cost_per_unit } = req.body;
  const { id } = req.params;

  try {
    const update = await req.db.query(
      `UPDATE expense_catalog SET code = $1, description = $2, category = $3, size = $4, units = $5, cost_per_unit = $6 
       WHERE id = $7 AND organization_id = $8 RETURNING *`,
      [code, description, category, size, units, cost_per_unit, id, req.user.organization_id]
    );

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete from expense catalog
// @access  Private
router.delete('/:id', auth, tenant, async (req, res) => {
  try {
    await req.db.query(
      'DELETE FROM expense_catalog WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );
    res.json({ msg: 'Item deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
