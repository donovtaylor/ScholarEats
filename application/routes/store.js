const express = require('express');
const db = require('../db');
const router = express.Router();

// Helper function to get the next store_id
async function getNextStoreId() {
  const [rows] = await db.promise().query('SELECT MAX(store_id) AS max_store_id FROM store');
  return rows[0].max_store_id ? rows[0].max_store_id + 1 : 1;
}

// Helper function to get the next ingredient_id
async function getNextIngredientId() {
  const [rows] = await db.promise().query('SELECT MAX(ingredient_id) AS max_ingredient_id FROM ingredient');
  return rows[0].max_ingredient_id ? rows[0].max_ingredient_id + 1 : 1;
}

// Route to manage ingredients (add or remove)
router.post('/manage-ingredients', async (req, res) => {
  const { name, action } = req.body;
  console.log('Received ingredient name:', name); // Log received ingredient name
  console.log('Received action:', action); // Log received action

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Ingredient name cannot be empty' });
  }

  try {
    switch (action) {
      case 'add':
        await db.promise().beginTransaction();

        // Check if the ingredient already exists in the ingredient table
        const [existingIngredients] = await db.promise().query('SELECT * FROM ingredient WHERE name = ?', [name]);

        let ingredient_id;
        if (existingIngredients.length > 0) {
          // Ingredient already exists, use existing ingredient_id
          ingredient_id = existingIngredients[0].ingredient_id;
        } else {
          // Ingredient does not exist, create new ingredient_id and add to ingredient table
          ingredient_id = await getNextIngredientId();
          await db.promise().query('INSERT INTO ingredient (ingredient_id, name) VALUES (?, ?)', [ingredient_id, name]);
        }

        // Add ingredient to the store table with a new store_id
        const store_id = await getNextStoreId();
        await db.promise().query('INSERT INTO store (store_id, ingredient_id, name, expiration_date, quantity) VALUES (?, ?, ?, NULL, 0)', [store_id, ingredient_id, name]);

        await db.promise().commit();
        res.status(200).json({ message: 'Ingredient added to store' });
        break;

      case 'remove':
        await db.promise().beginTransaction();
        // Temporarily disable foreign key checks
        await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
        await db.promise().query('DELETE FROM store WHERE name = ?', [name]);
        await db.promise().query('DELETE FROM ingredient WHERE name = ?', [name]);
        // Re-enable foreign key checks
        await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');
        await db.promise().commit();
        res.status(200).json({ message: 'Ingredient removed from store' });
        break;

      default:
        res.status(400).json({ message: 'Invalid action selected' });
        break;
    }
  } catch (err) {
    await db.promise().rollback();
    console.error('Error managing ingredient in store:', err);
    res.status(500).json({ message: `Error managing ingredient in store: ${err.message}` });
  }
});

module.exports = router;
