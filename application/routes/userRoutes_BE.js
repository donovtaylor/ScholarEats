const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const router = express.Router();
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

// Fix these when connecting to the actual db
const connection = mysql.createPool({
  host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
  user: 'backend_Devop',
  password: 'password',
  database: 'ScholarEats'
});


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Function to automatically enroll users in university programs based on email domain
function autoEnrollUniversityPrograms(email) {
  return new Promise((resolve, reject) => {
    const domain = email.split('@')[1];
    const query = `
        UPDATE Users 
        SET university = (SELECT name FROM university WHERE email_suffix = ?),
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
router.post('/register',IS_LOGGED_OUT, (req, res) => {
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

router.post('/login', IS_LOGGED_OUT, async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const isAdminLogin = req.body.password;
  try {

    const [results] = await connection.execute('SELECT * FROM Users WHERE username = ?', [username]);
    // Check if user exists
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid Username or Password' });
    }
    const user = results[0];
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Username or Password' });
    }
    
    const [sessionResults] = await connection.execute('SELECT * FROM sessions WHERE user_id = ? AND session_end IS NULL', [user.uuid]);
    
    role = 'user;'
    if (Number(user.role_id) === 0) {
      role = 'admin';
    }

    req.session.user = {
      email: user.email,
      username: user.username,
      uuid: user.uuid,
      sessionStart: new Date(),
      userId: user.user_id,
      role: role
    };

    
    await connection.execute('INSERT INTO sessions (session_id, user_id, session_start, expires, user_agent) VALUES (?, ?, ?, ?, ?)', [req.session.id, req.session.user.uuid, req.session.user.sessionStart, new Date(Date.now() + (24 * 60 * 60 * 1000)), role])
    return res.json({ message: 'Logged In Successfully' });
  } catch (err) {

    return res.json({error: err});
  
  }
});


router.post('/logout', (req, res) => {
  if (req.session) {
    connection.query('UPDATE sessions SET session_end = ? WHERE session_id = ?', [new Date(), req.session.id], (err) => {
      if (err) {
        return err;
      }
    });

    req.session.destroy((err) => {
      if (err) {
        return err;
      }
      return res.send('Logged Out Successfully');
    });
  }
});

router.post('/change-password', IS_LOGGED_IN, (req, res) => {
  const newPass = req.body.newPass;
  const currentPass = req.body.currentPass;
  const confirmPass = req.body.confirmPass;

  connection.query('SELECT * FROM Users WHERE username = ?', [req.session.user.username], (err, results) => {
    if (err) {
      return err;
    }
    const user = results[0];
    bcrypt.compare(currentPass, user.password_hash, (err, isMatch) => {
      if (err) {
        return err;
      }
      if (!isMatch) {
        return res.send("Incorrect Password");
      }

      if (newPass != confirmPass) {

        return res.send("Password Doesn't Match")
      }

      bcrypt.hash(newPass, 10, (err, hash) => {
        if (err) {
          return err;
        }

        connection.query("UPDATE Users SET password_hash = ? WHERE username = ?", [hash, req.session.user.username], (err, result) => {
          if (err) {
            return err;
          }
          res.send("successfully changed password!");
        });
      });
    });


  });
});

router.post("/change-username", IS_LOGGED_IN, (req, res) => {

  const newUsername = req.body.newUsername;
  console.log(newUsername);
  //console.log("Request body:", req.body);
  //console.log("Session:", req.session);
  connection.query("SELECT * FROM Users where Username = ?", [newUsername], (err, results) => {
    if (err) {
      return err;
    }
    if (results.length > 0) {
      return res.send("Username is already taken");
    }
    connection.query("UPDATE Users SET username = ? WHERE email = ?", [newUsername, req.session.user.email], (err, result) => {
      console.log(req.session.user.email);
      console.log(req.session.user.username);
      if (err) {
        return err;
      }
      req.session.user.username = newUsername;
      return res.send("successfully changed username!");
    });
  });

});

router.post("/set-allergies", IS_LOGGED_IN, (req, res) => {
  const allergies = req.body.allergies;
  const userId = req.session.user.userId;

  console.log(allergies);
  const allergiesJoin = allergies.join(',');
  console.log(allergiesJoin);

  connection.query("UPDATE user_info SET allergies = ? WHERE user_id = ?", [allergiesJoin, userId], (err, result) => {
    if (err) {
      return err;
    }
    res.send("Successfully updated allergies");
  });
});

router.post("/set-dietary-restrictions", IS_LOGGED_IN, (req, res) => {
  const dietary_restrictions = req.body.dietary_restrictions;
  const userId = req.session.user.userId;
  console.log(dietary_restrictions);
  const dietaryRestrictionsJoin = dietary_restrictions.join(',');
  console.log(dietaryRestrictionsJoin);

  connection.query("UPDATE user_info SET dietary_restrictions = ? WHERE user_id = ?", [dietaryRestrictionsJoin, userId], (err, result) => {
    if (err) {
      return err;
    }
    res.send("Successfully updated dietary_restrictions");
  });
});


module.exports = router;