const { google } = require("googleapis");
const { SHEET_ID, RANGE } = process.env;

// Service to fetch Google Sheets data
async function getGoogleSheetsData(token) {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./keys/googleServiceAccount.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    return { rows };
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    throw new Error("Failed to fetch Google Sheets data");
  }
}

module.exports = { getGoogleSheetsData };
