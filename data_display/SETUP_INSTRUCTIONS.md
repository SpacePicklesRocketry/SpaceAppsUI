# Satellite Data Display - Setup Instructions

## Google Service Account Setup

To use this application with Google Sheets, you need to set up a Google Service Account:

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

### 2. Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `satellite-data-service`
   - Description: `Service account for Satellite Data Display app`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 3. Generate Service Account Key
1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the JSON file and rename it to `credentials.json`
7. Place this file in the `backend` folder

### 4. Share Google Sheets
1. Open your Google Sheets document
2. Click "Share" button
3. Add the service account email (found in the credentials.json file)
4. Give it "Editor" permissions
5. Click "Send"

## Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend folder:
   ```
   PORT=5000
   GOOGLE_CREDENTIALS_FILE=./credentials.json
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

## Frontend Setup

1. Navigate to the main project folder:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

## Usage

1. Make sure both frontend and backend servers are running
2. Open your browser to `http://localhost:3000`
3. Enter a Google Sheets URL in the format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
4. Click "Search" to load the data
5. Click "Edit Data" to modify the data
6. Click "Save" to update the Google Sheets

## Important Notes

- The service account must have access to the Google Sheets you want to edit
- The app reads from and writes to "Sheet1" by default
- Make sure your Google Sheets has data in the first sheet
- The app supports up to 26 columns (A-Z) by default

## Troubleshooting

- **"Failed to fetch data"**: Check if the service account has access to the spreadsheet
- **"Invalid Google Sheets URL"**: Make sure the URL follows the correct format
- **Backend connection issues**: Ensure the backend server is running on port 5000
