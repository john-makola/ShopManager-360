
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

// --- SUPPLIERS ---

// @route   GET api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', auth, tenant, async (req, res) => {
  try {
    const result = await req.db.query(
      'SELECT * FROM suppliers WHERE organization_id = $1 ORDER BY name ASC',
      [req.user.organization_id]
    );
    // Map snake_case to camelCase
    const suppliers = result.rows.map(s => ({
        id: s.id,
        organizationId: s.organization_id,
        name: s.name,
        contactPerson: s.contact_person,
        email: s.email,
        phone: s.phone,
        category: s.category,
        address: s.address
    }));
    res.json(suppliers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/suppliers
// @desc    Add new supplier
// @access  Private
router.post('/', auth, tenant, async (req, res) => {
  const { name, contactPerson, email, phone, category, address } = req.body;

  try {
    const newSupplier = await req.db.query(
      `INSERT INTO suppliers (organization_id, name, contact_person, email, phone, category, address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.organization_id, name, contactPerson, email, phone, category, address]
    );

    res.json(newSupplier.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/suppliers/:id
// @desc    Update supplier
// @access  Private
router.put('/:id', auth, tenant, async (req, res) => {
  const { name, contactPerson, email, phone, category, address } = req.body;
  const { id } = req.params;

  try {
    const update = await req.db.query(
      `UPDATE suppliers SET name = $1, contact_person = $2, email = $3, phone = $4, category = $5, address = $6 
       WHERE id = $7 AND organization_id = $8 RETURNING *`,
      [name, contactPerson, email, phone, category, address, id, req.user.organization_id]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/suppliers/:id
// @desc    Delete supplier
// @access  Private
router.delete('/:id', auth, tenant, async (req, res) => {
  try {
    const deleteOp = await req.db.query(
      'DELETE FROM suppliers WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }

    res.json({ msg: 'Supplier deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- CATEGORIES ---

// @route   GET api/suppliers/categories
// @desc    Get supplier categories
router.get('/categories', auth, tenant, async (req, res) => {
    try {
        const result = await req.db.query(
            'SELECT * FROM supplier_categories WHERE organization_id = $1 ORDER BY name ASC',
            [req.user.organization_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/suppliers/categories
// @desc    Add supplier category
router.post('/categories', auth, tenant, async (req, res) => {
    const { name } = req.body;
    try {
        const newCat = await req.db.query(
            'INSERT INTO supplier_categories (organization_id, name) VALUES ($1, $2) RETURNING *',
            [req.user.organization_id, name]
        );
        res.json(newCat.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/suppliers/categories/:id
// @desc    Delete supplier category
router.delete('/categories/:id', auth, tenant, async (req, res) => {
    try {
        await req.db.query(
            'DELETE FROM supplier_categories WHERE id = $1 AND organization_id = $2',
            [req.params.id, req.user.organization_id]
        );
        res.json({ msg: 'Category deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
