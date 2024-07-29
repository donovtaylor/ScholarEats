/*****************************************
* Description: Backend methods and routes concerning searchbar suggestion/autocomplete actions and events
*****************************************/

const express = require('express');
const mysql = require('mysql2');
const path = require('path');
let router = express.Router();

// Create connection to the database
const db = mysql.createConnection({
	host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
	user: 'admin',
	password: 'vdpE9YYQiaGl6VWibkiO',
	database: 'ScholarEats'
});

// Connect to the database
db.connect(err => {
	if (err) {
		console.error('Error connecting to the database:', err);
		process.exit(1);  // Exit the process with an error code
	}
	console.log('Connected to the database');
});

// Endpoint to get recipe suggestions
router.get('/', (req, res) => {

    let isLoggedIn = false;
    let userId = -1;

    try { // Check if the user is logged in and get the id
        if (req.session.user) {
            isLoggedIn = true;
			userId = req.session.user.userId; // ID of the logged in user
        }
    }  catch (err) {
		console.log('User is logged out');
	}
	
	const searchTerm = req.query.q;
	if (!searchTerm) {
		return res.status(400).send('Missing query parameter');
	}

	let query = `
		SELECT DISTINCT recipe_name
		FROM recipes
		WHERE recipe_name LIKE ?
		LIMIT 10
	`;

    // If the user is logged in
    if (isLoggedIn) {
        query = `
			SELECT DISTINCT r.*
			FROM recipes r
			WHERE r.recipe_id IN (
				SELECT MIN(inner_r.recipe_id)
				FROM recipes inner_r
				GROUP BY inner_r.recipe_name
			)
			AND NOT EXISTS (
				SELECT 1
				FROM recipe_ingredient ri
				WHERE ri.recipe_id = r.recipe_id
				AND ri.ingredient_id NOT IN (
					SELECT s.ingredient_id
					FROM store s
					JOIN university u ON s.university_id = u.university_id
					JOIN users usrs ON usrs.university = u.name
					WHERE quantity > 0 AND usrs.user_id = ${userId}
				)
			)
			LIMIT 10
		`;
    }

	db.query(query, [`%${searchTerm}%`], (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			return res.status(500).send('Internal Server Error');
		}

		const suggestions = results.map(row => row.recipe_name);
		res.json(suggestions);
	});
});

module.exports = router;