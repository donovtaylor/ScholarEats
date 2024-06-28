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

// Automatically enroll users in corresponding university food programs
router.get('/autoEnrollUniversityPrograms', (req, res) => {
    const query = `
        UPDATE user_info 
        INNER JOIN university ON SUBSTRING_INDEX(user_info.email, '@', -1) = university.email
        SET user_info.university = university.uni, user.verification_status = TRUE
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error enrolling users in university programs:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Users enrolled in university programs successfully' });
    });
});

module.exports = router;