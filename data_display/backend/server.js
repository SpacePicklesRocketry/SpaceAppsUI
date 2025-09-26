const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
    const { spreadsheetId } = req.body;
    
    console.log('Received request for spreadsheet ID:', spreadsheetId);
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }

    console.log('Attempting to fetch data from Google Sheets...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:Z', // Adjust range as needed
    });

    const rows = response.data.values || [];
    console.log('Successfully fetched', rows.length, 'rows of data');
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from Google Sheets',
      details: error.message 
    });
  }
});

// Update data in Google Sheets
app.post('/api/sheets/update', async (req, res) => {
  try {
    const { spreadsheetId, data } = req.body;
    
    if (!spreadsheetId || !data) {
      return res.status(400).json({ error: 'Spreadsheet ID and data are required' });
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
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
