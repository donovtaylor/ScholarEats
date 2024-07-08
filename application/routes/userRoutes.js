const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const router = express.Router();

// Fix these when connecting to the actual db
const connection = mysql.createPool({
    host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
    user: 'backend_Devop',
    password: 'password',
    database: 'ScholarEats'
});

router.use(express.json());
router.use(express.urlencoded({extended: true}));


// Function to automatically enroll users in university programs based on email domain
function autoEnrollUniversityPrograms(email) {
    return new Promise((resolve, reject) => {
      const domain = email.split('@')[1];
      const query = `
        UPDATE Users 
        SET university = (SELECT university FROM university WHERE email_suffix = ?),
            verification_status = TRUE
        WHERE email = ?
      `;
      connection.query(query, [domain, email], (err, results) => {
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
    connection.query('SELECT * FROM Users WHERE email = ? OR username = ?', [email, username], (err, results) => {
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
        connection.query('INSERT INTO Users (uuid ,email, username, password_hash) VALUES (UUID(),?, ?, ?)', [email, username, hash], (err, result) => {
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

  router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    // Query to find user based on email
    connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).send('Database error');
      }
      
      // Check if user exists
      if (results.length === 0) {
        return res.send('Invalid Email or Password');
      }
      
      const user = results[0];
  
      // Compare password with hashed password in database
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).send('Authentication error');
        }
        
        if (!isMatch) {
          return res.send('Invalid Email or Password');
        }
  
        // Store user data in session upon successful login
        req.session.user = { email: user.email, username: user.username };
        res.send('Logged in successfully!');
        res.redirect('/');
      });
    });
  });


  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return err;
        }
        // Clear the session cookie
        res.clearCookie('connect.sid'); 
        res.json({ message: 'Logged out successfully' });
    });
  });

  router.post('/change-password',(req, res) =>{
    const newPass = req.body.newPass;
    const currentPass = req.body.currentPass;
    const confirmPass = req.body.confirmPass;
  
    connection.query('SELECT * FROM users WHERE username = ?', [req.session.user.username], (err, results) => {
        if (err) {
            return err;
        }
        const user = results[0];
        bcrypt.compare(currentPass, user.password, (err, isMatch) =>{
            if (err){
                return err;
            }
            if (!isMatch){
                return res.send("Incorrect Password");
            }
  
            if(newPass != confirmPass){
        
                return res.send("Password Doesn't Match")
            }
  
            bcrypt.hash(newPass, 10, (err, hash) => {
                if (err){
                    return err;
                }
            
                connection.query("UPDATE users SET password = ? WHERE username = ?", [hash, req.session.user.username], (err, result) =>{
                    if (err){
                        return err;
                    }
                    res.send("successfully changed password!");
                });
            });
        });
  
  
    });
  });

  // NOTE: NEED TO ADD A CHECK IF THE USERNAMEIS TAKEN OR NOT
  router.post("/change-username",(req, res) =>{

  const newUsername = req.body.newUsername;
  //console.log("Request body:", req.body);
  //console.log("Session:", req.session);

  connection.query("UPDATE users SET username = ? WHERE email = ?", [newUsername, req.session.user.email], (err, result) => {
      if (err){
          return err;
      }
      req.session.user.username = newUsername;
      res.send("successfully changed username!");
  });
});
  
  module.exports = router;