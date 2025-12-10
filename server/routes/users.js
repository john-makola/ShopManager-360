
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/users
// @desc    Get all users for organization
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.querySystem(
      `SELECT id, first_name, last_name, middle_name, username, email, role, status, 
       home_phone, office_phone, contract_type, residential_address, next_of_kin, photo, created_at 
       FROM users WHERE organization_id = $1 ORDER BY first_name ASC`,
      [req.user.organization_id]
    );
    
    // Map snake_case to camelCase for frontend consistency
    const users = result.rows.map(u => ({
        id: u.id,
        organizationId: req.user.organization_id,
        firstName: u.first_name,
        lastName: u.last_name,
        middleName: u.middle_name,
        username: u.username,
        email: u.email,
        role: u.role,
        status: u.status,
        photo: u.photo,
        homePhone: u.home_phone,
        officePhone: u.office_phone,
        contractType: u.contract_type,
        residentialAddress: u.residential_address,
        nextOfKin: u.next_of_kin || {},
        createdAt: u.created_at
    }));

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users
// @desc    Create a new user
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }

  const { 
      firstName, lastName, middleName, username, email, password, 
      role, status, nationalId, contractType, homePhone, officePhone, 
      residentialAddress, nextOfKin, photo 
  } = req.body;

  try {
    const userExists = await db.querySystem('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.querySystem(
      `INSERT INTO users (
          organization_id, first_name, last_name, middle_name, username, email, password_hash, 
          role, status, national_id, contract_type, home_phone, office_phone, 
          residential_address, next_of_kin, photo
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING id, username, email, role`,
      [
          req.user.organization_id, firstName, lastName, middleName, username, email, passwordHash, 
          role, status || 'Active', nationalId, contractType, homePhone, officePhone, 
          residentialAddress, nextOfKin, photo
      ]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/:id
// @desc    Update user details
// @access  Private (Admin or Self)
router.put('/:id', auth, async (req, res) => {
  // Allow admins OR the user themselves
  if (req.user.role !== 'Administrator' && req.user.id !== req.params.id) {
    return res.status(403).json({ msg: 'Access denied.' });
  }

  const { 
      firstName, lastName, middleName, email, role, status, 
      homePhone, officePhone, contractType, residentialAddress, 
      nextOfKin, photo, password 
  } = req.body;
  const { id } = req.params;

  try {
    let query = `UPDATE users SET 
        first_name = $1, last_name = $2, middle_name = $3, email = $4, 
        role = $5, status = $6, home_phone = $7, office_phone = $8, 
        contract_type = $9, residential_address = $10, next_of_kin = $11, photo = $12`;
    
    let params = [
        firstName, lastName, middleName, email, role, status, 
        homePhone, officePhone, contractType, residentialAddress, 
        nextOfKin, photo
    ];

    if (password) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        query += `, password_hash = $13 WHERE id = $14 AND organization_id = $15`;
        params.push(passwordHash, id, req.user.organization_id);
    } else {
        query += ` WHERE id = $13 AND organization_id = $14`;
        params.push(id, req.user.organization_id);
    }

    const update = await db.querySystem(query + ' RETURNING id, username, email', params);

    if (update.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }

  if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'Cannot delete your own account.' });
  }

  try {
    const deleteOp = await db.querySystem(
      'DELETE FROM users WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organization_id]
    );

    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
