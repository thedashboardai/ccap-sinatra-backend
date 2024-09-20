const { google } = require("googleapis");
const keys = require("../keys/googleServiceAccount.json");

const client = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key,
  ["https://www.googleapis.com/auth/spreadsheets.readonly"]
);

const sheets = google.sheets({ version: "v4", auth: client });

const SHEET_ID = process.env.SHEET_ID;
const RANGE = process.env.RANGE;

// Function to fetch Google Sheets data
const getSheetsData = async () => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values;
  if (!rows.length) {
    throw new Error("No data found in Google Sheets");
  }

  const formattedData = rows.map((row, index) => ({
    submissionId: index.toString(),
        firstName: row[3] || "",
        lastName: row[4] || "",
        preferredName: row[5] || "",
        email: row[6] || "",
        mailingAddress: `${row[7]}\n${row[8]}\n${row[9]}, ${row[10]}, ${row[11]}` || "",
        dob: row[14] || "",
        mobileNumber: row[15] || "",
        graduationYear: row[16] || "",
        stateOfResidence: row[10] || "",
        stateOfRelocation: row[13]?.split(",").map((state) => state.trim()) || [],
        question1: row[17] || "",
        question2: row[18] || "",
        question3: row[19] || "",
        availableTimes: row[20] || "",
        availableWeekends: row[21] || "",
        question5: row[22] || "",
        question6: row[23] || "",
        question7: row[24] || "",
        question8: row[25] || "",
        question9: row[26] || "",
        question10: row[27] || "",
        question11: row[28] || "",
        question12: row[29] || "",
        question13: row[30] || "",
        question14: row[31] || "",
        question15: row[32] || "",
        question16: row[33] || "",
        question17: row[34] || "",
        question18: row[35] || "",
        uploadFoodHandlersCard: row[36] || "", // New column for Food Handlers Card upload
        question19: row[37] || "",
        question20: row[38] || "",
        question21: row[39] || "",
  }));

  return { rows, formattedData };
};

module.exports = {
  getSheetsData,
};
