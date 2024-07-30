/*****************************************
* Description: Backend methods and routes concerning searchbar suggestion/autocomplete actions and events
*****************************************/

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
let router = express.Router();

// Create connection to the database
const db = mysql.createPool({ // createPool handles multiple connections at once, which could make this faster
	host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
	user: 'admin',
	password: 'vdpE9YYQiaGl6VWibkiO',
	database: 'ScholarEats'
});

// // Connect to the database
// db.connect(err => {
// 	if (err) {
// 		console.error('Error connecting to the database:', err);
// 		process.exit(1);  // Exit the process with an error code
// 	}
// 	console.log('Connected to the database');
// });

// Endpoint to get recipe suggestions
router.get('/', async (req, res) => {

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

	// If the user is not logged in, it should show the first 10 recipes
	let query = `
		SELECT DISTINCT recipe_name
		FROM recipes
		WHERE recipe_name LIKE ?
		LIMIT 10
	`;

    // If the user is logged in
	// This should be the same query as the one in recipeRoutes_BE.js,
	// EXCEPT the first chunk needs to take in the searchTerm
    if (isLoggedIn) {
        query = `
			SELECT DISTINCT r.*
			FROM recipes r
			WHERE r.recipe_id IN (
				SELECT MIN(inner_r.recipe_id)
				FROM recipes inner_r
				GROUP BY inner_r.recipe_name
			)
			AND recipe_name LIKE ?
			AND NOT EXISTS (
				SELECT 1
				FROM recipe_ingredient ri
				WHERE ri.recipe_id = r.recipe_id
				AND ri.ingredient_id NOT IN (
					SELECT s.ingredient_id
					FROM store s
					JOIN university u ON s.university_id = u.university_id
					JOIN users usrs ON usrs.university = u.name
					WHERE quantity > 0 AND usrs.user_id = ?
				)
			)
			LIMIT 10
		`;
    }

	try {

		if (isLoggedIn) { // If youre logged in, you also need to pass your userId
			const [results] = await db.execute(query, [`%${searchTerm}%`, userId]);

			const suggestions = results.map(row => row.recipe_name);
			res.json(suggestions);
			
		} else {
			const [results] = await db.execute(query, [`%${searchTerm}%`]);

			const suggestions = results.map(row => row.recipe_name);
			res.json(suggestions);
		}
	} catch (err) {
		console.error('Error executing query:', err);
		return res.status(500).send('Internal Server Error');
	}
});

module.exports = router;