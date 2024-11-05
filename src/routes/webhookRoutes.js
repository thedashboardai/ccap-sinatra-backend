const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Define the webhook route
router.post('/tally/register', webhookController.registerUserFromTally);

module.exports = router;
