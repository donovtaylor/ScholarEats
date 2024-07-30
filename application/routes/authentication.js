const express = require('express');
const db = require('../db');
const router = express.Router();

// Route to authenticate users
router.post('/', async (req, res) => {
  const { username } = req.body;
  console.log('Received username:', username); // Log received username

  const connection = await db.promise().getConnection();
  try {
    const [users] = await connection.query('SELECT user_id FROM users WHERE username = ? AND verification_status = 0', [username]);
    console.log('Users found:', users); // Log users found
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found or already verified' });
    }

    const user = users[0];
    console.log('User ID:', user.user_id); // Log user ID

    await connection.beginTransaction();
    await connection.query('INSERT INTO user_info (user_id) VALUES (?)', [user.user_id]);
    await connection.query('UPDATE users SET verification_status = 1 WHERE username = ?', [username]);

    await connection.commit();
    res.status(200).json({ message: 'User authenticated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error authenticating user:', err);
    res.status(500).json({ message: 'Error authenticating user' });
  } finally {
    connection.release();
  }
});

module.exports = router;
