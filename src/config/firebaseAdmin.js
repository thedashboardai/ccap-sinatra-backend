const admin = require("firebase-admin");
const serviceAccount = require("../keys/firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
