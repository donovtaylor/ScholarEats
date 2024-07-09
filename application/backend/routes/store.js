const express = require('express');
const db = require('../db');
const router = express.Router();

// Route to add an ingredient to the store
router.post('/', (req, res) => {
  const { ingredient_id, name, expiration_date, quantity } = req.body;
  const sql = 'INSERT INTO store (ingredient_id, name, expiration_date, quantity) VALUES (?, ?, ?, ?)';
  db.query(sql, [ingredient_id, name, expiration_date, quantity], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Ingredient added to store' });
  });
});

// Route to get all ingredients from the store
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM store';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route to update store information (only accessible by administrators)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { ingredient_id, name, expiration_date, quantity } = req.body;
  const sql = 'UPDATE store SET ingredient_id = ?, name = ?, expiration_date = ?, quantity = ? WHERE id = ?';
  db.query(sql, [ingredient_id, name, expiration_date, quantity, id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Store updated successfully' });
  });
});

module.exports = router;
