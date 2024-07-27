const express = require('express');
const db = require('../db');
const router = express.Router();
const expiredProductsRoutes = require('./expiredProducts');

router.use('/expired-products', expiredProductsRoutes);

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
router.get('/', (req, res) => {
  res.render('adminToolsViews/inventoryManagement');
});

// Route to display the add ingredient form
router.get('/add', (req, res) => {
  res.render('adminToolsViews/addIngredient');
});

// Route to add an ingredient to the store
router.post('/add', async (req, res) => {
  const { Name, expiration_date, quantity } = req.body;
  try {
    // Check if the ingredient already exists in the ingredient table
    const [existingIngredients] = await db.query('SELECT * FROM ingredient WHERE Name = ?', [Name]);

    let ingredient_id;
    if (existingIngredients.length > 0) {
      // Ingredient already exists, use existing ingredient_id
      ingredient_id = existingIngredients[0].ingredient_id;
    } else {
      // Ingredient does not exist, create new ingredient_id and add to ingredient table
      ingredient_id = await getNextIngredientId();
      await db.query('INSERT INTO ingredient (ingredient_id, Name) VALUES (?, ?)', [ingredient_id, Name]);
    }

    // Add ingredient to the store table with a new store_id
    const store_id = await getNextStoreId();
    await db.query('INSERT INTO store (store_id, ingredient_id, Name, expiration_date, quantity) VALUES (?, ?, ?, ?, ?)', [store_id, ingredient_id, Name, expiration_date, quantity]);

    req.flash('success_msg', 'Ingredient added to store');
    res.redirect('/adminTools/inventory-management/add');
  } catch (err) {
    console.error('Error adding product to store:', err);
    req.flash('error_msg', 'Error adding product to store');
    res.redirect('/adminTools/inventory-management/add');
  }
});

module.exports = router;
