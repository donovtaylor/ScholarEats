const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const session = require('express-session');
const router = express.Router();

const connection = require('./db');

// Check if the user is logged in
function IS_LOGGED_IN(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      res.status(401).send('Error: Unauthorized request. Please log in.');
    }
  }
  
// Check if the user is an Admin
function IS_ADMIN(req, res, next) {
  if (req.session.user && req.session.user.user_agent === 'admin') {
    return next();
  } else {
    res.status(403).send('Error: Forbidden. Admin access only.');
  }
}
  
// Check if the user is a User
function IS_USER(req, res, next) {
  if (req.session.user && req.session.user.user_agent === 'user') {
    return next();
  } else {
    res.status(403).send('Error: Forbidden. User access only.');
  }
}

// Check if the user is logged out
function IS_LOGGED_OUT(req, res, next) {
  if (!req.session.user) {
    return next();
  } else {
    res.status(403).send('Error: Forbidden. User already logged in.');
  }
}

module.exports = { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT };