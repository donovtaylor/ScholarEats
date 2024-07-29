const express = require('express');
const db = require('../db');
const router = express.Router();
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');
const flash = require('connect-flash');


const inventoryRoutes = require('./inventoryManagement');
const authenticationRoutes = require('./authentication');

router.use(flash());

router.use('/inventory-management', inventoryRoutes);
router.use('/user-authentication', authenticationRoutes);

// Home page
router.get('/', IS_ADMIN, (req, res) => {
  res.render('adminToolsViews/adminTools', {
    title: 'Admin Tools'
  });
});

module.exports = router;