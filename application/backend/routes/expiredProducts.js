const express = require('express');
const db = require('../db');
const router = express.Router();

// Route to move expired products to expired_products table
router.post('/move-expired', (req, res) => {
  const sql = `INSERT INTO expired_products (ingredient_id, name, expiration_date, quantity)
               SELECT ingredient_id, name, expiration_date, quantity
               FROM store
               WHERE expiration_date < NOW()`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    const deleteSql = 'DELETE FROM store WHERE expiration_date < NOW()';
    db.query(deleteSql, (deleteErr, deleteResult) => {
      if (deleteErr) throw deleteErr;
      res.json({ message: 'Expired products moved to expired_products table' });
    });
  });
});

// Route to get all expired products
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM expired_products';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;
