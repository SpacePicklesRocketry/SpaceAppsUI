import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Google Apps Script URL for fetching data
  const SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycby4aXux4-5ZGWD4mWiCyYLtZtresjFkibkl4vG_dcgL_yFs7TkBj-8UvO9hQTPMQIgI/exec";
  
  const [data, setData] = useState([]);
  const [editableData, setEditableData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data automatically when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Fetching data from Google Apps Script...');
      
      const response = await fetch(SPREADSHEET_URL, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Successfully fetched data:', result);
      
      // Handle the data format - assuming it's a 2D array
      if (Array.isArray(result)) {
        setData(result);
        setEditableData(result);
        setError('');
      } else if (result.data && Array.isArray(result.data)) {
        setData(result.data);
        setEditableData(result.data);
        setError('');
      } else {
        throw new Error('Unexpected data format received');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      
      // Check if it's a CORS error
      if (err.message.includes('CORS') || err.message.includes('blocked')) {
        setError('CORS error: Google Apps Script may need to be deployed as a web app with proper permissions. Using demo data instead.');
      } else {
        setError(`Error: ${err.message}. Using demo data instead.`);
      }
      
      // Fallback demo data
      const demoData = [
        ['5', '7'],
        ['5', '8'], 
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
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setLoading(true);
    
    // Since we're only reading from Google Apps Script, save locally
    console.log('Saving data locally...');
    setData(editableData);
    setIsEditing(false);
    setError('Data saved locally (read-only mode)');
    setLoading(false);
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
        <p>Data loaded from Google Apps Script</p>
        
        {loading && <div className="loading">Loading data from Google Apps Script...</div>}
        {error && <div className="error">{error}</div>}

        {data.length > 0 && (
          <div className="data-section">
            <div className="controls">
              <button onClick={fetchData} disabled={loading} className="refresh-btn">
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
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
