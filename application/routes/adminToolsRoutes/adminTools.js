const express = require('express');
const db = require('../db');
const router = express.Router();
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');


const inventoryRoutes = require('./inventoryManagement');
const authenticationRoutes = require('./authentication');
const announcement = require('./universityAnnouncement_BE');


router.use('/inventory-management', inventoryRoutes);
router.use('/user-authentication', authenticationRoutes);
router.use('/announcement', announcement);

// Home page
router.get('/', IS_ADMIN, (req, res) => {
  res.render('adminToolsViews/adminTools', {
    title: 'Admin Tools'
  });
});

module.exports = router;