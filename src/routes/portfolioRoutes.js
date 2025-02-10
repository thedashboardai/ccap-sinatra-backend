const express = require('express');
const pool = require('../config/db');
const authenticateJWT = require('../middleware/authenticateJWT');
const AWS = require('aws-sdk');

const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { email } = req.user;

    const userQuery = 'SELECT id FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].id;

    const portfolioQuery = 'SELECT * FROM portfolio WHERE user_id = $1';
    const portfolioResult = await pool.query(portfolioQuery, [userId]);

    res.json(portfolioResult.rows);
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/upload-url', authenticateJWT, async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `portfolio/${fileName}`,
      Expires: 60, 
    };

    const uploadURL = await s3.getSignedUrlPromise('putObject', params);

    res.json({ uploadURL });
  } catch (error) {
    console.error('Error generating upload URL:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/add', authenticateJWT, async (req, res) => {
  try {
    const { email } = req.user;
    const { title, description, image_url } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ error: 'Title and image URL are required' });
    }

    const userQuery = 'SELECT id FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].id;

    const insertQuery = `
      INSERT INTO portfolio (user_id, title, description, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [userId, title, description, image_url]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding portfolio entry:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ error: 'Title and image URL are required' });
    }

    const updateQuery = `
      UPDATE portfolio
      SET title = $1, description = $2, image_url = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [title, description, image_url, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Portfolio entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating portfolio entry:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM portfolio WHERE id = $1 RETURNING *;';
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Portfolio entry not found' });
    }

    res.json({ message: 'Portfolio entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio entry:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
