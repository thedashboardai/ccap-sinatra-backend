const express = require('express');
const { handleTallyWebhook } = require('../services/webhookService');

const router = express.Router();

router.post('/tally/register', async (req, res) => {
  try {
    const formData = req.body.data;
    const response = await handleTallyWebhook(formData);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
