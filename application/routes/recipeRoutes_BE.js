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
  const { dietary_restriction, cooking_aid, sort, searchInput } = req.query; // removed filter_options

  /* Extract the checkbox/radio data */

  // Difficulties
  const difficulties = Object.keys(req.query).filter(key => [
    'Easy',
    'Medium',
    'Hard'].includes(key) && req.query[key] === 'on');

  // Dietary Restrictions
  const dietaryRestrictions = Object.keys(req.query).filter(key => [
    'Vegan',
    'Keto',
    'Halal',
    'Vegetarian',
    'Pescatarian',
    'Kosher'].includes(key) && req.query[key] === 'on');

  // Cooking Aids
  const cookingAids = Object.keys(req.query).filter(key => [
    'Oven Required',
    'Stove Required'].includes(key) && req.query[key] === 'on');

  // Sorting options
  const sortOptionsQueryMap = { // map for the SQL queries
    'Calories Ascending'  : 'calories ASC',
    'Calories Descending' : 'calories DESC',
    'Protein Ascending'   : 'protein ASC',
    'Protein Descending'  : 'protein DESC',
    'Fat Ascending'       : 'fat ASC',
    'Fat Descending'      : 'fat DESC',
    'Fiber Ascending'     : 'fiber ASC',
    'Fiber Descending'    : 'fiber DESC'
  }; const sortOptions = sortOptionsQueryMap[sort];

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

  if (sortOptions) { // Sorting options
    query += ` ORDER BY ${sortOptions}`;
    // queryParams.push(`%${sortOptions}%`)
  }

  if (debug){
    console.log(`Final query: ${query}`);
    console.log(`Query parameters: ${queryParams}`);
    console.log(`Sorting method: ${sortOptions}`);
  }

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching recipes:', err);
      return res.status(500).send('Error fetching recipes');
    }

    const resultCount = results.length; // get the number of results

    if (debug){
      console.log(`Results: ${resultCount}`);
    }

    // Render the results, if there are recipes available
    if (resultCount > 0) {

      if (debug) {
        console.log(`Recipes available. Serving generated recipes.`);
      }

      const recipes = results.map(row => ({
        id: row['Unnamed: 0'],
        src: row.img_src,
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

      if (debug) {
        console.log(`Finished serving generated recipes.`);
      }

    }

    // If no recipes are available
    if (resultCount === 0) {

      if (debug) {
        console.log(`Recipes not available. Serving randomly generated recipes.`);
      }

      const randomSelectionQuery = `
        SELECT DISTINCT r.*
        FROM recipes r
        WHERE r.\`Unnamed: 0\` IN (
          SELECT MIN(inner_r.\`Unnamed: 0\`)
          FROM recipes inner_r
          GROUP BY inner_r.recipe_name
        )
        ORDER BY RAND()
        LIMIT 10
      `;

      connection.query(randomSelectionQuery, (err, results) => {
        if (err) {
          console.error('Error fetching recipes:', err);
          return res.status(500).send('Error fetching recipes');
        }

        const randomRecipes = results.map(row => ({
          id: row['Unnamed: 0'],
          src: row.img_src,
          alt: 'ingredient.jpg',
          name: row.recipe_name,
          desc: `Time: ${row.total_time}`
        }));
    
        res.render('recipes', {
          style: ['default.css', 'recipes.css'],
          script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
          dropdown1: dropdownFilters,
          title: 'Recipes',
          recipe: randomRecipes,
          searchInput: searchInput // Preserves the search input. Yippee!
        });
      });

      if (debug) {
        console.log(`Finished serving randomly generated recipes.`);
      }

    }
  });
});

/* 404 Error handling */
router.use((req, res, next) => {
  res.status(404).send('404 Page Not Found');
});

module.exports = router;
