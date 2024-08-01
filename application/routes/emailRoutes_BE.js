const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const tokenStore = {};
const { IS_LOGGED_OUT } = require('./APIRequestAuthentication_BE');
const connection = require('./db');
const bcrypt = require('bcryptjs');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'scholareats@gmail.com',
        pass: 'sxai cyvf kaep ocoy',
    },
});



router.post('/forgotpassword', IS_LOGGED_OUT, async (req, res) => {
    const email = req.body.email;
    const token = req.body.token;
    const tokenExpiration = Date.now() + 5 * 60 * 1000


    try{
        const [results] = await connection.execute('SELECT * from users WHERE email = ?', [email]);
        if(results.length === 0){
            return res.status(400).json({ error: 'Not a Valid Email' });
        }
    } catch(err){
        console.log(err);
    }

    tokenStore[token] = {email, tokenExpiration, token}; 
    console.log(tokenStore[token].token);

    const mailOptions = {
        from: 'scholareats@gmail.com',
        to: email,
        subject: 'Reset your ScholarEats Password',
        text: 'Here is the code to reset your password. This code expires in 5 minutes: ' + token,
      };


    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return res.json({ error: error });
        }else{
            return res.json({ message: 'Successfully Sent Email!' });
        }
    });
  
    return res.json({ message: 'Successfully Sent Email!' });
});

router.post('/resetPassword',IS_LOGGED_OUT, async (req,res)=> {
    const token = req.body.token;
    const newPassword = req.body.newPassword;
    const confirmNewPass = req.body.confirmNewPass
    currentTokenInfo = tokenStore[token];
    
    if (!currentTokenInfo){
        return res.status(400).json({ error: 'Invalid Token' });
    }

    if (newPassword !== confirmNewPass) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    if(Date.now() >= currentTokenInfo.tokenExpiration){
        return res.status(400).json({ error: 'Token Session has Expired'});
    }

    try {
		// Hash the new password
		const hash = await bcrypt.hash(newPassword, 10);

		// Update the password in the database
		await connection.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hash, currentTokenInfo.email]);

		delete tokenStore[token];
        return res.json({ message: 'Password has been reset successfully' });
	} catch (err) {
		console.error('Error changing password:', err);
		return res.status(500).json({ error: 'An error occurred while changing the password' });
	}

    
});


  module.exports = router;