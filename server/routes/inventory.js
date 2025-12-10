
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

// @route   GET api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', auth, tenant, async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM inventory_items WHERE organization_id = $1 ORDER BY name ASC',
      [req.user.organization_id]
    );
    
    // Convert to frontend model (snake to camel)
    const items = result.rows.map(i => ({
        id: i.id,
        organizationId: i.organization_id,
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        unit: i.unit,
        threshold: i.threshold,
        costPrice: i.cost_price,
        salePrice: i.sale_price,
        supplier: i.supplier_name || i.supplier_id, // Fallback to handle both ID and Name string
        image: i.image
    }));

    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/inventory
// @desc    Add new inventory item
// @access  Private
router.post('/', auth, tenant, async (req, res) => {
  // Frontend sends camelCase
  const { name, category, quantity, unit, threshold, costPrice, salePrice, supplier, image } = req.body;

  try {
    const newInventory = await req.db.query(
      `INSERT INTO inventory_items (organization_id, name, category, quantity, unit, threshold, cost_price, sale_price, supplier_name, image) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
          req.user.organization_id, name, category, quantity, unit, threshold, 
          costPrice, salePrice, supplier, image
      ]
    );

    res.json(newInventory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put('/:id', auth, tenant, async (req, res) => {
  const { name, category, quantity, unit, threshold, costPrice, salePrice, supplier, image } = req.body;
  const { id } = req.params;

  try {
    const update = await req.db.query(
      `UPDATE inventory_items SET name = $1, category = $2, quantity = $3, unit = $4, threshold = $5, cost_price = $6, sale_price = $7, supplier_name = $8, image = $9
       WHERE id = $10 AND organization_id = $11 RETURNING *`,
      [name, category, quantity, unit, threshold, costPrice, salePrice, supplier, image, id, req.user.organization_id]
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

// @route   DELETE api/inventory/:id
// @desc    Delete inventory item
// @access  Private
router.delete('/:id', auth, tenant, async (req, res) => {
  try {
    const deleteOp = await req.db.query(
      'DELETE FROM inventory_items WHERE id = $1 AND organization_id = $2',
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
