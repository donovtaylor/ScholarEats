const express = require('express');
const db = require('../db');
const router = express.Router();

// Route to blacklist user accounts
router.post('/', async (req, res) => {
  const { username } = req.body;
  console.log('Received username:', username); // Log received username

  const connection = await db.promise().getConnection();
  try {
    const [users] = await connection.query('SELECT user_id FROM users WHERE username = ?', [username]);
    console.log('Users found:', users); // Log users found
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const { user_id } = users[0];
    console.log('User ID:', user_id); // Log user ID

    await connection.beginTransaction();
    await connection.query('UPDATE users SET blacklist = 1 WHERE user_id = ?', [user_id]);

    await connection.commit();
    res.status(200).json({ message: 'User blacklisted successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error blacklisting user:', err);
    res.status(500).json({ message: 'Error blacklisting user' });
  } finally {
    connection.release();
  }
});

module.exports = router;
