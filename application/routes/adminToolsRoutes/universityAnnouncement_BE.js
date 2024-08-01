const express = require('express');
const db = require('../db');
const router = express.Router();
const expiredProductsRoutes = require('./expiredProducts');
const dotenv = require('dotenv').config();
const mysql = require('mysql2/promise');

const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');

const connection = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

// Inventory Management page
router.get('/', IS_ADMIN, async (req, res) => {
	const userId = req.session.user.userId;

	const universityIdQuery = `
			SELECT u.name
			FROM users AS usrs
			JOIN university AS u
			ON usrs.university = u.name
			WHERE usrs.user_id = ?
		`;
	const [universityRow] = await connection.execute(universityIdQuery, [userId]);

	const universityName = universityRow[0].name;
	console.log(`Uni name: ${universityName}`);

	res.render('adminToolsViews/universityAnnouncement', {
		university: universityName
	});
});

// Route to add an ingredient to the store
router.post('/announce', IS_ADMIN, async (req, res) => {
	const { message } = req.body;
	try {

		const userId = req.session.user.userId;

		const universityIdQuery = `
			SELECT u.university_id
			FROM users AS usrs
			JOIN university AS u
			ON usrs.university = u.name
			WHERE usrs.user_id = ?
		`;
		const [universityRow] = await connection.execute(universityIdQuery, [userId]);

		const universityId = universityRow[0].university_id;

		console.log(universityId);

		const notificaionQuery = `
			INSERT INTO notifications (user_id, university, message) VALUES (?, ?, ?)
		`;

		await connection.execute(notificaionQuery, [userId, universityId, message]);

		return res.json({ message: 'Successfully sent a university-wide announcement!' });

	} catch (err) {
		console.error('There was an error making your announcement:', err);
		req.flash('error_msg', 'There was an error making your announcement');
		res.redirect('/adminTools/inventory-management/add');
	}
});

module.exports = router;