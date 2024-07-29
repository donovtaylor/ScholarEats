/*****************************************
* Description: Backend methods and routes to create global variables to
* check if a user is logged in, is an admin, is a user, and is logged out
*****************************************/

const express = require('express');
const bcryot = require('bcryptjs');
const mysql = require('mysql');
const session = require('express-session');
const router = express.Router();

const connection = require('./db');

// Check if the user is logged in
function IS_LOGGED_IN(req, res, next) {
	if (req.session.user) {
		return next();
	} else {
		res.status(401).send('ERROR: Unauthorized request. Please log in.') // MIGHT be a 403, but this isnt really a significant difference to my understanding
	}
}

// Check if the user is an Admin
function IS_ADMIN(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  } else {
    res.status(403).send('Error: Forbidden. Admin access only.');
  }
}

// Check if the user is a User
function IS_USER(req, res, next) {
  if (req.session.user && req.session.user.role === 'user') {
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
		res.status(403).send('ERROR: Forbidden. User already logged in.')
	}
}

function IS_A_TEAPOT(req, res, next) {
	if (req.session.user && req.session.user.user_agent === 'teapot') {
		return next();
	} else {
	res.status(418).send('ERROR: Forbidden. User is a teapot.')
	}
}

module.exports = { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT, IS_A_TEAPOT };