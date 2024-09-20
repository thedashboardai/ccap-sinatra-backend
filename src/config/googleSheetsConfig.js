const { google } = require('googleapis');
const credentials = require('../keys/googleServiceAccount.json');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const getGoogleSheetsClient = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
};

module.exports = getGoogleSheetsClient;
