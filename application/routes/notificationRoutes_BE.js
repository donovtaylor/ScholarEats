const express = require('express');
const mysql = require('mysql2/promise');
const path = require("path");
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

const router = express.Router();
router.use(express.json());

const connection = mysql.createPool({
  host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
  user: 'backend_lead',
  password: 'password',
  database: 'ScholarEats'
});

router.get('/', async (req, res) => {
  var dropdownFilters = req.app.locals.dropdownFilters;
  const userID = req.session.user_id;

  let query = `SELECT * FROM notifications`;

  try {

    const [results] = await connection.execute(query, []);

    const notifications = results.map(row => ({
      id: row.notification_id,
      uid: row.user_id,
      message: row.message,
      isRead: row.isRead,
      timestamp: row.timestamp
    }));


    res.render('notifications', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      style: ['default.css', 'notifications.css'],
      dropdown1: dropdownFilters,
      notification: notifications,
      title: 'Notifications'
    });

  } catch (err) {
    console.error('Error fetching notifications: ', err);
    return res.status(500).send('Error fetching notifications');
  }
});

/* 404 Error handling */
router.use((req, res, next) => {
  res.status(404).send('404 Page Not Found');
});

module.exports = router;