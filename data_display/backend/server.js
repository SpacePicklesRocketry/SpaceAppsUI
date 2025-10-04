const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_SPREADSHEET_ID = process.env.SPREADSHEET_ID;

app.use(cors());
app.use(express.json());

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_FILE || './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Fetch data from Google Sheets
app.post('/api/sheets', async (req, res) => {
  try {
    const { spreadsheetId, spreadsheetUrl, range } = req.body || {};
    let target = spreadsheetId || spreadsheetUrl || DEFAULT_SPREADSHEET_ID;

    console.log('Received request body for /api/sheets:', { spreadsheetId, spreadsheetUrl, envFallback: !!DEFAULT_SPREADSHEET_ID });

    if (!target) {
      return res.status(400).json({ error: 'Spreadsheet ID or URL is required' });
    }

    // Normalize: remove surrounding angle-brackets if present (curl often adds them)
    let rawTarget = String(target).trim();
    rawTarget = rawTarget.replace(/^<|>$/g, '');

    // Try to extract ID from common URL formats or accept a plain ID
    const idRegex = /\/d\/([a-zA-Z0-9-_]+)|spreadsheets\/d\/([a-zA-Z0-9-_]+)|^([a-zA-Z0-9-_]{15,})$/;
    const idMatch = rawTarget.match(idRegex);
    let targetSpreadsheetId = rawTarget;
    if (idMatch) {
      targetSpreadsheetId = idMatch[1] || idMatch[2] || idMatch[3] || rawTarget;
    }

  console.log('Using spreadsheet ID:', targetSpreadsheetId, ' (raw input:', rawTarget, ')');

    // If range not provided, detect the first sheet name and request A:Z on it
    let targetRange = range;
    if (!targetRange) {
      // get spreadsheet metadata to find the first sheet name
      const meta = await sheets.spreadsheets.get({ spreadsheetId: targetSpreadsheetId });
      const sheetsInfo = meta.data.sheets || [];
      const firstSheetName = (sheetsInfo[0] && sheetsInfo[0].properties && sheetsInfo[0].properties.title) || 'Sheet1';
      targetRange = `${firstSheetName}!A:Z`;
    }

    console.log('Attempting to fetch data from Google Sheets...', { spreadsheetId: targetSpreadsheetId, range: targetRange });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: targetSpreadsheetId,
      range: targetRange,
    });

    const rows = response.data.values || [];
    console.log('Successfully fetched', rows.length, 'rows of data');
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching data:', error && error.message);
    console.error('Full error:', error);
    // try to surface more useful info when available
    const details = (error && error.errors) ? error.errors : (error && error.message) ? error.message : error;
    res.status(500).json({ 
      error: 'Failed to fetch data from Google Sheets',
      details,
    });
  }
});

// Update data in Google Sheets
app.post('/api/sheets/update', async (req, res) => {
  try {
    const { spreadsheetId, spreadsheetUrl, data } = req.body || {};
    let target = spreadsheetId || spreadsheetUrl || DEFAULT_SPREADSHEET_ID;

    if (!target || !data) {
      return res.status(400).json({ error: 'Spreadsheet ID (or URL) and data are required' });
    }

    // sanitize and extract id if needed
    let rawTarget = String(target).trim();
    rawTarget = rawTarget.replace(/^<|>$/g, '');
    const idRegex = /\/d\/([a-zA-Z0-9-_]+)|spreadsheets\/d\/([a-zA-Z0-9-_]+)|^([a-zA-Z0-9-_]{15,})$/;
    const idMatch = rawTarget.match(idRegex);
    const targetSpreadsheetId = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3]) : rawTarget;

    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range: 'Sheet1!A:Z',
      valueInputOption: 'RAW',
      resource: {
        values: data,
      },
    });

    res.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data in Google Sheets' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
