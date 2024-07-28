const express = require('express');
const db = require('../db');
const router = express.Router();
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');

// Route to blacklist users
router.post('/', IS_ADMIN, async (req, res) => {
  const { user_id } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get user details
    const [users] = await connection.query('SELECT user_id, email FROM users WHERE user_id = ?', [user_id]);
    if (users.length === 0) {
      throw new Error('User not found');
    }

    const { email } = users[0];

    // Log the user into email_log
    await connection.query('INSERT INTO email_log (user_id, email, timestamp, action) VALUES (?, ?, NOW(), ?)', [user_id, email, 'blacklist']);

    // Update the user as blacklisted
    await connection.query('UPDATE users SET blacklist = 1 WHERE user_id = ?', [user_id]);

    await connection.commit();

    req.flash('success_msg', 'User blacklisted successfully and logged in email_log');
    res.redirect('/admin-tools/user-authentication/blacklist');
  } catch (err) {
    await connection.rollback();
    console.error('Error blacklisting user:', err);
    req.flash('error_msg', 'Error blacklisting user');
    res.redirect('/admin-tools/user-authentication/blacklist');
  } finally {
    connection.release();
  }
});

// Route to get all users for blacklisting
router.get('/', IS_ADMIN, async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE blacklist = 0');
    res.render('adminToolsViews/blacklistUsers', { users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
