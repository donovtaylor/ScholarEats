const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const path = require('path');
const exphbs = require('express-handlebars'); // Import express-handlebars
const app = express();

//Middleware Functions to parse json
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// Going to need to create a .env file for this.
// If you are in your local machine, edit these host, user, password, and database for your needs
const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'student',
    password: 'student',
    database: 'testdb'
});

//Checking if the database is connected
pool.getConnection( (err)=> {
    if (err) throw (err)
    console.log ("DB connected successful!")
})

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;


    // Checks if the email/username is already in the database
    pool.query('SELECT * FROM users WHERE email = ? OR username = ?',[email, username], (err,results) => {
        if (results.length > 0) {
            return res.send('Email or username already taken');
        }
    });


    // Hashes the password using bcrypt
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return (err);
        }
        // We insert the information that was given into the database
        pool.query('INSERT INTO users (user_id, email, username, password) VALUES (UUID(), ?, ?, ?)', [email, username, hash], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return (err);
            }
            res.send('User registered successfully');
        });
    });
});



// Serve static files from the 'website' directory (for existing HTML files)
app.use(express.static(path.join(__dirname, 'website/pages')));

// Middleware to configure Handlebars
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views')); // Specify the directory for Handlebars views

// Example route using Handlebars (not converting existing HTML)
app.get('/example', (req, res) => {
    // Render a Handlebars template
    res.render('example', { title: 'Handlebars Example' });
});

// Add more routes as needed for your existing HTML files
app.get('/', (req, res) => {
    // Serve your existing index.html file
    res.sendFile(path.join(__dirname, 'website/pages', 'index.html'));
});

// 404 Error handling
app.use((req, res, next) => {
    res.status(404).send('404 Page Not Found');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});