/*****************************************
* Description: Backend methods and routes relating to user-based actions
*****************************************/

const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const router = express.Router();
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');

const connection = require('./db');


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Function to automatically enroll users in university programs based on email domain
async function autoEnrollUniversityPrograms(email) {
	const domain = email.split('@')[1];
	const query = `
		UPDATE users 
		SET university = (SELECT name FROM university WHERE email_suffix = ?),
			verification_status = TRUE
		WHERE email = ?
	`;
	
	try {
		const [results] = await connection.execute(query, [domain, email]);
		resolve(results);
	} catch (err) {
		console.error('Error enrolling user in university program:', err);
		reject(err);
	}
}

// Handle registration POST request
router.post('/register', IS_LOGGED_OUT, async (req, res) => {
	const { username, email, password, verify_password } = req.body;

	// Check if passwords match
	if (password !== verify_password) {
		return res.status(400).json({ error: 'Passwords do not match!' });
	}

	// Make sure the username and password meet the lenght requireements
	if (username.length < 5) {
		return res.status(400).json({ error: 'Username must be at least 5 characters' });
	}

	if (password.length < 8) {
		return res.status(400).json({ error: 'Password must be at least 8 characters' });
	}

	try {

		const [emailResults] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
		// Checks if email exists
		if (emailResults.length > 0) {
			return res.status(400).json({ error: 'Email already exists' });
		}

		const [userResults] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
		// Checks if username exists
		if (userResults.length > 0) {
			return res.status(400).json({ error: 'Username already exists' });
		}

		// Hash the password

		const hash = await bcrypt.hash(password, 10);
		console.log("TEST 5");
		await connection.execute('INSERT INTO users (uuid, email, username, password_hash) VALUES (UUID(), ?, ?, ?)', [email, username, hash]);
		autoEnrollUniversityPrograms(email);
		return res.json({ message: 'User registered successfully' });

	} catch (err) {
		console.error('Error during registration:', err);
		return res.status(500).json({ error: 'An error occurred during registration' });
	}
});

router.post('/login', IS_LOGGED_OUT, async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const isAdminLogin = req.body.password;
	try {

		const [results] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
		// Check if user exists
		if (results.length === 0) {
			return res.status(400).json({ error: 'Invalid Username or Password' });
		}
		const user = results[0];

		const isMatch = await bcrypt.compare(password, user.password_hash);
		if (!isMatch) {
			return res.status(400).json({ error: 'Invalid Username or Password' });
		}

		const [sessionResults] = await connection.execute('SELECT * FROM sessions WHERE user_id = ? AND session_end IS NULL', [user.uuid]);

		role = 'user;'
		if (Number(user.role_id) === 3) {
			role = 'admin';
		}

		req.session.user = {
			email: user.email,
			username: user.username,
			uuid: user.uuid,
			sessionStart: new Date(),
			userId: user.user_id,
			role: role
		};


		await connection.execute('INSERT INTO sessions (session_id, user_id, session_start, expires, user_agent) VALUES (?, ?, ?, ?, ?)', [req.session.id, req.session.user.uuid, req.session.user.sessionStart, new Date(Date.now() + (24 * 60 * 60 * 1000)), role])
		return res.json({ message: 'Logged In Successfully' });
	} catch (err) {

		return res.json({ error: err });
	}
});


router.post('/logout', (req, res) => {
	if (req.session) {

		try {
			connection.execute('UPDATE sessions SET session_end = ? WHERE session_id = ?', [new Date(), req.session.id]);
		} catch (err) {

			return res.json({ error: err });
		}

		req.session.destroy((err) => {
			if (err) {
				return err;
			}
			return res.send('Logged Out Successfully');
		});
	}
});

