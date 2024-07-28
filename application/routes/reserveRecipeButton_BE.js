/*****************************************
* Description: send a notification to the admins that a user has
* clicked the "reserve" button on a recipe
*****************************************/

/* MERGING WITH USERROUTES */

const fetch = require('node-fetch');
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

const router = express.Router();

let debug = false; // toggle console debug messages
let noResults = false; // Track if there are recipes available

const connection = mysql.createPool({
	host:		'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
	user:		'backend_lead',
	password:	'password',
	database:	'ScholarEats'
});

function debugMsg(input) { // Use this for debug messages, I got tired of doing a ton of if (debug) statements
	if (debug) {
		console.log(input);
	}
}

// Action listener for the reserve button
document.addEventListener(IS_LOGGED_IN, () => {
	const reserveButton = document.getElementById('reserveRecipeButton');

	if (reserveButton) {

		debugMsg("Reserving recipe...")

		const userId = req.session.user.userId; // user ID

		// get the username and university of the logged in user
		const userInfoQuery = `
			SELECT username, university
			FROM users
			WHERE user_id = ?
		`;
		const [userInfo] = await connection.execute(userInfoQuery, [userId]);

		if (userInfo.length === 0) {
			return res.status(400).json({ error: 'Error: User not found. Try logging out and logging back in.' })
		}

		const { username, university } = userInfo[0];

		let adminId;

		// Searches the User table, but since we also have an admin table it will also search that
		const adminInfoQuery = `
			SELECT user_id
			FROM users
			WHERE role_id = 3
			AND university = ?
		`;
		const [adminInfo] = await connection.execute(adminInfoQuery, [university]);

		if (adminInfo.length === 0) { // If the user isn't in the user table, it is probably in the admin table
			console.log("admin not found in users table, searching admin table");

			const adminTableInfoQuery = `
				SELECT user_id
				FROM admin
				WHERE role_id = 3
				AND university = ?
			`;
			const [] = await connection.execute(adminTableInfoQuery, [univeristy]);

			if (adminTableInfo.length === 0) {
				return res.status(400).json({ error: 'Error: Could not reserve recipe.' })
			} else {
				adminId = adminTableInfo[0].user_id;
			}
		} else {

			adminId = adminInfo[0].user_id;

			// Push a notifiation to the admins
			const message = `${username} has reserved ${recipe.recipe_name}`;

			pushNotificaionQuery = `
				INSERT INTO notifications (user_id, message) VALUES (?, ?)
            `; // UPDATE FOR UNIVERSITY

			await connection.execute(pushNotificaionQuery, [adminId, message])

			debugMsg("Recipe reserved.")

			return res.json({ message: 'Successfully reserved recipe!' });
		}
	}
});