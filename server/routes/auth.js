
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Check if user exists in System DB
    const result = await db.querySystem('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const user = result.rows[0];

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Return JWT
    const payload = {
      user: {
        id: user.id,
        organization_id: user.organization_id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        // Also return user info (excluding password)
        delete user.password_hash;
        
        // Fetch Org info from System DB
        db.querySystem('SELECT * FROM organizations WHERE id = $1', [user.organization_id])
          .then(orgResult => {
             // We don't send db_connection_string to client
             const org = orgResult.rows[0];
             if(org) delete org.db_connection_string; 
             res.json({ token, user, organization: org });
          });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get logged in user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const userResult = await db.querySystem('SELECT id, first_name, last_name, username, email, role, organization_id FROM users WHERE id = $1', [req.user.id]);
    res.json(userResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
