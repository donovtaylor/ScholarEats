const fetch = require('node-fetch');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

const router = express.Router();

let debug = true; // toggle console debug messages

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

// Rendering recipes dynamically from the database
router.get('/', (req, res) => {
    var dropdownFilters = req.app.locals.dropdownFilters;

    // Recipes
    const recipeQuery = `
        SELECT DISTINCT r.*
        FROM recipes r
        WHERE r.recipe_id IN (
        SELECT MIN(inner_r.recipe_id)
        FROM recipes inner_r
        GROUP BY inner_r.recipe_name
        )
        AND NOT EXISTS (
            SELECT 1
            FROM recipe_ingredient ri
            WHERE ri.recipe_id = r.recipe_id
            AND ri.ingredient_id NOT IN (
                SELECT ingredient_id
                FROM store
                WHERE quantity > 0
            )
        )
        ORDER BY r.recipe_name DESC
        LIMIT 3
    `;

    // Ingredients
    const ingredientsQuery = `
        SELECT s.ingredient_id, s.quantity, i.name, i.img_src
        FROM store s
        JOIN ingredient i ON s.ingredient_id = i.ingredient_id
        LIMIT 3
    `;

    connection.query(recipeQuery, (err, recipeResults) => {
        if (err){
            console.error('Error fetching recipes');
            return res.status(500).send('Error fetching recipes');
        }
        
        connection.query(ingredientsQuery, (err, ingredientsResults) => {
            if (err){
                console.error('Error fetching ingredients');
                return res.status(500).send('Error fetching ingredients');
            }

            res.render('landingpage', {
                style: ['default.css', 'landingpage.css'],
                script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
                dropdown1: dropdownFilters,
                recipes: recipeResults,
                ingredients: ingredientsResults,
                title: 'Landing Page'
            });
        });
    });

});

/* 404 Error handling */
router.use((req, res, next) => {
    res.status(404).send('404 Page Not Found');
});

module.exports = router;
