const express = require('express');
const mysql = require('mysql');
const path = require("path");
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

const router = express.Router();

router.get('/', (req, res) => {
  var dropdownFilters = req.app.locals.dropdownFilters;

  // var notifications
  res.render('notifications', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css'],
    dropdown1: dropdownFilters,
    //notification: notifications,
    title: 'Notifications'
  })
});

/* 404 Error handling */
router.use((req, res, next) => {
  res.status(404).send('404 Page Not Found');
});

module.exports = router;