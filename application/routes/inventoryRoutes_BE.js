const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

const router = express.Router();
const app = express();

// Fix these when connecting to the actual db
const connection = mysql.createConnection({
    host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
    user: 'backend_lead',
    password: 'password',
    database: 'ScholarEats'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Populate available food and serve Ingredients page
router.get('/', (req, res) => {
    var dropdownFilters = req.app.locals.dropdownFilters;
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

    // if the user is logged out
    let query = `
        SELECT s.ingredient_id, s.quantity, i.name, i.img_src
        FROM store s
        JOIN ingredient i ON s.ingredient_id = i.ingredient_id
    `;

    // If the user is logged in
    if (isLoggedIn) {
        query = `
            SELECT s.ingredient_id, s.quantity, i.name, i.img_src
            FROM store s
            JOIN ingredient i ON s.ingredient_id = i.ingredient_id
            JOIN university u ON s.university_id = u.university_id
            JOIN users usrs ON usrs.university = u.name
            WHERE usrs.user_id = ${userId}
        `;
    }

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching ingredients:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        const ingredients = results.map(row => ({
            src: row.img_src,
            alt: 'ingredient.jpg',
            name: row.name,
            desc: `Quantity: ${row.quantity}`
        }));

        res.render('ingredients', {
            style: ['default.css', 'ingredients.css'],
            dropdown1: dropdownFilters,
            title: 'Ingredients',
            script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
            ingredient: ingredients
        });
    });
});

// Update expired status of food items
router.get('/checkExpired', (req, res) => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const query = 'UPDATE store SET expired = TRUE WHERE expiration_date <= ?';
    connection.query(query, [currentDate], (err, results) => {
        if (err) {
            console.error('Error updating expired status:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Expired items updated successfully' });
    });
});

// Remove items that are out of stock
router.get('/checkOutOfStock', (req, res) => {
    const query = 'DELETE FROM store WHERE quantity_available <= 0';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error removing out of stock items:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Out of stock items removed successfully' });
    });
});

module.exports = router;