// Simple test script to verify the setup
const fetch = require('node-fetch');

async function testConnection() {
  try {
    console.log('Testing backend connection...');
    const response = await fetch('http://localhost:5000/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetId: '1pHq-AqK4n5VYqx6j8R_CraASY0tCVzcan1GwJoXNebE' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is working! Data received:', data);
    } else {
      console.log('❌ Backend error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
}

testConnection();
