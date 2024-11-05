const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

router.get('/upload-url', portfolioController.getPresignedUrl);

module.exports = router;
