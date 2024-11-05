const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Ensure these functions are defined and available
const { authenticateToken, getProfile, updateProfile } = profileController;

// Get Profile
router.get('/', authenticateToken, getProfile);

// Update Profile
router.put('/update', authenticateToken, updateProfile);

module.exports = router;
