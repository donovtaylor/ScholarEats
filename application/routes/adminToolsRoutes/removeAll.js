const express = require('express');
const db = require('../db');
const router = express.Router();
const dotenv = require('dotenv').config();
const mysql = require('mysql2/promise');

const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');

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

// Route to remove all ingredients for the logged-in user's university
router.delete('/remove-all', IS_ADMIN, async (req, res) => {
  try {
    const userId = req.session.user.userId; // Get the user ID from the session

    // Get the university ID of the logged-in user
    const universityIdQuery = `
      SELECT u.university_id
      FROM users AS usrs
      JOIN university AS u ON usrs.university = u.name
      WHERE usrs.user_id = ?
    `;
    const [universityRow] = await connection.execute(universityIdQuery, [userId]);

    if (!universityRow.length) {
      req.flash('error_msg', 'University not found for the logged-in user');
      return res.status(400).json({ message: 'University not found for the logged-in user' });
    }

    const university_id = universityRow[0].university_id;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    // Find all store IDs with the specified university ID
    const [storeRows] = await connection.query('SELECT store_id FROM store WHERE university_id = ?', [university_id]);
    const storeIds = storeRows.map(row => row.store_id);

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Delete matching rows in expired_products table
    await connection.query('DELETE FROM expired_products WHERE store_id IN (?)', [storeIds]);

    // Delete rows from store table
    await connection.query('DELETE FROM store WHERE university_id = ?', [university_id]);

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.commit();
    connection.release();

    req.flash('success_msg', 'All ingredients removed successfully for the specified university');
    res.status(200).json({ message: 'All ingredients removed successfully for the specified university' });
  } catch (err) {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1'); // Ensure foreign key checks are re-enabled in case of an error
    await connection.rollback();
    connection.release();

    console.error('Error removing all ingredients:', err);
    req.flash('error_msg', 'Error removing all ingredients');
    res.status(500).json({ message: 'Error removing all ingredients', error: err });
  }
});

module.exports = router;
