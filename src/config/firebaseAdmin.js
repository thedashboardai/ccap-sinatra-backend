const admin = require("firebase-admin");
const serviceAccount = require("../keys/firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
module.exports = { admin, auth };
