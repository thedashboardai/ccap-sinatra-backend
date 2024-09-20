// src/models/userModel.js
const pool = require('../config/db');

// Check if user exists in the database
async function findUserByFirebaseUid(firebaseUid) {
    const query = 'SELECT * FROM users WHERE firebase_uid = $1';
    const result = await pool.query(query, [firebaseUid]);
    return result.rows[0];  // Return the user record if found
}

// Insert a new user into the database
async function createUser(firebaseUid, email) {
    const query = 'INSERT INTO users (firebase_uid, email) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [firebaseUid, email]);
    return result.rows[0];  // Return the newly created user record
}

module.exports = { findUserByFirebaseUid, createUser };
