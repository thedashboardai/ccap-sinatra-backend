require('dotenv').config();
const express = require('express');
const sequelize = require('./config/db');
const app = express();

app.use(express.json());

sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err));

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/webhook', webhookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
