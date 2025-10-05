// Simple test script to verify direct script fetch
// Using built-in fetch (Node.js 18+)

// Apps Script Web App URL (ends with /exec)
const SPREADSHEET_URL = 'https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec';

async function testConnection() {
  try {
    console.log('Testing direct script fetch...');
    const response = await fetch(SPREADSHEET_URL, { method: 'GET', headers: { 'Accept': 'application/json' } });
    let payload;
    try {
      payload = await response.json();
    } catch {
      const text = await response.text();
      try { payload = JSON.parse(text); } catch { payload = text; }
    }
    console.log('✅ Script responded:', typeof payload, Array.isArray(payload) ? `array(len=${payload.length})` : '');
  } catch (error) {
    console.log('❌ Fetch failed:', error.message);
  }
}

testConnection();
