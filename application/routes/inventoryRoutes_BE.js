const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const router = express.Router();

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

// // Populate available food DUMMY INFO FOR TESTING
// // serve Ingredients page
// router.get('/', (req, res) => {
//     res.render('ingredients', {
//       style: ['default.css', 'ingredients.css'],
//       title: 'Ingredients',
//       ingredient: [{
//         src: '/images/icon_orange.png',
//         alt: 'potato.jpg',
//         name: 'potato',
//         desc: 'lorem ipsum',
//       },
//       {
//         src: '/images/icon_orange.png',
//         alt: 'potato.jpg',
//         name: 'potato',
//         desc: 'lorem ipsum',
//       }]
//     });
//   });

// Populate available food
// serve Ingredients page
router.get('/', (req, res) => {
    const query = `
        SELECT s.ingredient_id, s.quantity, i.name
        FROM store s
        JOIN ingredient i ON s.ingredient_id = i.ingredient_id
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching ingredients:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        const ingredients = results.map(row => ({
            src: '/images/icon_orange.png',
            alt: 'ingredient.jpg',
            name: row.name,
            desc: `Quantity: ${row.quantity}`
        }));

        res.render('ingredients', {
            style: ['default.css', 'ingredients.css'],
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