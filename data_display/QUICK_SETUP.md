# Quick Setup Guide for New Computers

## Why This Project Doesn't Work on Other Computers

This project requires several files that are **NOT included** in version control for security reasons:

1. **`backend/credentials.json`** - Google Service Account authentication
2. **`backend/.env`** - Backend configuration
3. **`node_modules/`** - JavaScript dependencies

## Quick Setup Steps

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Set Up Google Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account
5. Download the JSON key file
6. Rename it to `credentials.json`
7. Place it in the `backend/` folder

### 3. Create Environment File
```bash
cd backend
cp env.template .env
```

### 4. Share Google Sheets
1. Open your Google Sheets document
2. Click "Share"
3. Add the service account email (from credentials.json)
4. Give it "Editor" permissions

### 5. Start the Application
```bash
# Start backend (in one terminal)
cd backend
npm start

# Start frontend (in another terminal)
npm start
```

## Template Files Available
- `backend/env.template` - Copy to `.env`
- `backend/credentials-template.json` - Reference for creating credentials.json

## Troubleshooting
- **"Cannot find module"** → Run `npm install` in both directories
- **"Failed to fetch data"** → Check Google Service Account setup
- **"Port already in use"** → Kill existing processes or use different ports
