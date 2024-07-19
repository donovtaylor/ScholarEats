const fetch = require('node-fetch');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

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

// Rendering recipes dynamically from the database
router.get('/', (req, res) => {
  var dropdownFilters = req.app.locals.dropdownFilters;
  const { dietary_restriction, cooking_aid, sort, searchInput, filter_options } = req.query;

  // Extract the checkbox data
  const difficulties = Object.keys(req.query).filter(key => ['Easy', 'Medium', 'Hard'].includes(key) && req.query[key] === 'on');
  const dietaryRestrictions = Object.keys(req.query).filter(key => ['Vegan', 'Keto', 'Halal', 'Vegetarian', 'Pescatarian', 'Kosher'].includes(key) && req.query[key] === 'on');
  const cookingAids = Object.keys(req.query).filter(key => ['Oven Required','Stove Required'].includes(key) && req.query[key] === 'on');
  
  const sortOptions = {
    'Calories Ascending': 'calories_ASC',
    'Calories Descending': 'calories_DESC',
    'Protein Ascending': 'protein_ASC',
    'Protein Descending': 'protein_DESC',
    'Fat Ascending': 'fat_ASC',
    'Fat Descending': 'fat_DESC',
    'Fiber Ascending': 'fiber_ASC',
    'Fiber Descending': 'fiber_DESC'
  };

/*
Please dont touch this query unless absolutely necessary, SQL is hard and this chunk is fragile!

This query gets all of the reipes that can be made just with what is available in the inventory.
It also filters out duplicate recipes, becuase there are currently about 4 copies of each recipe
in the "recipes" table. Additionally, the column "Unnamed: 0" represents the recipe ID, and this
name is expeced to change.
*/
let query = `
    SELECT DISTINCT r.*
    FROM recipes r
    WHERE r.\`Unnamed: 0\` IN (
      SELECT MIN(inner_r.\`Unnamed: 0\`)
      FROM recipes inner_r
      GROUP BY inner_r.recipe_name
    )
    AND NOT EXISTS (
        SELECT 1
        FROM recipe_ingredient ri
        WHERE ri.recipe_id = r.\`Unnamed: 0\`
        AND ri.ingredient_id NOT IN (
            SELECT ingredient_id
            FROM store
            WHERE quantity > 0
        )
    )
  `;

  let queryParams = [];

  // Query parameters, dynamically changes the URL

  if (dietaryRestrictions.length > 0) { // Dietary restrictions
    query += ' AND r.`dietary restrictions` IN (' + dietaryRestrictions.map(() => '?').join(', ') + ')';
    queryParams.push(...dietaryRestrictions);
  }

  if (cookingAids.length > 0) { // Cooking aids
    query += ' AND r.`cooking tip` IN (' + cookingAids.map(() => '?').join(', ') + ')';
    queryParams.push(...cookingAids);
  }

  if (difficulties.length > 0) { // Difficulty
    query += ' AND r.`difficulty` IN (' + difficulties.map(() => '?').join(', ') + ')';
    queryParams.push(...difficulties);
  }

  if (searchInput) { // Search
      query += ' AND `recipe_name` LIKE ?';
      queryParams.push(`%${searchInput}%`);
  }

  if (sort) {
    query += ` ORDER BY ${sortOptions[sort]}`;
    // queryParams.push(`%${sort}%`)
  }

  console.log(`Final query: ${query}`); // DEBUG
  console.log(`Query parameters: ${queryParams}`); // DEBUG
  console.log(`Sort query parameter: ${filter_options}`); // DEBUG

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching recipes:', err);
      return res.status(500).send('Error fetching recipes');
    }

    const recipes = results.map(row => ({
      src: '/images/icon_orange.png',
      alt: 'ingredient.jpg',
      name: row.recipe_name,
      desc: `Time: ${row.total_time}`
    }));

    res.render('recipes', {
      style: ['default.css', 'recipes.css'],
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      dropdown1: dropdownFilters,
      title: 'Recipes',
      recipe: recipes,
      searchInput: searchInput // Preserves the search input. Yippee!
    });
  });
});

/* 404 Error handling */
app.use((req, res, next) => {
  res.status(404).send('404 Page Not Found');
});

module.exports = router;