router.post('/change-password', IS_LOGGED_IN, async (req, res) => {
	const newPass = req.body.newPass;
	const currentPass = req.body.currentPass;
	const confirmPass = req.body.confirmPass;

	try {
		// Compare current password with the stored hash

		const [result] = await connection.execute('SELECT * FROM users WHERE username = ?', [req.session.user.username]);

		const user = result[0];

		const isMatch = await bcrypt.compare(currentPass, user.password_hash);
		if (!isMatch) {
			return res.status(400).json({ error: 'Incorrect Password' });
		}

		// Check if new password and confirm password match
		if (newPass !== confirmPass) {
			return res.status(400).json({ error: 'Passwords do not match' });
		}

		// Hash the new password
		const hash = await bcrypt.hash(newPass, 10);

		// Update the password in the database
		await connection.execute('UPDATE users SET password_hash = ? WHERE username = ?', [hash, req.session.user.username]);

		return res.json({ message: 'Successfully changed password!' });
	} catch (err) {
		console.error('Error changing password:', err);
		return res.status(500).json({ error: 'An error occurred while changing the password' });
	}
});

router.post("/change-username", IS_LOGGED_IN, async (req, res) => {

	const newUsername = req.body.newUsername;

	try {
		const [results] = await connection.execute('SELECT * FROM users where Username = ?', [newUsername]);
		if (results.length > 0) {
			return res.status(400).json({ error: "username is taken" });
		}

		await connection.execute('UPDATE users SET username = ? WHERE email = ?', [newUsername, req.session.user.email]);
		req.session.user.username = newUsername;
		return res.json({ message: 'successfully changed username!' });

	} catch (err) {
		return res.json({ error: err });
	}
});

router.post("/set-allergies", IS_LOGGED_IN, async (req, res) => {
	const allergies = req.body.allergies;
	const userId = req.session.user.userId;
	const allergiesJoin = allergies.join(',');

	try {
		await connection.execute('UPDATE user_info SET allergies = ? WHERE user_id = ?', [allergiesJoin, userId]);
		return res.json({ message: 'Successfully Updated Allgeries' });
	} catch (err) {
		return res.json({ error: err });
	}

});

router.post("/set-dietary-restrictions", IS_LOGGED_IN, async (req, res) => {
	const dietary_restrictions = req.body.dietary_restrictions;
	const userId = req.session.user.userId;
	const dietaryRestrictionsJoin = dietary_restrictions.join(',');

	try {
		await connection.execute('UPDATE user_info SET dietary_restrictions = ? WHERE user_id = ?', [dietaryRestrictionsJoin, userId]);
		return res.json({ message: 'Successfully Updated Dietary Restrictions' });
	} catch (err) {
		return res.json({ error: err });
	}
});

router.post('/set-pronouns', IS_LOGGED_IN, async (req, res) => {
	const pronouns = req.body.pronouns;
	const userId = req.session.user.userId;

	try {
		await connection.execute('UPDATE user_info SET pronouns = ? WHERE user_id ?', [pronouns, userId]);
		return res.json({ message: 'Successfully Updated Pronouns' });
	} catch (err){
		return res.json({ error: err });
	}
});
// set color scheme preference
router.post("/set-modes", IS_LOGGED_IN, async (req, res) => {
	const modes = req.body.modes;
	//const userId = req.session.user.userId;
	const userId = req.body.userId;
	// const modesJoin = modes.join(','); (dont need this, selecting 1 or 0)
	// 1 is for dark mode and 0 is for light mode
	// ?: is 'dark' the name of the .css sheet
	const colorScheme = modes === 'darkmode' ? 1 : 0;

	try {
		await connection.execute('INSERT INTO user_info (user_id, modes) VALUES (?, ?) ON DUPLICATE KEY UPDATE theme = ?',
		[userId, colorScheme, colorScheme]);
		return res.json({ message: 'Successfully Updated Color Scheme' });
	} catch (err) {
		return res.json({ error: err });
	}
});

// get color scheme preference
router.get("/get-modes", IS_LOGGED_IN, async (req, res) => {
	const userId = req.execute.userId;
	try {
		await connection.execute('SELECT modes FROM user_info WHERE user_id = ?', [userId]);
		return res.json({ message: 'Successfully Retrieved Color Scheme' });
	} catch (err) {
		return res.json( {error: err });
	}
});




module.exports = router;