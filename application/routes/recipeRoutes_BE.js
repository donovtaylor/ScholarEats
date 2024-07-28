/*****************************************
* Description: Backend methods and routes concerning recipe-related actions,
* such as serving recipes to the recipes page, sorting and filtering searches,
* and serving/rendering the individual recipes page.
*****************************************/

const fetch = require('node-fetch');
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

const router = express.Router();

const debug = true; // toggle console debug messages
let noResults = false; // Track if there are recipes available

const connection = mysql.createPool({
	host:		'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
	user:		'backend_lead',
	password:	'password',
	database:	'ScholarEats'
});

function debugMsg (input) { // Use this for debug messages, I got tired of doing a ton of if statements
	if (debug) {
		console.log(input);
	}
}

// Rendering recipes dynamically from the database
router.route('/').get(async (req, res) => {
	var dropdownFilters = req.app.locals.dropdownFilters;
	const { dietary_restriction, cooking_aid, sort, searchInput } = req.query;

	// Issue with IS_LOGGED_IN, ise this instead
	let isLoggedIn = false;
	let userId = -1;

	try {		// get the info for the logged in user
		if (req.session.user) { // if there is a logged in user
			isLoggedIn = true;

			console.log('user is LOGGED IN');

			userId = req.session.user.userId; // User ID

			const userUniversityQuery = `SELECT university FROM users WHERE user_id = ?`;
			// Using a question mark is a more secure way of using variable in SQL
			// Source: https://iis-blogs.azurewebsites.net/sqlphp/how-and-why-to-use-parameterized-queries
			// Just covering my bases source-wise
			const [userUniversityInfo] = await connection.execute(userUniversityQuery, [userId]);

			if (userUniversityInfo == 0 ) { // No user info
				return res.status(400).json({ error: 'There was an error retreving user data. Please try again later. Error code: RR_BE:47'}) // Error code refrences which line tripped
			}

			const userUniversity = userUniversityInfo[0].university; // User's university

			// Find the user's university ID from the univeristy name
			const universityIdQuery = `SELECT university_id FROM university WHERE name = ?`;
			const [universityIdInfo] = await connection.execute(universityIdQuery, [userUniversity]);

			if (universityIdInfo === 0) {
				return res.status(400).json({ error: 'There was an error retreving university data. Please try again later. Error code: RR_BE: 57'}); // Error code refrences which line tripped
			}

			const universityId = universityIdInfo[0].university_id;
		}
	} catch (err) {
			console.log('User is LOGGED OUT'); // Not a "real error" so a console log is enough, all this means is it couldn't find the info for the logged in user, meaning the user is logged out
	}

		/* Extract the checkbox and radio data */

		// Difficulties
		const difficulties = Object.keys(req.query).filter(key => [
			'Easy',
			'Medium',
			'Hard'
		].includes(key) && req.query[key] === 'on');

		// Dietary Restrictions
		const dietaryRestrictions = Object.keys(req.query).filter(key => [
			'Vegan',
			'Keto',
			'Halal',
			'Vegitarian',
			'Pescatarian',
			'Kosher'
		].includes(key) && req.query[key] === 'on');

		// Cooking Aids
		const cookingAids = Object.keys(req.query).filter(key => [ // NOW COOKING TIP
			'Oven Required',
			'Stove Required'
		].includes(key) && req.query[key] === 'on');

		// Sorting Options
		const sortOptionsQueryMap = {
			'Calories Ascending'	:	'calories ASC',
			'Calories Descending'	:	'calories DESC',
			'Protein Ascending'		:	'protein ASC',
			'Protein Descending'	:	'protein DESC',
			'Fat Ascending'			:	'fat ASC',
			'Fat Descending'		:	'fat DESC',
			'Fiber Ascending'		:	'fiber ASC',
			'Fiber Descending'		:	'fiber DESC'
		}; const sortOptions = sortOptionsQueryMap[sort];

		/*
		Please dont touch this query unless absolutely necessary, SQL is hard and this chunk is fragile!
		
		This query gets all of the reipes that can be made just with what is available in the inventory.
		It also filters out duplicate recipes, becuase there are currently about 4 copies of each recipe
		in the "recipes" table.
		*/

		// Not this one, this query is the default "show 30 example recipes because youre not logged in"
		let query = `
			SELECT DISTINCT r.*
			FROM recipes r
			WHERE r.recipe_id IN (
				SELECT MIN(inner_r.recipe_id)
				FROM recipes inner_r
				GROUP BY inner_r.recipe_name
			)
		`;


		let queryParams = []; // Holds the parameters to be added onto the query (sorting options, etc)

		if (isLoggedIn) {
			debugMsg(`user is LOGGED IN`);

			// This is the super fragile query.
			// It also now only uses ingredients from the user's univerisity, but I ran into issues with injecting the user ID
			// so I am injecting it directly into the query
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
		}

		/* QUERY PARAMETERS */

		// Dietary restrictions
		if (dietaryRestrictions.length > 0) {
			query += ' AND r.`dietary_restrictions` IN (' + dietaryRestrictions.map(() => '?').join(', ') + ')';
			queryParams.push(...dietaryRestrictions);
		}

		// Cooking aids (NOW COOKING TIP)
		if (cookingAids.length > 0) {
			query += ' AND r.`cooking_tip` IN (' + cookingAids.map(() => '?').join(', ') + ')';
			queryParams.push(...cookingAids);
		}

		// Difficulty
		if (difficulties.length > 0) {
			query += ' AND r.`difficulty` IN (' + difficulties.map(() => '?').join(', ') + ')';
			queryParams.push(...difficulties);
		}

		// Search input from the search bar
		if (searchInput) {
			query += ' AND `recipe_name` LIKE ?';
			queryParams.push(`%${searchInput}%`);
		}

		// Sorting options, see line 90
		if (sortOptions) {
			query += ` ORDER BY ${sortOptions}`;
		}

		debugMsg(`Final query: ${query}`);
		debugMsg(`Query parameters: ${queryParams}`);
		debugMsg(`Sorting method: ${sortOptions}`);

		try {
			const [results] = await connection.execute(query, queryParams); // Execute the funal query
			const resultCount = results.length; // Number of results

			debugMsg(`Result count: ${resultCount}`);

			if (resultCount > 0) {
				noResults = false;

				debugMsg(`Recipes available. Serving generated recipes...`);

				const recipes = results.map(row => ({ // For each individual recipe
					id:		row.recipe_id,
					src:	row.img_src,
					alt:	'recipe.jpg',
					name:	row.recipe_name,
					desc:	`Time: ${row.total_time}`
				}));

				if (isLoggedIn) { // Results if the user is logged in
					res.render('recipes', {
						style:			['default.css', 'recipes.css'],
						script:			['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
						noResults:		noResults,
						dropdown1:		dropdownFilters,
						title:			'Recipes',
						recipe:			recipes,
						searchInput:	searchInput
					});
				} else {
					res.render('recipes', {
						style:			['default.css', 'recipes.css'],
						script:			['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
						logInPrompt:	'Log in to see recipes associalted with your university!',
						noResults:		noResults,
						dropdown1:		dropdownFilters,
						title:			'Recipes',
						recipe:			recipes,
						searchInput:	searchInput
					});
				}

				debugMsg(`Finished serving generated recipes.`);
			}

			// If no recipes are available
			if (resultCount === 0) {
				noResults = true;

				debugMsg(`Recipes not available. Serving randomly generated recipes...`);

				// New query for randomly fetching 10 recipes from the database
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
						id:		row.recipe_id,
						src:	row.img_src,
						alt:	'recipe.jpg',
						name:	row.recipe_name,
						desc:	`Time: ${row.total_time}`
					}));

					if (isLoggedIn) {
						res.render('recipes', {
							style:			['default.css', 'recipes.css'],
							script:			['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
							logInPrompt:	'No recipes match the current criteria. Try these instead!',
							noResults:		noResults,
							dropdown1:		dropdownFilters,
							title:			'Recipes',
							recipe:			randomRecipes,
							searchInput:	searchInput
						});
					} else {
						res.render('recipes', {
							style:			['default.css', 'recipes.css'],
							script:			['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
							logInPrompt:	'Log in to see recipes associated with your university!',
							suggestedText:	'No recipes match the current criteria. Try these instead!',
							noResults:		noResults,
							dropdown1:		dropdownFilters,
							title:			'Recipes',
							recipe:			randomRecipes,
							searchInput:	searchInput
						});
					}

				} catch (err) {
					console.error('Error fetching recipes:', err);
					return res.status(500).send('Error fetching recipes');
				}
				debugMsg(`Finished serving randomly generated recipes`);
			}

		} catch (err) {
			console.error('Error fetching recipes:', err);
			return res.status(500).send('Error fetching recipes');
		}

});


/* Serve each individual recipe page based on the recipe ID */
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
		debugMsg('User is logged out');
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

		debugMsg(recipeResult);
		if (recipeResult.length > 0) {

			const recipe = recipeResult[0];
			const ingredients = ingredientsResult.map(ingredient => ingredient.name); // Map the ingredients to their name
			const directions = recipe.directions.split('\n').filter(step => step.trim() !== ''); // Split the directions apart by \n, will probably change if we use AI to make another column with the directions

			res.render('individual_recipes_view', {
				style:			['default.css', 'individualRecipe.css'],
				script:			['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
				dropdown1:		dropdownFilters,
				isLoggedIn:		isLoggedIn,
				title:			recipe.recipe_name,
				src:			recipe.img_src,
				prepTime:		recipe.prep_time,
				cookTime:		recipe.cook_time,
				servings:		recipe.servings,
				ingredients:	ingredients,
				instructions:	directions
			});
		} else {
			debugMsg('No results found.');
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