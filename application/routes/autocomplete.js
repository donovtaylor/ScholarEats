/*****************************************
* Description: Backend methods and routes concerning searchbar suggestion/autocomplete actions and events
*****************************************/

const express = require('express');
const mysql = require('mysql2');
const path = require('path');
let router = express.Router();

// Create connection to the database
const db = require('./db');

// Endpoint to get recipe suggestions
router.get('/', async (req, res) => {
  const searchTerm = req.query.q;
  if (!searchTerm) {
      return res.status(400).send('Missing query parameter');
  }

  const query = `
      SELECT recipe_name
      FROM recipes
      WHERE recipe_name LIKE ?
      LIMIT 10
  `;

  try {
      const [results] = await db.execute(query, [`%${searchTerm}%`]);

      const suggestions = results.map(row => row.recipe_name);
      res.json(suggestions);
  } catch (err) {
    console.error('Error executing query:', err);
    return res.status(500).send('Internal Server Error');
} ;
});

module.exports = router;