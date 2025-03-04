const { Pool } = require('pg');

const pool = new Pool({
  user: 'ubvlqq245vlfm7',
  host: 'c97r84s7psuajm.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'd2b4m0fjeprb2u',
  password: 'pb202e75148a70f54e16a0e20c8cd0464415a02b45c361f84e53afff5a56ae97c',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
