const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = profileController;

router.get('/', authenticateToken, profileController.getProfile);
router.put('/update', authenticateToken, profileController.updateProfile);

module.exports = router;
