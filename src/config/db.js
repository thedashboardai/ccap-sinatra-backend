const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Now it uses the environment variable
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
