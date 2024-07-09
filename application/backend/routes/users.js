const express = require('express');
const db = require('../db');
const router = express.Router();

// Route to remove user accounts
router.delete('/remove', (req, res) => {
  const { user_id } = req.body;
  const deleteUserInfoSql = 'DELETE FROM user_info WHERE user_id = ?';
  const deleteUserSql = 'DELETE FROM Users WHERE user_id = ?';
  const insertEmailLogSql = 'INSERT INTO email_log (user_id, email, timestamp) SELECT user_id, email, NOW() FROM Users WHERE user_id = ?';

  db.query(insertEmailLogSql, [user_id], (err, result) => {
    if (err) throw err;
    db.query(deleteUserInfoSql, [user_id], (err, result) => {
      if (err) throw err;
      db.query(deleteUserSql, [user_id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'User removed and logged in email_log' });
      });
    });
  });
});

module.exports = router;

