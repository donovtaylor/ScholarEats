const express = require('express');
const db = require('../db');
const router = express.Router();

// Route to authenticate users (verify and move to user_info table)
router.post('/authenticate', (req, res) => {
  const { user_id } = req.body;
  const getUserSql = 'SELECT * FROM Users WHERE user_id = ?';
  db.query(getUserSql, [user_id], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];
      const insertUserInfoSql = 'INSERT INTO user_info (user_id, email, username, role_id) VALUES (?, ?, ?, ?)';
      db.query(insertUserInfoSql, [user.user_id, user.email, user.username, user.role_id], (insertErr) => {
        if (insertErr) throw insertErr;
        const updateVerificationSql = 'UPDATE Users SET verification_status = 1 WHERE user_id = ?';
        db.query(updateVerificationSql, [user_id], (updateErr) => {
          if (updateErr) throw updateErr;
          res.json({ message: 'User authenticated and moved to user_info table' });
        });
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

module.exports = router;
