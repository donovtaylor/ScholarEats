const fetch = require('node-fetch');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { generateRecommendedRecipes } = require('./recipeRoutesGenerator'); // Generates recipes

const router = express.Router();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
    user: 'backend_lead',
    password: 'password',
    database: 'ScholarEats'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Route to display recipes
router.get('/', (req, res) => {
    // Fetch regular recipes
    fetchRecipes((err, recipes) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            return res.status(500).send('Error fetching recipes');
        }

        // Fetch recommended recipes
        generateRecommendedRecipes((err, recommendedRecipes) => {
            if (err) {
                console.error('Error fetching recommended recipes:', err);
                return res.status(500).send('Error fetching recommended recipes');
            }
            
            res.render('partials/partial_recipe', {
                fName: 'Available',
                recipes: recommendedRecipes.length > 0 ? recommendedRecipes : recipes
            });
        });
    });
});

// Function to fetch regular recipes from the database
function fetchRecipes(callback) {
    const query = 'SELECT * FROM recipes';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            return callback(err);
        }
        callback(null, results);
    });
}

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

module.exports = router;