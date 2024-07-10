const fetch = require('node-fetch');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

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

// // Rendering recipes DUMMY INFORMATION FOR TESTING
// router.get('/', (req, res) => {
//                 // Example sample data
//                 res.render('recipes', {
//                     style: ['default.css', 'recipes.css'],
//                     title: 'Recipes',
//                     recipe: [{
//                         src: '/images/icon_orange.png',
//                         alt: 'example 1',
//                         name: 'example 1',
//                         desc: 'lorem ipsum',
//                     },
//                     {
//                         src: '/images/icon_orange.png',
//                         alt: 'potato.jpg',
//                         name: 'example 2',
//                         desc: 'lorem ipsum',
//                     },
//                     {
//                         src: '/images/icon_orange.png',
//                         alt: 'potato.jpg',
//                         name: 'example 3',
//                         desc: 'lorem ipsum',
//                     }]
//                   })
//         });

// Rendering recipes dynamically from the database
router.get('/', (req, res) => {
  const { dietary_restriction, cooking_aid, difficulty, sort, searchInput } = req.query;

  let query = 'SELECT * FROM recipes WHERE 1=1';
  let queryParams = [];

  if (dietary_restriction) {
    query += ' AND `dietary restrictions` LIKE ?';
    queryParams.push(`%${dietary_restriction}%`);
  }

  if (cooking_aid) {
    query += ' AND cooking_aids LIKE ?';
    queryParams.push(`%${cooking_aid}%`);
  }

  if (difficulty) {
    query += ' AND difficulty = ?';
    queryParams.push(difficulty);
  }

  if (sort) {
    const [column, order] = sort.split('_');
    query += ` ORDER BY ${column} ${order.toUpperCase()}`;
  }

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching recipes:', err);
      return res.status(500).send('Error fetching recipes');
    }

    const recipes = results.map(row => ({
      src: '/images/icon_orange.png',
      alt: 'ingredient.jpg',
      name: row.recipe_name,
      desc: `Prep time: ${row.prep_time}`
    }));

    res.render('recipes', {
      style: ['default.css', 'recipes.css'],
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      dropdown_filters: {value: 'Filter', id: 'filter_options',
        option: ['Vegan','Vegetarian','Pescatarian','Keto','Halal','Kosher']},
      title: 'Recipes',
      recipe: recipes
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

// Route for generating recommended recipes
router.get('/generateRecommendedRecipes', (req, res) => {
  generateRecommendedRecipes((err, recommendedRecipes) => {
    if (err) {
      return res.status(500).json({ error: 'Error generating recommended recipes' });
    }
    res.json(recommendedRecipes);
  });
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

/* Sorting Functions */

// Function to sort recipes by a specified column and order
function sortRecipes(column, order, callback) {
  const query = `SELECT * FROM recipes ORDER BY ?? ${order}`;
  connection.query(query, [column], (err, results) => {
    if (err) {
      console.error(`Error sorting recipes by ${column} ${order}:`, err);
      return callback(err);
    }
    callback(null, results);
  });
}

/* Filtering Functions */

// Function to filter recipes by a specified column and value
function filterRecipes(column, value, callback) {
  const query = `SELECT * FROM recipes WHERE ?? LIKE ?`;
  connection.query(query, [column, `%${value}%`], (err, results) => {
    if (err) {
      console.error(`Error filtering recipes by ${column}:`, err);
      return callback(err);
    }
    callback(null, results);
  });
}

// Function to filter recipes by a specified column and exact match value
function filterRecipesExact(column, value, callback) {
  const query = `SELECT * FROM recipes WHERE ?? = ?`;
  connection.query(query, [column, value], (err, results) => {
    if (err) {
      console.error(`Error filtering recipes by ${column}:`, err);
      return callback(err);
    }
    callback(null, results);
  });
}

/* Sorting Routes */

// Sort recipes by calories (ascending)
router.get('/sortByCaloriesAsc', (req, res) => {
  sortRecipes('calories', 'ASC', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Sort recipes by calories (descending)
router.get('/sortByCaloriesDesc', (req, res) => {
  sortRecipes('calories', 'DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Sort recipes by protein (ascending)
router.get('/sortByProteinAsc', (req, res) => {
  sortRecipes('protein', 'ASC', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Sort recipes by protein (descending)
router.get('/sortByProteinDesc', (req, res) => {
  sortRecipes('protein', 'DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Sort recipes by fat (ascending)
router.get('/sortByFatAsc', (req, res) => {
  sortRecipes('fat', 'ASC', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Sort recipes by fat (descending)
router.get('/sortByFatDesc', (req, res) => {
  sortRecipes('fat', 'DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Sort recipes by fiber (ascending)
router.get('/sortByFiberAsc', (req, res) => {
  sortRecipes('fiber', 'ASC', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Sort recipes by fiber (descending)
router.get('/sortByFiberDesc', (req, res) => {
  sortRecipes('fiber', 'DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

/* Filtering Routes */

// Filter recipes by dietary restrictions
router.get('/:restriction', (req, res) => {
  const restriction = req.params.restriction;
  filterRecipes('dietary restrictions', restriction, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Filter recipes by cooking aids required
router.get('/:aid', (req, res) => {
  const aid = req.params.aid;
  filterRecipes('cooking_aids', aid, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Filter recipes by difficulty
router.get('/:level', (req, res) => {
  const level = req.params.level;
  filterRecipesExact('difficulty', level, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

/* 404 Error handling */
app.use((req, res, next) => {
  res.status(404).send('404 Page Not Found');
});

module.exports = router;