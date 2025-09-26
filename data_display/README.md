# Satellite Data Display

A React application that allows you to read from and write to Google Sheets with a beautiful, modern UI.

## Features

- 📊 **Data Display**: View Google Sheets data in a clean, responsive table
- ✏️ **Edit Data**: Inline editing capabilities for all table cells
- 💾 **Save Changes**: Update Google Sheets with your modifications
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🔄 **Demo Mode**: Works with demo data when backend is not available
- 📱 **Responsive**: Mobile-friendly design

## Quick Start

### Option 1: Demo Mode (No Backend Required)
1. Install dependencies: `npm install`
2. Start the app: `npm start`
3. Enter any Google Sheets URL and click "Search"
4. The app will use demo satellite data for demonstration

### Option 2: Full Google Sheets Integration
1. Follow the setup instructions in `SETUP_INSTRUCTIONS.md`
2. Set up Google Service Account
3. Start both frontend and backend servers
4. Use with real Google Sheets data

## Project Structure

```
data_display/
├── src/
│   ├── App.js          # Main React component
│   ├── App.css         # Styling
│   └── index.js        # React entry point
├── backend/
│   ├── server.js       # Express API server
│   └── package.json    # Backend dependencies
├── SETUP_INSTRUCTIONS.md
└── README.md
```

## Technologies Used

- **Frontend**: React, CSS3 with gradients and animations
- **Backend**: Express.js, Google Sheets API
- **Authentication**: Google Service Account
- **Styling**: Modern CSS with responsive design

## Usage

1. **Load Data**: Enter a Google Sheets URL and click "Search"
2. **View Data**: Data appears in a formatted table
3. **Edit Data**: Click "Edit Data" to enable inline editing
4. **Save Changes**: Click "Save" to update the Google Sheets
5. **Cancel**: Click "Cancel" to discard changes

## Demo Data

When the backend is not available, the app displays sample satellite data:
- International Space Station (ISS)
- Hubble Space Telescope
- Voyager 1
- Mars Rover

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own needs!