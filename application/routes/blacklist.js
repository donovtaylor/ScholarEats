const express = require('express');
const db = require('../db');
const router = express.Router();

// Route to blacklist users
router.post('/', async (req, res) => {
  const { username } = req.body;
  console.log('Received username:', username); // Log received username
  try {
    const [users] = await db.promise().query('SELECT user_id FROM users WHERE username = ? AND blacklist = 0', [username]);
    console.log('Users found:', users); // Log users found
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found or already blacklisted' });
    }

    const user = users[0];
    console.log('User ID:', user.user_id); // Log user ID

    try {
      await db.promise().beginTransaction();
      // Temporarily disable foreign key checks
      await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
      await db.promise().query('UPDATE users SET blacklist = 1 WHERE username = ?', [username]);
      // Re-enable foreign key checks
      await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');
      await db.promise().commit();
      res.status(200).json({ message: 'User blacklisted successfully' });
    } catch (err) {
      await db.promise().rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error blacklisting user:', err);
    res.status(500).json({ message: 'Error blacklisting user' });
  }
});

module.exports = router;
