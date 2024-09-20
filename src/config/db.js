const { Pool } = require('pg');

// Create a new pool for PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Export the pool for querying the database
module.exports = pool;
