# Troubleshooting Guide

## Current Status
✅ **Frontend is working** - The React app displays data correctly
✅ **Backend API is working** - Successfully fetches data from your Google Sheets
❌ **Proxy connection** - Frontend and backend aren't connecting properly

## Quick Fix - Demo Mode
The app is currently set to demo mode and will show sample data that matches your spreadsheet format:
- Data: `[["1","7"],["2","8"],["3","9"],["4","10"],["5","11"],["6","12"]]`
- This matches the format from your Google Sheets

## To Enable Real Google Sheets Integration

### Option 1: Manual Server Start
1. Open two separate command prompts
2. In first terminal: `cd backend && npm start`
3. In second terminal: `cd data_display && npm start`
4. Test the connection

### Option 2: Use the Batch File
1. Double-click `start-servers.bat`
2. This will start both servers automatically

### Option 3: Fix Proxy Issues
The issue is likely with the proxy configuration. Try these steps:

1. **Check if backend is running:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5000/api/sheets" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"spreadsheetId":"1pHq-AqK4n5VYqx6j8R_CraASY0tCVzcan1GwJoXNebE"}'
   ```

2. **If backend works, uncomment the backend code in App.js:**
   - Open `src/App.js`
   - Find the commented section starting with `/* Uncomment this section...`
   - Uncomment that entire block
   - Comment out the demo data section

3. **Restart both servers**

## Verification Steps

### Test Backend Directly
```powershell
# This should return your Google Sheets data
Invoke-WebRequest -Uri "http://localhost:5000/api/sheets" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"spreadsheetId":"1pHq-AqK4n5VYqx6j8R_CraASY0tCVzcan1GwJoXNebE"}'
```

### Test Frontend Proxy
```powershell
# This should also work if proxy is configured correctly
Invoke-WebRequest -Uri "http://localhost:3000/api/sheets" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"spreadsheetId":"1pHq-AqK4n5VYqx6j8R_CraASY0tCVzcan1GwJoXNebE"}'
```

## Common Issues

1. **"Cannot POST /api/sheets"** - Backend not running or proxy not working
2. **"Backend not available"** - Backend server not started
3. **"Invalid Google Sheets URL"** - URL format issue (your URL is correct)
4. **CORS errors** - Backend CORS configuration issue

## Your Google Sheets URL
✅ **Correct format**: `https://docs.google.com/spreadsheets/d/1pHq-AqK4n5VYqx6j8R_CraASY0tCVzcan1GwJoXNebE/edit?usp=sharing`
✅ **Extracted ID**: `1pHq-AqK4n5VYqx6j8R_CraASY0tCVzcan1GwJoXNebE`
✅ **Backend can fetch data**: Confirmed working

## Next Steps
1. The app currently works in demo mode
2. To enable real Google Sheets integration, follow the manual server start instructions
3. Once both servers are running, uncomment the backend code in App.js
4. The app will then fetch real data from your Google Sheets
