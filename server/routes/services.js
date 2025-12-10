
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

// @route   GET api/services
// @desc    Get all services and products
// @access  Private
router.get('/', auth, tenant, async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM service_products WHERE organization_id = $1 ORDER BY name ASC',
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/services
// @desc    Add new service or product
// @access  Private
router.post('/', auth, tenant, async (req, res) => {
  const { code, name, type, category, price, unit, size, description, image } = req.body;

  try {
    const newItem = await req.db.query(
      `INSERT INTO service_products (organization_id, code, name, type, category, price, unit, size, description, image) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.user.organization_id, code, name, type, category, price, unit, size, description, image]
    );

    res.json(newItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/services/:id
// @desc    Update service or product
// @access  Private
router.put('/:id', auth, tenant, async (req, res) => {
  const { code, name, type, category, price, unit, size, description, image } = req.body;
  const { id } = req.params;

  try {
    const update = await req.db.query(
      `UPDATE service_products SET code = $1, name = $2, type = $3, category = $4, price = $5, unit = $6, size = $7, description = $8, image = $9 
       WHERE id = $10 AND organization_id = $11 RETURNING *`,
      [code, name, type, category, price, unit, size, description, image, id, req.user.organization_id]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/services/:id
// @desc    Delete service or product
// @access  Private
router.delete('/:id', auth, tenant, async (req, res) => {
  try {
    const deleteOp = await req.db.query(
      'DELETE FROM service_products WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    res.json({ msg: 'Item deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
