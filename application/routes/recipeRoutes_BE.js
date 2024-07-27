const fetch = require('node-fetch');
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

const router = express.Router();

const debug = true; // toggle console debug messages
let noResults = false; // Track if there are recipes available

const connection = mysql.createPool({
	host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
	user: 'backend_lead',
	password: 'password',
	database: 'ScholarEats'
});

// connection.connect(err => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//     return;
//   }
//   console.log('Connected to the database');
// });

// Rendering recipes dynamically from the database
router.route('/').get(async (req, res) => {
	var dropdownFilters = req.app.locals.dropdownFilters;
	const { dietary_restriction, cooking_aid, sort, searchInput } = req.query; // removed filter_options

	// Doing this manually because it isnt working in the function for some reason
	let isLoggedIn = false;
	let userId = -1;

	try {
		// Get the user info for logged in user
		if (req.session.user) {
			isLoggedIn = true;

			console.log('user is logged in');

			userId = req.session.user.userId; // ID of the logged in user

			const userUniversityQuery = `SELECT university FROM users WHERE user_id = ?`;
			const [userUniversityInfo] = await connection.execute(userUniversityQuery, [userId]);

			if (userUniversityInfo === 0) {
				return res.status(400).json({ error: 'There was an error retreving user data. Please try again later. Error code: RR_BE:41'})
			}

			const userUniversity = userUniversityInfo[0].university;
			
			const universityIdQuery = `SELECT university_id FROM university WHERE name = ?`;
			const [universityIdInfo] = await connection.execute(universityIdQuery, [userUniversity]);

			if (universityIdInfo === 0) {
				return res.status(400).json({ error: 'There was an error retreving university data. Please try again later. Error code: RR_BE:50'})
			}

			const universityId = universityIdInfo[0].universiity_id;
		}
	} catch (err) {
		console.log('User is logged out');
	}

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
		'Calories Ascending': 'calories ASC',
		'Calories Descending': 'calories DESC',
		'Protein Ascending': 'protein ASC',
		'Protein Descending': 'protein DESC',
		'Fat Ascending': 'fat ASC',
		'Fat Descending': 'fat DESC',
		'Fiber Ascending': 'fiber ASC',
		'Fiber Descending': 'fiber DESC'
	}; const sortOptions = sortOptionsQueryMap[sort];

	/*
	Please dont touch this query unless absolutely necessary, SQL is hard and this chunk is fragile!
	
	This query gets all of the reipes that can be made just with what is available in the inventory.
	It also filters out duplicate recipes, becuase there are currently about 4 copies of each recipe
	in the "recipes" table.
	*/

	let query = `
		SELECT recipe_name
		FROM recipes
		LIMIT 30
	`;

	let queryParams = [];

	if (isLoggedIn) {

		if (debug) {
			console.log(`USER IS LOGGED IN`);
		}

		query = `
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
					SELECT s.ingredient_id
					FROM store s
					JOIN university u ON s.university_id = u.university_id
					JOIN users usrs ON usrs.university = u.name
					WHERE quantity > 0 AND usrs.user_id = ${userId}
				)
			)`;
		queryParams = [];
	}

	// Query parameters, dynamically changes the URL

	if (dietaryRestrictions.length > 0) { // Dietary restrictions
		query += ' AND r.`dietary_restrictions` IN (' + dietaryRestrictions.map(() => '?').join(', ') + ')';
		queryParams.push(...dietaryRestrictions);
	}

	if (cookingAids.length > 0) { // Cooking aids
		query += ' AND r.`cooking_tip` IN (' + cookingAids.map(() => '?').join(', ') + ')';
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

	if (debug) {
		console.log(`Final query: ${query}`);
		console.log(`Query parameters: ${queryParams}`);
		console.log(`Sorting method: ${sortOptions}`);
	}

	try {
		const [results] = await connection.execute(query, queryParams);
		const resultCount = results.length; // get the number of results

		if (debug) {
			console.log(`Results: ${resultCount}`);
		}

		// Render the results, if there are recipes available
		if (resultCount > 0) {
			noResults = false;

			if (debug) {
				console.log(`Recipes available. Serving generated recipes.`);
			}

			const recipes = results.map(row => ({
				id: row.recipe_id,
				src: row.img_src,
				alt: 'recipe.jpg',
				name: row.recipe_name,
				desc: `Time: ${row.total_time}`
			}));

			if (isLoggedIn) {

				res.render('recipes', {
					style: ['default.css', 'recipes.css'],
					script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
					noResults: noResults,
					dropdown1: dropdownFilters,
					title: 'Recipes',
					recipe: recipes,
					searchInput: searchInput // Preserves the search input. Yippee!
				});

			} else {

				res.render('recipes', {
					style: ['default.css', 'recipes.css'],
					script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
					logInPrompt: 'Log in to see recipes associated with your university!',
					noResults: noResults,
					dropdown1: dropdownFilters,
					title: 'Recipes',
					recipe: recipes,
					searchInput: searchInput // Preserves the search input. Yippee!
				});

			}

			if (debug) {
				console.log(`Finished serving generated recipes.`);
			}

		}

		// If no recipes are available
		if (resultCount === 0) {
			noResults = true;

			if (debug) {
				console.log(`Recipes not available. Serving randomly generated recipes.`);
			}

			const randomSelectionQuery = `
				SELECT DISTINCT r.*
				FROM recipes r
				WHERE r.recipe_id IN (
					SELECT MIN(inner_r.recipe_id)
					FROM recipes inner_r
					GROUP BY inner_r.recipe_name
				)
				ORDER BY RAND()
				LIMIT 10
			`;

			try {
				const [results] = await connection.execute(randomSelectionQuery);

				const randomRecipes = results.map(row => ({
					id: row.recipe_id,
					src: row.img_src,
					alt: 'ingredient.jpg',
					name: row.recipe_name,
					desc: `Time: ${row.total_time}`
				}));

				if (isLoggedIn) {

					res.render('recipes', {
						style: ['default.css', 'recipes.css'],
						script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
						suggestedText: 'No recipes match the current criteria. Try these instead!',
						dropdown1: dropdownFilters,
						noResults: noResults,
						title: 'Recipes',
						recipe: randomRecipes,
						searchInput: searchInput // Preserves the search input. Yippee!
					});

				} else {
					
					res.render('recipes', {
						style: ['default.css', 'recipes.css'],
						script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
						logInPrompt: 'Log in to see recipes associated with your university!',
						suggestedText: 'No recipes match the current criteria. Try these instead!',
						dropdown1: dropdownFilters,
						noResults: noResults,
						title: 'Recipes',
						recipe: randomRecipes,
						searchInput: searchInput // Preserves the search input. Yippee!
					});

				}
			} catch (err) {
				console.error('Error fetching recipes:', err);
				return res.status(500).send('Error fetching recipes');
			}

			if (debug) {
				console.log(`Finished serving randomly generated recipes.`);
			}

		}
	} catch (err) {
		console.error('Error fetching recipes:', err);
		return res.status(500).send('Error fetching recipes');
	}
});


