// src/scripts/create-portfolio-table.js
const pool = require('../config/db');

async function createPortfolioTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS portfolio (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create index on user_id for better performance
      CREATE INDEX IF NOT EXISTS portfolio_user_id_idx ON portfolio(user_id);
    `;

    await pool.query(createTableQuery);
    console.log('Portfolio table created successfully');
  } catch (error) {
    console.error('Error creating portfolio table:', error.message);
  } finally {
    pool.end();
  }
}

createPortfolioTable();