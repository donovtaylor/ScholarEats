/*****************************************
* Description: Backend methods and routes concerning inventory-related actions and events
*****************************************/

const express = require('express');
const bodyparser = require('body-parser');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2/promise');
const connection = require('./db');
const router = express.Router();
const app = express();

function debugMsg (input) { // Use this for debug messages, I got tired of doing a ton of if statements
	if (debug) {
		console.log(input);
	}
}

// populate available food and serve ingredients page
router.get('/', async (req, res) => {
    var dropdownFilters = req.app.locals.dropdownFilters;

    var styles = ['default.css', 'ingredients.css'];

    if (res.locals.isLoggedIn) {
      if (req.session.user.mode == 'darkmode') {
        styles.push('darkmode.css');
      } else {
        if (styles.find((e) => e == 'darkmode.css')) {
          styles.splice(styles.indexOf('darkmode.css'), 1);
        }
      }
    }

    let isLoggedIn = false;
    let userId = -1 // "You have to initialize this variable, or you're gonna have a bad time" - That one guy from south park
                    // -1 is an invalid userId, but this shouldnt matter because the userId is only used when a user is logged in,
                    // and then the ID is immedietely changed into the actual userID
    try {
        if (req.session.user) { // Check if the user is logged in and get info
            isLoggedIn = true;
            userId = req.session.user.userId; // ID of logged in user
        }
    } catch (err) {
        debugMsg(`User is LOGGED OUT`)
    }

    // if the user is logged out
    let ingredientQuery = `
        SELECT i.*
        FROM ingredient i
    `;

    // if the user is logged out
    if (isLoggedIn) {
        ingredientQuery = `
            SELECT DISTINCT s.ingredient_id, s.quantity, i.*
            FROM store s
            JOIN ingredient i ON s.ingredient_id = i.ingredient_id
            JOIN university u ON s.university_id = u.university_id
            JOIN users usrs ON usrs.university = u.name
            WHERE usrs.user_id = ?
        `;
  }

    // If the user is logged in
    try {
        if (isLoggedIn) {
            const [results] = await connection.execute(ingredientQuery, [userId]); // Includes userId, would throw an error if logged out

            const ingredients = results.map(row => ({
                src:    row.img_src,
                alt:    'ingredient.jpg',
                name:   row.name,
                desc:   `Quantity: ${row.quantity}`
            }));

            res.render('ingredients', {
                style:      styles,
                dropdown1:  dropdownFilters,
                title:      'Ingredients',
                script:     ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
                ingredient: ingredients
            });

        // If the user is logged out
        } else {
            const [results] = await connection.execute(ingredientQuery);

            const ingredients = results.map(row => ({
                src:    row.img_src,
                alt:    'ingredient.jpg',
                name:   row.name,
                desc:   ``
            }));

            res.render('ingredients', {
                style:      styles,
                dropdown1:  dropdownFilters,
                title:      'Ingredients',
                script:     ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
                ingredient: ingredients
            });
        }
    } catch (err) {
        console.error('Error fetching ingredients:', err);
        return res.status(500).send('Error fetching ingredients');
    }

})

module.exports = router;