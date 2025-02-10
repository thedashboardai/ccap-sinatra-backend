const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('../middleware/authenticateJWT'); 

const admin = require('../utils/firebaseUtil');

const router = express.Router();

router.post('/login', authenticateJWT, async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userQuery = 'SELECT * FROM users WHERE email = $1';
      const userResult = await pool.query(userQuery, [email]);
  
      if (userResult.rowCount === 0) {
        return res.status(400).json({ error: 'User does not exist' });
      }
  
      const user = userResult.rows[0];
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      res.json({ message: 'Login successful', user });
    } catch (error) {
      console.error('Login Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

router.put('/reset-password', authenticateJWT, async (req, res) => {
    const { email, newPassword } = req.body;
    console.log("AA", email, newPassword)
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
  
    try {
      const userQuery = 'SELECT * FROM users WHERE email = $1';
      const userResult = await pool.query(userQuery, [email]);
  
      if (userResult.rowCount === 0) {
        return res.status(400).json({ error: 'User does not exist' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10); 
  
      const firebaseUser = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(firebaseUser.uid, { password: newPassword });
  
      const updateQuery = 'UPDATE users SET password = $1 WHERE email = $2';
      await pool.query(updateQuery, [hashedPassword, email]);
  
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset Password Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

module.exports = router;
