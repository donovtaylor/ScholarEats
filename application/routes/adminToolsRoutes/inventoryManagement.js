const express = require('express');
const db = require('../db');
const router = express.Router();
const expiredProductsRoutes = require('./expiredProducts');
const dotenv = require('dotenv').config();
const mysql = require('mysql2/promise');

const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');

router.use('/expired-products', expiredProductsRoutes);

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to get the next store_id
async function getNextStoreId() {
  const [rows] = await db.query('SELECT MAX(store_id) AS maxStoreId FROM store');
  return rows[0].maxStoreId ? rows[0].maxStoreId + 1 : 1;
}

// Helper function to get the next ingredient_id
async function getNextIngredientId() {
  const [rows] = await db.query('SELECT MAX(ingredient_id) AS maxIngredientId FROM ingredient');
  return rows[0].maxIngredientId ? rows[0].maxIngredientId + 1 : 1;
}

// Inventory Management page
router.get('/', IS_ADMIN, (req, res) => {
  res.render('adminToolsViews/inventoryManagement');
});

// Route to display the add ingredient form
router.get('/add', IS_ADMIN, async (req, res) => {
  // fetch the ingredients for the dropdown
  try {
    const allIngredientQuery = `
      SELECT name FROM ingredient
      ORDER BY name
    `;

    const [ingredients] = await db.execute(allIngredientQuery);

    // console.log(ingredients);

    res.render('adminToolsViews/addIngredient', {
      ingredients: ingredients
    });

  } catch (err) {
    console.log('Error fetching ingredients');

  }
});

// Route to add an ingredient to the store
router.post('/add', IS_ADMIN, async (req, res) => {

  const { Name, expiration_date, quantity } = req.body;
  try {

    // get the admin university id
    const userId = req.session.user.userId; // User ID

    console.log(userId);

    const universityIdQuery = `
      SELECT u.university_id
      FROM users AS usrs
      JOIN university AS u
      ON usrs.university = u.name
      WHERE usrs.user_id = ?
    `;
    const [universityRow] = await connection.execute(universityIdQuery, [userId]);

    const universityId = universityRow[0].university_id;

    console.log(universityId);

    // Default img
    const img = `images/ingredients/default_ingredients_image.jpg`;

    // Check if the ingredient already exists in the ingredient table
    const [existingIngredients] = await db.query('SELECT * FROM ingredient WHERE Name = ?', [Name]);

    let ingredient_id;
    if (existingIngredients.length > 0) {
      // Ingredient already exists, use existing ingredient_id
      ingredient_id = existingIngredients[0].ingredient_id;
    } else {
      // Ingredient does not exist, create new ingredient_id and add to ingredient table
      ingredient_id = await getNextIngredientId();
      await db.query('INSERT INTO ingredient (ingredient_id, Name, img_src) VALUES (?, ?, ?)', [ingredient_id, Name, img]);
    }

    // Add ingredient to the store table with a new store_id
    const store_id = await getNextStoreId();
    await db.query('INSERT INTO store (store_id, ingredient_id, Name, expiration_date, quantity, university_id) VALUES (?, ?, ?, ?, ?, ?)', [store_id, ingredient_id, Name, expiration_date, quantity, universityId]);

    req.flash('success_msg', 'Ingredient added to store');
    res.redirect('/admin-tools/inventory-management/add');
  } catch (err) {
    console.error('Error adding product to store:', err);
    req.flash('error_msg', 'Error adding product to store');
    res.redirect('/admin-tools/inventory-management/add');
  }
});

module.exports = router;