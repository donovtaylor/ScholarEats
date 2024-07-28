const express = require('express');
const db = require('../db');
const router = express.Router();
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');

// Route to sync users from Users to user_info
router.post('/', IS_ADMIN, async (req, res) => {
  try {
    const [users] = await db.query('SELECT user_id FROM users');
    console.log('Users fetched successfully:', users);

    if (users.length === 0) {
      req.flash('success_msg', 'No users to sync.');
      return res.redirect('/user-authentication');
    }

    let usersSynced = false;

    for (const user of users) {
      try {
        const [checkResults] = await db.query('SELECT user_id FROM user_info WHERE user_id = ?', [user.user_id]);
        console.log(`Checked user_info for user_id ${user.user_id}:`, checkResults);

        if (checkResults.length === 0) {
          await db.query('INSERT INTO user_info (user_id) VALUES (?)', [user.user_id]);
          console.log(`User ${user.user_id} moved to user_info table`);
          usersSynced = true;
        }
      } catch (error) {
        console.error('Error syncing user:', error);
        req.flash('error_msg', 'Error syncing users.');
        return res.redirect('/user-authentication');
      }
    }

    if (usersSynced) {
      req.flash('success_msg', 'User synchronization process completed successfully.');
    } else {
      req.flash('success_msg', 'No new users to sync.');
    }

    res.redirect('/admin-tools/user-authentication');
  } catch (err) {
    console.error('Error fetching users:', err);
    req.flash('error_msg', 'Error fetching users.');
    res.redirect('/admin-tools/user-authentication');
  }
});

module.exports = router;
