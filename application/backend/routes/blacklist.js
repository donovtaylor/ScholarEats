/*****************************************
* Description: Route to blacklist user accounts
*****************************************/

const express = require('express');
const db = require('../db');
const router = express.Router();
const mysql = require('mysql2/promise');

// Route to remove user accounts
router.delete('/remove', async (req, res) => {
	const { user_id } = req.body;
	const deleteUserInfoSql = 'DELETE FROM user_info WHERE user_id = ?';
	const deleteUserSql = 'DELETE FROM users WHERE user_id = ?';
	const insertEmailLogSql = 'INSERT INTO email_log (user_id, email, timestamp) SELECT user_id, email, NOW() FROM users WHERE user_id = ?';

	await db.execute(insertEmailLogSql, [user_id], (err, result) => {
		if (err) throw err;
		await db.execute(deleteUserInfoSql, [user_id], (err, result) => {
			if (err) throw err;
			await db.execute(deleteUserSql, [user_id], (err, result) => {
				if (err) throw err;
				res.json({ message: 'User removed and logged in email_log' });
			});
		});
	});
});

module.exports = router;
