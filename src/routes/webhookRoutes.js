const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/tally/register', webhookController.registerUserFromTally);

module.exports = router;
