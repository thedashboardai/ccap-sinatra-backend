require('dotenv').config();
const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Import Webhook Route
const webhookRoutes = require('./routes/webhookRoutes');

// Use Webhook Route
app.use('/api/webhook', webhookRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

const portfolioRoutes = require('./routes/portfolioRoutes');
app.use('/api/portfolio', portfolioRoutes);

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
