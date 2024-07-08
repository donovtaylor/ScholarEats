/*

THIS FILE HAS BEEN MERGED WITH recipeRoutes.js
NO LONGER IN USE, EDWARD MCDONALD WILL DELETE WHEN SAFE

*/

const express = require('express');
const mysql = require('mysql');
const router = express.Router();

// Fix with actual DB
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

// Generate recommended recipes based on available ingredients
function generateRecommendedRecipes(callback) { // Update parameter
    const getAvailableIngredientsQuery = `SELECT ingredient_id FROM store WHERE quantity > 0`;

    connection.query(getAvailableIngredientsQuery, (err, ingredientResults) => {
        if (err) {
            console.error('Error fetching available ingredients:', err);
            return callback(err, null);
        }

        const availableIngredientIds = ingredientResults.map(row => row.ingredient_id);

        if (availableIngredientIds.length === 0) {
            return callback(null, { message: 'No ingredients available' });
        }

        const getRecipeIdsQuery = `
            SELECT recipe_id
            FROM recipe_ingredient
            WHERE ingredient_id IN (?)
            GROUP BY recipe_id
            HAVING COUNT(*) = (
                SELECT COUNT(*)
                FROM recipe_ingredient ri
                WHERE ri.recipe_id = recipe_ingredient.recipe_id
            )
        `;

        connection.query(getRecipeIdsQuery, [availableIngredientIds], (err, recipeIdResults) => {
            if (err) {
                console.error('Error fetching recipe IDs:', err);
                return callback(err, null);
            }

            if (recipeIdResults.length === 0) {
                return callback(null, { message: 'No recipes can be made with available ingredients' });
            }

            const recipeIds = recipeIdResults.map(row => row.recipe_id);

            const getRecipesQuery = `SELECT * FROM recipes WHERE id IN (?)`;

            connection.query(getRecipesQuery, [recipeIds], (err, recipeResults) => {
                if (err) {
                    console.error('Error fetching recipes:', err);
                    return callback(err, null);
                }

                callback(null, recipeResults);
            });
        });
    });
};

// Route for generating recommended recipes
router.get('/generateRecommendedRecipes', (req, res) => {
    generateRecommendedRecipes((err, recommendedRecipes) => {
        if (err) {
            return res.status(500).json({ error: 'Error generating recommended recipes' });
        }
        res.json(recommendedRecipes);
    });
});

module.exports = { generateRecommendedRecipes };