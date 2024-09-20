const express = require('express');
const admin = require('../config/firebaseAdmin');  // Importing initialized Firebase Admin SDK
const { getSheetsData } = require('../services/sheetsService');
const { findUserByFirebaseUid, createUser } = require('../models/userModel');

const router = express.Router();

router.get('/sheets-data', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];  // Extract Bearer token

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email } = decodedToken;  // Get Firebase UID and email
        console.log("CC", uid)
        // Check if the user exists in the database
        let user = await findUserByFirebaseUid(uid);

        if (!user) {
            // If user doesn't exist, create a new user in the database
            user = await createUser(uid, email);
        }

        // Fetch Google Sheets data
        const sheetsData = await getSheetsData();

        // Send the response (don't include password)
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at
            },
            sheetsData
        });
    } catch (error) {
        console.error('Error verifying token or fetching sheets data:', error);
        return res.status(500).json({ error: 'Failed to retrieve sheets data' });
    }
});

module.exports = router;
