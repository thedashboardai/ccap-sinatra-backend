const { google } = require('googleapis');

const googleServiceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
  credentials: googleServiceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

module.exports = auth;
