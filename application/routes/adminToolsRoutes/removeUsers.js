const express = require('express');
const db = require('../db');
const router = express.Router();
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');

// Route to remove user accounts
router.post('/', IS_ADMIN, async (req, res) => {
  const { user_id } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Log the user into email_log
    const [users] = await connection.query('SELECT user_id, email FROM users WHERE user_id = ?', [user_id]);
    if (users.length === 0) {
      throw new Error('User not found');
    }

    const { email } = users[0];
    await connection.query('INSERT INTO email_log (user_id, email, timestamp, action) VALUES (?, ?, NOW(), ?)', [user_id, email, 'remove']);

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Remove user from child tables if any
    await connection.query('DELETE FROM user_info WHERE user_id = ?', [user_id]);

    // Remove user from parent table
    await connection.query('DELETE FROM users WHERE user_id = ?', [user_id]);

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.commit();

    req.flash('success_msg', 'User removed and logged in email_log');
    res.redirect('/remove');
  } catch (err) {
    await connection.rollback();
    console.error('Error removing user:', err);
    req.flash('error_msg', 'Error removing user');
    res.redirect('/remove');
  } finally {
    connection.release();
  }
});

// Route to get all users for removal
router.get('/', IS_ADMIN, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT * FROM users');
    res.render('adminToolsViews/removeUsers', { users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
