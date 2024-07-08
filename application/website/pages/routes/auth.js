const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const router = express.Router();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'student',
    password: 'student',
    database: 'testdb'
});


router.post('/register', (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ success: false, message: 'Error hashing password' });
        pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (error) => {
            if (error) return res.status(500).json({ success: false, message: 'Error registering user' });
            res.json({ success: true, message: 'User registered successfully' });
        });
    });
});

module.exports = router;