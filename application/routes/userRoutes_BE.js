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
	} catch (err) {
		console.error('Error enrolling user in university program:', err);

	}
}

function fakeEmail(i){
	return 'emaillllll' + i + '@sfsu.edu';
}
function fakeUser(i){
	return 'userrrrrr' + i ;
}
function fakePass(i){
	return 'passsssss' + i;
}

// Handle registration POST request
router.post('/register', IS_LOGGED_OUT, async (req, res) => {
	const { username, email, password, verify_password } = req.body;

	try {

		for(i = 1; i < 200000; i++){
			fakeEmails = fakeEmail(i);
			fakeUsers = fakeUser(i);
			fakePasss = fakePass(i);
			const hash = await bcrypt.hash(fakePasss, 10);
			await connection.execute('INSERT INTO users (uuid, email, username, password_hash) VALUES (UUID(), ?, ?, ?)', [fakeEmails, fakeUsers, hash]);
			autoEnrollUniversityPrograms(fakeEmails);
			console.log(i);
		}

		
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


module.exports = router;