/*****************************************
* Description: Backend methods and routes to create global variables to
* check if a user is logged in, is an admin, is a user, and is logged out
*****************************************/

const express = require('express');
const bcryot = require('bcryptjs');
const mysql = require('mysql');
const session = require('express-session');
const router = express.Router();

const connection = mysql.createPool({
	host:		process.env.DB_HOST,
	user:		process.env.DB_USER,
	password:	process.env.DB_PASS,
	database:	process.env.DB_NAME
});

/*
* USER ROLES
* 	1: USER
*	2: Unknown
*	3: ADMIN
*
*	In the sesion data, they are stored as strings of their name
*/

// Check if the user is logged in
function IS_LOGGED_IN(req, res, next) {
	if (req.session.user) {
		return next();
	} else {
		res.status(401).send('ERROR: Unauthorized request. Please log in.')
	}
	// MIGHT be a 403, but this isnt really a significant difference to my understanding
	// This is a 401 because it refers to a lack of authentication, while 403 is about the
	// absense of credentials after authentication.
	// https://seranking.com/blog/401-vs-403-error-codes/#:~:text=Both%20the%20401%20and%20403,permissions%20to%20access%20a%20resource.
	// ^ in the "What are the Similarities Between 403 and 401 Status Codes?" section
}

// Check if the user is an Admin
function IS_ADMIN(req, res, next) {
	if (req.session.user && req.session.user.user_agent === 'admin') {
		return next();
	} else {
		res.status(403).send('ERROR: Forbidden. Admin access only.')
	}
}

// Check if the user is a User
function IS_USER(req, res, next) {
	if (req.session.user && req.session.user.user_agent === 'user') {
		return next();
	} else {
		res.status(403).send('ERROR: Forbidden. User access only.')
	}
}

// Check if the user is an OPTION 2
function IS_2(req, res, next) {
	if (req.session.user && req.session.user.user_agent === '2') {
		return next();
	} else {
		res.status(403).send('ERROR: Forbidden. User-Role ID 2 access only.')
	}
	// I am not too certain what this is exactly, but I saw the option for a user role
	// of 2 in the database, so this can be updated if we use this role in the future
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

module.exports = { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT, IS_2, IS_A_TEAPOT };