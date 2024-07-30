/*****************************************
* Description: Backend methods and routes concerning notification-related actions and events
*****************************************/

// reverse notification population

const express = require('express');
const mysql = require('mysql2/promise');
const path = require("path");
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

const router = express.Router();
router.use(express.json());

const connection = require('./db');

router.get('/', async (req, res) => {
	var dropdownFilters = req.app.locals.dropdownFilters;
	let isLoggedIn = false;


	if (req.session.user) {
		isLoggedIn = true;
	}

	if (isLoggedIn) {
		try {

			let query = `
				SELECT *
				FROM notifications
				WHERE user_id = ?
				ORDER BY timestamp ASC
			`;

			const userId = req.session.user.userId;

			const [results] = await connection.execute(query, [userId]);

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
			return res.status(400).send({error: 'Error fetching notifications'});
		}
	} else {

		const notifications = {
			message: `Please log in`,
		};

		res.render('notifications', {
			script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
			style: ['default.css', 'notifications.css'],
			dropdown1: dropdownFilters,
			notification: notifications,
			title: 'Notifications'
		});
	}
});

/* 404 Error handling */
router.use((req, res, next) => {
	res.status(404).send('404 Page Not Found');
});

module.exports = router;