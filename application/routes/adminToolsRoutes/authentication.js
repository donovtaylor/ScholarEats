const express = require('express');
const db = require('../db');
const router = express.Router();
const blacklistRoutes = require('./blacklist');
const removeUsersRoutes = require('./removeUsers');
const syncUsersRoutes = require('./syncUsers'); // Add this line


router.use('/blacklist', blacklistRoutes);
router.use('/remove', removeUsersRoutes);
router.use('/sync', syncUsersRoutes); // Add this line

// Route to authenticate users (verify and move to user_info table)
router.post('/authenticate', async (req, res) => {
  const { user_id } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM Users WHERE user_id = ? AND verification_status = 0', [user_id]);
    if (users.length > 0) {
      const user = users[0];
      await db.query('INSERT INTO user_info (user_id) VALUES (?)', [user.user_id]);
      await db.query('UPDATE Users SET verification_status = 1 WHERE user_id = ?', [user_id]);
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
router.post('/disapprove', async (req, res) => {
  const { user_id } = req.body;
  try {
    await db.query('DELETE FROM Users WHERE user_id = ?', [user_id]);
    req.flash('success_msg', 'User request disapproved');
    res.redirect('/authentication/authenticate');
  } catch (err) {
    console.error('Error disapproving user:', err);
    req.flash('error_msg', 'Error disapproving user');
    res.redirect('/authentication/authenticate');
  }
});

// Route to get unverified users
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM Users WHERE verification_status = 0');
    res.render('adminToolsViews/authenticateUsers', { users });
  } catch (err) {
    console.error('Error fetching unverified users:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
