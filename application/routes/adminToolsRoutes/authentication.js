const express = require('express');
const db = require('../db');
const router = express.Router();
const blacklistRoutes = require('./blacklist');
const removeUsersRoutes = require('./removeUsers');
const syncUsersRoutes = require('./syncUsers'); // Add this line
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');


router.use('/blacklist', blacklistRoutes);
router.use('/remove', removeUsersRoutes);
router.use('/sync', syncUsersRoutes); // Add this line

// Route to authenticate users (verify and move to user_info table)
router.post('/authenticate', IS_ADMIN, async (req, res) => {
  const { user_id } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE user_id = ? AND verification_status = 0', [user_id]);
    if (users.length > 0) {
      const user = users[0];
      await db.query('INSERT INTO user_info (user_id) VALUES (?)', [user.user_id]);
      await db.query('UPDATE users SET verification_status = 1 WHERE user_id = ?', [user_id]);
      req.flash('success_msg', 'User request verified');
      res.redirect('/authentication/authenticate');
    } else {
      req.flash('error_msg', 'User not found or already verified');
      res.redirect('/authentication/authenticate');
    }
  } catch (err) {
    console.error('Error authenticating user:', err);
    req.flash('error_msg', 'Error authenticating user');
    res.redirect('/authentication/authenticate');
  }
});

// Route to disapprove users (remove from Users table)
router.post('/disapprove', IS_ADMIN, async (req, res) => {
  const { user_id } = req.body;
  try {
    await db.query('DELETE FROM users WHERE user_id = ?', [user_id]);
    req.flash('success_msg', 'User request disapproved');
    res.redirect('/authentication/authenticate');
  } catch (err) {
    console.error('Error disapproving user:', err);
    req.flash('error_msg', 'Error disapproving user');
    res.redirect('/authentication/authenticate');
  }
});

// Route to get unverified users
router.get('/authenticate', IS_ADMIN, async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE verification_status = 0');
    res.render('adminToolsViews/authenticateUsers', { users });
  } catch (err) {
    console.error('Error fetching unverified users:', err);
    res.status(500).send('Server Error');
  }
});

// User Authentication page
router.get('/', IS_ADMIN, (req, res) => {
  res.render('adminToolsViews/userAuthentication');
});

module.exports = router;