router.get('/:id', async (req, res) => {

	var dropdownFilters = req.app.locals.dropdownFilters;

	let isLoggedIn = false;
    let userId = -1;

    try { // Check if the user is logged in and get the id
        if (req.session.user) {
            isLoggedIn = true;
			userId = req.session.user.userId; // ID of the logged in user
        }
    }  catch (err) {
		console.log('User is logged out');
	}

	// Fetch the recipe from the db
	let query = 'SELECT * FROM recipes WHERE recipe_id = ?';

	// Fetch the ingredients for that recipe from the db
	let ingredientQuery = `
		SELECT i.name
		FROM recipe_ingredient ri
		JOIN ingredient i ON ri.ingredient_id = i.ingredient_id
		WHERE ri.recipe_id = ?
	`;

	try {
		const [recipeResult] = await connection.execute(query, [req.params.id]);
		const [ingredientsResult] = await connection.execute(ingredientQuery, [req.params.id]);

		console.log(recipeResult);
		if (recipeResult.length > 0) {

			const recipe = recipeResult[0];
			const ingredients = ingredientsResult.map(ingredient => ingredient.name); // Map the ingredients to their name
			const directions = recipe.directions.split('\n').filter(step => step.trim() !== ''); // Split the directions apart by \n, will probably change if we use AI to make another column with the directions

			res.render('individual_recipes_view', {
				style: ['default.css', 'individualRecipe.css'],
				script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
				dropdown1: dropdownFilters,
				isLoggedIn: isLoggedIn,
				title: recipe.recipe_name,
				src: recipe.img_src,
				prepTime: recipe.prep_time,
				cookTime: recipe.cook_time,
				servings: recipe.servings,
				ingredients: ingredients,
				instructions: directions
			});
		} else {
			console.log('No results found.');
		}

	} catch (err) {
		console.error('Error executing query: ', err);
		return res.status(500).send('Error executing query');
	}

});

/* 404 Error handling */
router.use((req, res, next) => {
	res.status(404).send('404 Page Not Found');
});

module.exports = router;
