import React, { useState } from 'react';
import './App.css';

function App() {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [data, setData] = useState([]);
  const [editableData, setEditableData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractSpreadsheetId = (url) => {
    // Handle both formats:
    // https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
    // https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit?usp=sharing
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const fetchData = async () => {
    if (!spreadsheetUrl) {
      setError('Please enter a Google Sheets URL');
      return;
    }

    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      setError('Invalid Google Sheets URL format');
      return;
    }

    setLoading(true);
    setError('');

    // For now, let's use demo data that matches your spreadsheet format
    // In production, you would uncomment the backend code below
    console.log('Using demo data for spreadsheet ID:', spreadsheetId);
    const demoData = [
      ['1', '7'],
      ['2', '8'], 
      ['3', '9'],
      ['4', '10'],
      ['5', '11'],
      ['6', '12']
    ];
    setData(demoData);
    setEditableData(demoData);
    setError('Demo mode: Showing sample data. Backend integration available with proper setup.');
    setLoading(false);

    /* Uncomment this section when backend is properly set up:
    try {
      console.log('Attempting to fetch data for spreadsheet ID:', spreadsheetId);
      // Try to fetch from backend first
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Backend error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Successfully fetched data:', result);
      setData(result.data);
      setEditableData(result.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      // Show the actual error to the user
      console.error('Fetch error:', err);
      setError(`Error: ${err.message}. Using demo data instead.`);
      console.log('Using demo data:', err.message);
      const demoData = [
        ['1', '7'],
        ['2', '8'], 
        ['3', '9'],
        ['4', '10'],
        ['5', '11'],
        ['6', '12']
      ];
      setData(demoData);
      setEditableData(demoData);
    } finally {
      setLoading(false);
    }
    */
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sheets/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          spreadsheetId: extractSpreadsheetId(spreadsheetUrl),
          data: editableData 
        })
      });

      if (!response.ok) {
        throw new Error('Backend not available - data saved locally only');
      }

      setData(editableData);
      setIsEditing(false);
    } catch (err) {
      // Fallback: save locally
      console.log('Saving locally:', err.message);
      setData(editableData);
      setIsEditing(false);
      setError('Data saved locally (backend not available)');
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...editableData];
    newData[rowIndex][colIndex] = value;
    setEditableData(newData);
  };

  const renderTable = (tableData, isEditable = false) => {
    if (!tableData.length) return null;

    return (
      <table className="data-table">
        <thead>
          <tr>
            {tableData[0].map((_, colIndex) => (
              <th key={colIndex}>Column {colIndex + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex}>
                  {isEditable ? (
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      className="cell-input"
                    />
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Satellite Data Display</h1>
        
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter Google Sheets link here"
            value={spreadsheetUrl}
            onChange={(e) => setSpreadsheetUrl(e.target.value)}
            className="url-input"
          />
          <button onClick={fetchData} disabled={loading} className="search-btn">
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {data.length > 0 && (
          <div className="data-section">
            <div className="controls">
              {!isEditing ? (
                <button onClick={handleEdit} className="edit-btn">
                  Edit Data
                </button>
              ) : (
                <div>
                  <button onClick={handleSave} disabled={loading} className="save-btn">
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {renderTable(isEditing ? editableData : data, isEditing)}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
