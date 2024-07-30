const express = require('express');
const db = require('../db');
const router = express.Router();

// Route to remove user accounts
router.post('/', async (req, res) => {
  const { username } = req.body;
  console.log('Received username:', username); // Log received username
  try {
    const [users] = await db.promise().query('SELECT user_id FROM users WHERE username = ?', [username]);
    console.log('Users found:', users); // Log users found
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const { user_id } = users[0];
    console.log('User ID:', user_id); // Log user ID

    try {
      await db.promise().beginTransaction();
      // Temporarily disable foreign key checks
      await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
      await db.promise().query('DELETE FROM user_info WHERE user_id = ?', [user_id]);
      await db.promise().query('DELETE FROM users WHERE user_id = ?', [user_id]);
      // Re-enable foreign key checks
      await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');
      await db.promise().commit();
      res.status(200).json({ message: 'User removed successfully' });
    } catch (err) {
      await db.promise().rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error removing user:', err);
    res.status(500).json({ message: 'Error removing user' });
  }
});

module.exports = router;
