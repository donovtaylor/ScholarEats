const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const path = require('path');
const exphbs = require('express-handlebars');
const recipeRoutes = require('./routes/recipeRoutes'); // Make sure this path is correct
const app = express();

//Middleware Functions to parse json
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
  }));


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



app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    pool.query('SELECT * FROM users WHERE email = ?',[email], (err,results)=>{
        if (err){
            return err;
        }
        if (results.length == 0){
            console.log("Invalid Email or Password");
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) =>{
            if (err){
                return err;
            }
            if(!isMatch){
                return res.send("Invalid Email or Password");
            }
            req.session.user = { email: user.email, username: user.username };
            res.send("logged in!");
            
        });

    })
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return err;
        }
        // Clear the session cookie
        res.clearCookie('connect.sid'); 
        res.json({ message: 'Logged out successfully' });
    });
});

// Displays the status wheter if we are logged in or not.
app.get('/status', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
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

// Serve the main index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website/pages', 'index.html'));
});

// Use the recipe routes
// app.use('/recipes', recipeRoutes);

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