import React from 'react';

export default function SensorDataTable({ moduleData, moduleName }) {
  // Helper to parse array data from Google Sheets
  const parseArrayData = (value) => {
    if (!value || typeof value !== 'string') return value;
    
    // Check if the value looks like an array (starts with [ and ends with ])
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        // Remove brackets and split by comma, then parse each value
        const arrayStr = trimmed.slice(1, -1);
        const values = arrayStr.split(',').map(v => {
          const parsed = parseFloat(v.trim());
          return isNaN(parsed) ? v.trim() : parsed;
        });
        return values;
      } catch (e) {
        console.warn('Failed to parse array data:', value, e);
        return value;
      }
    }
    return value;
  };

  // Helper to get all values from array data or single value as array
  const getAllValues = (value) => {
    const parsed = parseArrayData(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [parsed]; // Return single value as array
  };

  // Define sensor configurations using dedicated data rows
  const sensorConfigs = [
    { key: 'CORE_TEMP_DATA', label: 'Core Temp', units: '°C', icon: '🌡️' },
    { key: 'BATTERY_VOLTS_DATA', label: 'Battery Volts', units: 'V', icon: '🔋' },
    { key: 'PRESSURE_DATA', label: 'Pressure', units: 'kPa', icon: '📊' },
    { key: 'RADIATION_DATA', label: 'Radiation', units: 'mSv', icon: '⚠️' }
  ];

  // Get all sensor data arrays
  const sensorData = sensorConfigs.map(config => ({
    ...config,
    values: getAllValues(moduleData?.[config.key] || '')
  }));

  // Find the maximum length to determine number of rows
  const maxLength = Math.max(...sensorData.map(sensor => sensor.values.length), 1);

  // Generate row data
  const rows = [];
  for (let i = 0; i < maxLength; i++) {
    const row = {
      index: i + 1,
      values: sensorData.map(sensor => ({
        value: sensor.values[i] || 'N/A',
        units: sensor.units
      }))
    };
    rows.push(row);
  }

  return (
    <div className="sensor-data-table widget">
      <div className="table-header">
        <h3>Sensor Data - {moduleName}</h3>
        <div className="table-info">
          {maxLength} data point{maxLength !== 1 ? 's' : ''} per sensor
        </div>
      </div>
      
      <div className="table-container">
        <table className="sensor-table">
          <thead>
            <tr>
              <th className="index-column">Index</th>
              {sensorData.map((sensor, idx) => (
                <th key={idx} className="sensor-column">
                  <div className="sensor-header">
                    <span className="sensor-icon">{sensor.icon}</span>
                    <div className="sensor-title">
                      <div className="sensor-label">{sensor.label}</div>
                      <div className="sensor-units">{sensor.units}</div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td className="index-cell">{row.index}</td>
                {row.values.map((sensorValue, colIdx) => (
                  <td key={colIdx} className="value-cell">
                    <div className="value-container">
                      <span className="value-text">
                        {typeof sensorValue.value === 'number' 
                          ? sensorValue.value.toFixed(2) 
                          : sensorValue.value
                        }
                      </span>
                      {sensorValue.units && (
                        <span className="value-units">{sensorValue.units}</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
