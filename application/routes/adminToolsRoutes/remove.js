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

// Route to remove an ingredient for the logged-in user's university
router.post('/remove', IS_ADMIN, async (req, res) => {
  const { Name, expiration_date, quantity } = req.body;
    const conn = await db.getConnection();
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

    await conn.beginTransaction();

    // Find and delete matching rows in store table
    await conn.query('DELETE FROM store WHERE Name = ? AND expiration_date = ? AND quantity = ? AND university_id = ?', [Name, expiration_date, quantity, university_id]);

    // Find and delete matching rows in expired_products table
    await conn.query('DELETE FROM expired_products WHERE Name = ? AND expiration_date = ? AND quantity = ? AND university_id = ?', [Name, expiration_date, quantity, university_id]);

    await conn.commit();
    conn.release();

    req.flash('success_msg', 'Ingredient removed successfully for the specified university');
    res.status(200).json({ message: 'Ingredient removed successfully for the specified university' });
  } catch (err) {
    await conn.rollback();
    conn.release();

    console.error('Error removing ingredient:', err);
    req.flash('error_msg', 'Error removing ingredient');
    res.status(500).json({ message: 'Error removing ingredient', error: err });
  }
});

module.exports = router;
