const express = require("express");
const { verifyFirebaseToken } = require("../middlewares/authMiddleware");
const { getGoogleSheetsData } = require("../services/sheetsService");
const router = express.Router();
const { signInWithEmailAndPassword, auth } = require("../config/firebaseAdmin");

// API route to login and get Google Sheets data
router.post("/login-and-get-sheets", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Get Google Sheets data
    const sheetsData = await getGoogleSheetsData(token);

    res.status(200).json({ user, token, sheetsData });
  } catch (error) {
    console.error("Login and fetching sheets data failed", error.message);
    res.status(500).json({ message: "Error during login or fetching data" });
  }
});

module.exports = router;
