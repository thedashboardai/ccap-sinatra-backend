const express = require("express");
const pool = require("../config/db");
const authenticateJWT = require("../middleware/authenticateJWT");
const AWS = require("aws-sdk");
const multer = require("multer");

const router = express.Router();

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4", // Use SigV4 for better compatibility
});

const s3 = new AWS.S3();

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

// Set up CORS configuration on initialization
async function setupS3Cors() {
  try {
    const corsParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "HEAD"],
            AllowedOrigins: ["*"], // In production, use your specific domain
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    };

    await s3.putBucketCors(corsParams).promise();
    console.log("S3 CORS configuration updated successfully");
  } catch (error) {
    console.error("Error setting up S3 CORS:", error);
    // Continue operation even if CORS setup fails
  }
}

// Initialize CORS setup on startup
setupS3Cors().catch(console.error);

// In src/routes/portfolioRoutes.js - Update the GET route
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { email } = req.user;

    // Get user ID from email
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Get all portfolio items for the user
    const portfolioQuery =
      "SELECT * FROM portfolio WHERE user_id = $1 ORDER BY created_at DESC";
    const portfolioResult = await pool.query(portfolioQuery, [userId]);

    // Ensure all image URLs are properly formatted
    const portfolioItems = portfolioResult.rows.map((item) => ({
      ...item,
      // Make sure the image_url is absolute and properly formatted
      image_url: ensureFullImageUrl(item.image_url),
    }));

    res.json(portfolioItems);
  } catch (error) {
    console.error("Error fetching portfolio:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add this helper function at the top of the file
function ensureFullImageUrl(url) {
  if (!url) return null;

  // If URL is already absolute, return it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Otherwise, construct the full S3 URL
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${url}`;
}

// Get a specific portfolio item
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.user;

    // Get user ID from email
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Get the portfolio item
    const portfolioQuery =
      "SELECT * FROM portfolio WHERE id = $1 AND user_id = $2";
    const portfolioResult = await pool.query(portfolioQuery, [id, userId]);

    if (portfolioResult.rowCount === 0) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }

    res.json(portfolioResult.rows[0]);
  } catch (error) {
    console.error("Error fetching portfolio item:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Generate a signed URL for S3 upload
router.post("/upload-url", authenticateJWT, async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    // Generate unique file name to prevent collisions
    const timestamp = new Date().getTime();
    // Remove special characters and spaces from filename
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `portfolio/${timestamp}-${sanitizedFileName}`;

    // Set up S3 parameters with explicit content type
    // Removed ACL parameter
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uniqueFileName,
      Expires: 600, // URL expires in 10 minutes
      ContentType: fileType || "image/jpeg",
    };

    // Generate the signed URL
    const uploadURL = await s3.getSignedUrlPromise("putObject", params);

    // Define the final URL where the file will be accessible
    const fileURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    res.json({
      uploadURL,
      fileURL,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// In src/routes/portfolioRoutes.js - Update the direct upload route
router.post(
  "/upload",
  authenticateJWT,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { email } = req.user;
      const file = req.file;
      const timestamp = new Date().getTime();
      const uniqueFileName = `portfolio/${timestamp}-${file.originalname.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      )}`;

      console.log(
        `Uploading file: ${uniqueFileName}, type: ${file.mimetype}, size: ${file.size} bytes`
      );

      // Upload the file directly to S3
      // Removed ACL parameter
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        const uploadResult = await s3.upload(params).promise();
        console.log(`File uploaded successfully to: ${uploadResult.Location}`);

        // Return the URL of the uploaded file
        res.json({
          fileURL: uploadResult.Location,
          message: "File uploaded successfully",
        });
      } catch (s3Error) {
        console.error("S3 upload error:", s3Error);
        res.status(500).json({ error: "Error uploading file to S3" });
      }
    } catch (error) {
      console.error("Error uploading file:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Add a new portfolio item
router.post("/add", authenticateJWT, async (req, res) => {
  try {
    const { email } = req.user;
    const { title, description, image_url } = req.body;

    if (!title || !image_url) {
      return res
        .status(400)
        .json({ error: "Title and image URL are required" });
    }

    // Get user ID from email
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Insert the portfolio item
    const insertQuery = `
      INSERT INTO portfolio (user_id, title, description, image_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [
      userId,
      title,
      description,
      image_url,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding portfolio entry:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a portfolio item
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.user;
    const { title, description, image_url } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Get user ID from email
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Check if the portfolio item exists and belongs to the user
    const checkQuery = "SELECT * FROM portfolio WHERE id = $1 AND user_id = $2";
    const checkResult = await pool.query(checkQuery, [id, userId]);
    if (checkResult.rowCount === 0) {
      return res
        .status(404)
        .json({
          error:
            "Portfolio item not found or you do not have permission to update it",
        });
    }

    // Update the portfolio item
    const updateQuery = `
      UPDATE portfolio
      SET title = $1, 
          description = $2, 
          image_url = COALESCE($3, image_url),
          updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [
      title,
      description,
      image_url, // Only update image_url if it's provided
      id,
      userId,
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating portfolio entry:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a portfolio item
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.user;

    // Get user ID from email
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Check if the portfolio item exists and belongs to the user
    const checkQuery = "SELECT * FROM portfolio WHERE id = $1 AND user_id = $2";
    const checkResult = await pool.query(checkQuery, [id, userId]);
    if (checkResult.rowCount === 0) {
      return res
        .status(404)
        .json({
          error:
            "Portfolio item not found or you do not have permission to delete it",
        });
    }

    // Get the image URL to potentially delete from S3 later
    const imageUrl = checkResult.rows[0].image_url;

    // Delete the portfolio item
    const deleteQuery =
      "DELETE FROM portfolio WHERE id = $1 AND user_id = $2 RETURNING *;";
    const result = await pool.query(deleteQuery, [id, userId]);

    res.json({
      message: "Portfolio entry deleted successfully",
      deletedItem: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting portfolio entry:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
