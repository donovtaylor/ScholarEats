const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;  // Use a single port for both frontend and backend

app.use(cors());  // Enable CORS for all routes

// Create connection to the database
const db = mysql.createConnection({
    host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'vdpE9YYQiaGl6VWibkiO',
    database: 'ScholarEats'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);  // Exit the process with an error code
    }
    console.log('Connected to the database');
});

// Serve static files from the 'application/views/partials' directory
app.use(express.static(path.join(__dirname, '../views/partials')));

// Endpoint to get recipe suggestions
app.get('/suggestions', (req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) {
        return res.status(400).send('Missing query parameter');
    }

    const query = `
        SELECT name
        FROM recipes
        WHERE name LIKE ?
        LIMIT 10
    `;

    db.query(query, [`%${searchTerm}%`], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Internal Server Error');
        }

        const suggestions = results.map(row => row.name);
        res.json(suggestions);
    });
});

// Serve the index.html file for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/partials', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
