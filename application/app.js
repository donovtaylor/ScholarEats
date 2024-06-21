const express = require('express');
const mysql = require('mysql');
const path = require('path');
const exphbs = require('express-handlebars'); // Import express-handlebars

const app = express();

// Going to need to create a .env file for this, need to rename this
const pool = mysql.createPool({
    host: 'localhost',
    user: 'student',
    password: 'student',
    database: 'testdb'
});

// Queries all users from the database and outputs it to console
pool.query('SELECT * FROM users',(err, results)=>{
    if(err){
        return console.error(err.message);
    }
    console.log(results)
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