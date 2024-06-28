const express = require('express');
const mysql = require('mysql');
const router = express.Router();

// Fix with actual DB
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

// Generate recommended recipes based on available ingredients
router.get('/generateRecommendedRecipes', (req, res) => {
    const query = `
        SELECT DISTINCT r.recipe_id, r.recipe_name, r.ingredients
        FROM recipes r
        INNER JOIN store s ON FIND_IN_SET(s.ingredientID, r.ingredients)
        GROUP BY r.recipe_id, r.recipe_name, r.ingredients
        HAVING COUNT(s.ingredientID) = SUM(s.quantity_available > 0)
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error generating recommended recipes:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

module.exports = router;