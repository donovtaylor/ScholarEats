const express = require('express');
const mysql = require('mysql');
const router = express.Router();

// Fix these when connecting to the actual db
const connection = mysql.createConnection({
    host: 'your-database-host',
    user: 'your-database-user',
    password: 'your-database-password',
    database: 'your-database-name'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
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