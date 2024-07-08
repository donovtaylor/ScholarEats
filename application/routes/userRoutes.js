const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const router = express.Router();

// Fix these when connecting to the actual db
const connection = mysql.createPool({
    host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
    user: 'backend_lead',
    password: 'password',
    database: 'ScholarEats'
});

// Function to automatically enroll users in university programs based on email domain
function autoEnrollUniversityPrograms(email) {
    return new Promise((resolve, reject) => {
      const domain = email.split('@')[1];
      const query = `
        UPDATE users 
        SET university = (SELECT uni FROM university WHERE email_domain = ?),
            verification_status = TRUE
        WHERE email = ?
      `;
      pool.query(query, [domain, email], (err, results) => {
        if (err) {
          console.error('Error enrolling user in university program:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
  
  // Handle registration POST request
  router.post('/register', (req, res) => {
    const { username, email, password, verify_password } = req.body;
  
    // Check if passwords match
    if (password !== verify_password) {
      return res.send('Passwords do not match');
    }
  
    // Check if email or username already exists
    pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).send('Database error');
      }
      if (results.length > 0) {
        return res.send('Email or username already taken');
      }
  
      // Hash the password
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).send('Error hashing password');
        }
  
        // Insert user into database
        pool.query('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hash], (err, result) => {
          if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).send('Error inserting user');
          }
  
          // Automatically enroll user in university programs based on email domain
          autoEnrollUniversityPrograms(email)
            .then(() => {
              res.send('User registered successfully');
            })
            .catch((err) => {
              console.error('Error auto-enrolling user:', err);
              res.status(500).send('Error auto-enrolling user');
            });
        });
      });
    });
  });
  
  module.exports = router;