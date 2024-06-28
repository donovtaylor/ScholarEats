const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

/* Sorting Routes */

// Sort recipes by calories (ascending)
app.get('/recipes/sortByCaloriesAsc', (req, res) => {
    const query = 'SELECT * FROM recipes ORDER BY calories ASC';
    executeQuery(query, res);
});

// Sort recipes by calories (descending)
app.get('/recipes/sortByCaloriesDesc', (req, res) => {
    const query = 'SELECT * FROM recipes ORDER BY calories DESC';
    executeQuery(query, res);
});

// Sort recipes by protein (ascending)
app.get('/recipes/sortByProteinAsc', (req, res) => {
    const query = 'SELECT * FROM recipes ORDER BY protein ASC';
    executeQuery(query, res);
});

// Sort recipes by protein (descending)
app.get('/recipes/sortByProteinDesc', (req, res) => {
    const query = 'SELECT * FROM recipes ORDER BY protein DESC';
    executeQuery(query, res);
});

// Sort recipes by fat (ascending)
app.get('/recipes/sortByFatAsc', (req, res) => {
    const query = 'SELECT * FROM recipes ORDER BY fat ASC';
    executeQuery(query, res);
});

// Sort recipes by fat (descending)
app.get('/recipes/sortByFatDesc', (req, res) => {
    const query = 'SELECT * FROM recipes ORDER BY fat DESC';
    executeQuery(query, res);
});

// Sort recipes by fiber (ascending)
app.get('/recipes/sortByFiberAsc', (req, res) => {
    const query = 'SELECT * FROM recipes ORDER BY fiber ASC';
    executeQuery(query, res);
});

// Sort recipes by fiber (descending)
app.get('/recipes/sortByFiberDesc', (req, res) => {
    const query = 'SELECT * FROM recipes ORDER BY fiber DESC';
    executeQuery(query, res);
});

/* Filtering Routes */

// Filter recipes by dietary restrictions
app.get('/recipes/filterByDiet/:restriction', (req, res) => {
    const restriction = req.params.restriction;
    const query = 'SELECT * FROM recipes WHERE dietary_restrictions LIKE ?';
    executeQueryWithParam(query, `%${restriction}%`, res);
});

// Filter recipes by cooking aids required
app.get('/recipes/filterByCookingAids/:aid', (req, res) => {
    const aid = req.params.aid;
    const query = 'SELECT * FROM recipes WHERE cooking_aids LIKE ?';
    executeQueryWithParam(query, `%${aid}%`, res);
});

// Filter recipes by difficulty
app.get('/recipes/filterByDifficulty/:level', (req, res) => {
    const level = req.params.level;
    const query = 'SELECT * FROM recipes WHERE difficulty = ?';
    executeQueryWithParam(query, level, res);
});

/* Helper function to execute SQL query */
function executeQuery(query, res) {
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
}

/* Helper function to execute SQL query with parameter */
function executeQueryWithParam(query, param, res) {
    connection.query(query, param, (err, results) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
}

/* 404 Error handling */
app.use((req, res, next) => {
    res.status(404).send('404 Page Not Found');
});

/* Start server 
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
*/