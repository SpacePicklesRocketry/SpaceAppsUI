# Array Data Integration

## Overview
The application now supports array-formatted data from Google Sheets in the format `[12.2,12.5,12.5]`. This allows for historical sensor data and multiple readings per module.

## How It Works

### 1. Array Detection
The system automatically detects array data by checking if a value:
- Is a string
- Starts with `[` and ends with `]`
- Contains comma-separated values

### 2. Data Parsing
When array data is detected:
- Values are split by commas
- Each value is parsed as a number if possible
- Non-numeric values are kept as strings
- The result is a JavaScript array

### 3. Value Extraction
- **Latest Value**: The last (most recent) value in the array
- **All Values**: Complete array for historical data
- **History**: Used for sensor charts and trends

## Supported Data Types

### Sensor Data
- **Temperature**: `[22.1,22.5,22.2,22.4]` → Shows 22.4°C (latest)
- **Battery**: `[12.6,12.5,12.3,12.1]` → Shows 12.1V (latest)
- **Pressure**: `[101.1,101.2,101.3]` → Shows 101.3kPa (latest)
- **Radiation**: `[0.10,0.11,0.12]` → Shows 0.12mSv (latest)

### Status Data
- **Obstacle Avoidance**: `[0.1,0.2,0.3]` → Shows latest status based on 0.3
- **Module Status**: `[OK,WARN,OK]` → Shows "OK" (latest)

## Implementation Details

### Functions Added
1. `parseArrayData(value)` - Detects and parses array strings
2. `getLatestValue(value)` - Extracts the most recent value
3. `getAllValues(value)` - Returns complete array for history

### Components Updated
- **App.js**: Main data parsing and sensor mapping
- **ModuleCard.js**: Module status display
- **ObstacleAvoidanceCard.js**: Obstacle status display

## Example Usage

### Google Sheet Format
```
CORE_TEMP    | [22.1,22.5,22.2,22.4]
BATTERY_VOLTS| [12.6,12.5,12.3,12.1]
OBSTACLE     | [0.1,0.2,0.3]
```

### Displayed Values
- Temperature: 22.4°C (with history [22.1,22.5,22.2,22.4])
- Battery: 12.1V (with history [12.6,12.5,12.3,12.1])
- Obstacle: CLEAR (based on latest value 0.3)

## Benefits
1. **Historical Data**: Complete sensor history for trend analysis
2. **Real-time Updates**: Latest values always displayed
3. **Backward Compatibility**: Single values still work normally
4. **Flexible Format**: Supports mixed numeric and text arrays
5. **Error Handling**: Graceful fallback for malformed data

## Testing
To test array data integration:
1. Update your Google Sheet with array-formatted values
2. Use the "Sync now" button to refresh data
3. Check that latest values are displayed correctly
4. Verify that sensor history charts show the complete array

