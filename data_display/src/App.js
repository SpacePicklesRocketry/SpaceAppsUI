import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import UptimeWidget from './components/UptimeWidget';
import MissionTimer from './components/MissionTimer';
import SensorCard from './components/SensorCard';
import MapWidget from './components/MapWidget';
import CommunicationsPanel from './components/CommunicationsPanel';
import LastSyncCard from './components/LastSyncCard';
import ModuleCard from './components/ModuleCard';
import ObstacleAvoidanceCard from './components/ObstacleAvoidanceCard';
import ViewToggleCard from './components/ViewToggleCard';
import SensorDataTable from './components/SensorDataTable';

// Mock data shaped to the dashboard contract
const mock = {
  mission: {
    id: 'MV-1',
    name: 'Mission Volta (MV-1) Module Alpha - Astro',
    startTime: '2025-09-30T12:00:00Z',
    endTime: '2025-10-07T12:00:00Z'
  },
  status: {
    overall: 'OK',
    uptimePct: 99.2,
    lastUp: '2025-10-01T10:01:00Z',
    lastDown: '2025-10-01T09:58:12Z'
  },
  communications: {
    lastUplink: '2025-10-01T10:01:00Z',
    lastDownlink: '2025-10-01T09:58:12Z',
    nextDownlink: '2025-10-01T10:30:00Z',
    lastDownlinkSummary: 'Telemetry packet 0xA3: OK'
  },
  sensors: [
    { id: 'temp-1', label: 'Core Temp', value: 22.5, units: '°C', status: 'OK', history: [21.9,22.0,22.2,22.5] },
    { id: 'bat-volt', label: 'Battery Volts', value: 12.1, units: 'V', status: 'WARN', history: [12.6,12.5,12.3,12.1] },
    { id: 'press-1', label: 'Pressure', value: 101.3, units: 'kPa', status: 'OK', history: [101.1,101.2,101.3] },
    { id: 'rad-1', label: 'Radiation', value: 0.12, units: 'mSv', status: 'OK', history: [0.10,0.11,0.12] }
  ],
  location: { lat: 37.7749, lon: -122.4194 }
};

function App() {
  // Apps Script Web App URL (doGet returns JSON stringified 2D array)
  // Replace with your deployed web app URL (ends with /exec)
  const SPREADSHEET_URL = 'https://script.google.com/macros/s/AKfycby4aXux4-5ZGWD4mWiCyYLtZtresjFkibkl4vG_dcgL_yFs7TkBj-8UvO9hQTPMQIgI/exec';

  
  // State for data model
  const [columns, setColumns] = useState([]); // column headers (modules)
  const [selectedCol, setSelectedCol] = useState(1); // default to first data column
  const [colMapsState, setColMapsState] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [lockError, setLockError] = useState('');

  const [mission, setMission] = useState(mock.mission);
  const [status, setStatus] = useState(mock.status);
  const [communications, setCommunications] = useState(mock.communications);
  const [sensors, setSensors] = useState(mock.sensors);
  const [location, setLocation] = useState(mock.location);
  const [lastSync, setLastSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState('consumer'); // 'consumer' or 'company'

  
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

  // Helper to get the latest value from array data or single value
  const getLatestValue = (value) => {
    const parsed = parseArrayData(value);
    if (Array.isArray(parsed)) {
      return parsed[parsed.length - 1]; // Return the last (most recent) value
    }
    return parsed;
  };

  // Helper to get all values from array data or single value as array
  const getAllValues = (value) => {
    const parsed = parseArrayData(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [parsed]; // Return single value as array
  };

  // helper: map sheet rows into a structured object per column
  const parseSheetRows = (rows) => {
    if (!rows || !rows.length) return null;

    // find header row (first row where any cell after col0 is non-empty)
    let headerRow = 0;
    for (let r = 0; r < Math.min(3, rows.length); r++) {
      const row = rows[r] || [];
      if (row.slice(1).some((c) => c !== undefined && c !== null && String(c).trim() !== '')) {
        headerRow = r;
        break;
      }
    }

    const headers = rows[headerRow].map((c) => (c == null ? '' : String(c)));

    // build key->value map per column index
    const colMaps = {};
    for (let j = 1; j < headers.length; j++) colMaps[j] = {};

    for (let r = headerRow + 1; r < rows.length; r++) {
      const row = rows[r] || [];
      const keyRaw = row[0];
      if (!keyRaw) continue;
      const key = String(keyRaw).trim().toUpperCase();
      for (let j = 1; j < headers.length; j++) {
        colMaps[j][key] = row[j] !== undefined ? row[j] : '';
      }
    }

    return { headers, colMaps };
  };

  // transform a single column map into our dashboard model
  const colMapToModel = (colMap) => {
    const get = (k) => (colMap[k] !== undefined && colMap[k] !== '' ? String(colMap[k]) : null);

    const missionObj = { id: get('KEY') || 'MV-1', name: get('MISSION') || mock.mission.name, startTime: get('MISSION_START') || mock.mission.startTime, endTime: get('MISSION_END') || mock.mission.endTime };

    const statusObj = {
      overall: 'OK',
      uptimePct: parseFloat(get('UPTIME')) || mock.status.uptimePct,
      lastUp: get('LAST_UP') || mock.status.lastUp,
      lastDown: get('LAST_DOWN') || mock.communications.lastDownlink,
    };

    const comms = {
      lastUplink: get('LAST_UP') || mock.communications.lastUplink,
      lastDownlink: get('LAST_DOWN') || mock.communications.lastDownlink,
      nextDownlink: get('NEXT_DOWN') || mock.communications.nextDownlink,
      lastDownlinkSummary: get('DOWN_SUMMARY') || mock.communications.lastDownlinkSummary,
    };

    // sensor mapping - use dedicated data rows for latest values
    const sensorDefs = [
      { key: 'CORE_TEMP_DATA', id: 'temp-1', label: 'Core Temp', units: '°C' },
      { key: 'BATTERY_VOLTS_DATA', id: 'bat-volt', label: 'Battery Volts', units: 'V' },
      { key: 'PRESSURE_DATA', id: 'press-1', label: 'Pressure', units: 'kPa' },
      { key: 'RADIATION_DATA', id: 'rad-1', label: 'Radiation', units: 'mSv' },
    ];

    const sensorsArr = sensorDefs.map((def) => {
      const rawValue = get(def.key);
      const latestValue = getLatestValue(rawValue);
      const allValues = getAllValues(rawValue);
      
      // Parse the latest value as a number if possible
      const val = parseFloat(latestValue);
      const isNumeric = !isNaN(val);
      
      // Use all values as history if it's an array, otherwise use single value
      const history = isNumeric ? allValues.filter(v => !isNaN(parseFloat(v))) : [];
      
      return { 
        id: def.id, 
        label: def.label, 
        value: isNumeric ? val : latestValue, 
        units: def.units, 
        status: 'OK', 
        history: history.length > 0 ? history : (isNumeric ? [val] : [])
      };
    });

    const loc = { lat: parseFloat(get('LAT')) || mock.location.lat, lon: parseFloat(get('LONG')) || mock.location.lon };

    return { mission: missionObj, status: statusObj, communications: comms, sensors: sensorsArr, location: loc };
  };

  const fetchData = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch(SPREADSHEET_URL, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      // Handle either JSON object/array or a JSON string payload
      let payload = null;
      try {
        payload = await res.json();
      } catch (_) {
        const text = await res.text();
        try { payload = JSON.parse(text); } catch (__) { payload = text; }
      }
      const rows = (payload && payload.data) ? payload.data : payload || [];
      const parsed = parseSheetRows(rows);
      if (!parsed) return;
      const { headers, colMaps } = parsed;
      // trim headers and normalize module names
      const trimmed = headers.slice(1).map((h) => (h == null ? '' : String(h).trim()));
      setColumns(trimmed);
      // store colMaps so we can validate keys before showing data
      setColMapsState(colMaps);
      // default to second column (index 1)
      const defaultCol = trimmed.length > 0 ? 1 : null;
      if (defaultCol) setSelectedCol(defaultCol);
      // do not load the model until user unlocks with the key
    } catch (err) {
      console.error('Sheet fetch failed, using mock', err);
      // fallback stays as mock
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when user selects a different module column, reset unlocked state
  useEffect(() => {
    setUnlocked(false);
    setInputKey('');
    setLockError('');
    // do not auto-load data until user unlocks
  }, [selectedCol]);

  const handleUnlock = () => {
    setLockError('');
    if (!colMapsState) {
      setLockError('Sheet not loaded');
      return;
    }
    const colMap = colMapsState[selectedCol];
    if (!colMap) {
      setLockError('Invalid module selected');
      return;
    }
    const expected = colMap['KEY'] !== undefined ? String(colMap['KEY']).trim() : '';
    // compare case-insensitive
    if (expected !== '' && String(inputKey).trim().toUpperCase() === expected.toUpperCase()) {
      const model = colMapToModel(colMap);
      setMission(model.mission);
      setStatus(model.status);
      setCommunications(model.communications);
      setSensors(model.sensors);
      setLocation(model.location);
      setLastSync(new Date().toISOString());
      setUnlocked(true);
    } else {
      setLockError('Invalid key');
      setUnlocked(false);
    }
  };

  const autofillKey = () => {
    if (!colMapsState) return;
    const colMap = colMapsState[selectedCol];
    if (!colMap) return;
    const expected = colMap['KEY'] !== undefined ? String(colMap['KEY']).trim() : '';
    setInputKey(expected);
  };

  const handleViewToggle = () => {
    setViewMode(viewMode === 'consumer' ? 'company' : 'consumer');
  };

  return (
    <div className="App dashboard-root">
      <div className="header-card">
        <Header 
          mission={mission} 
          overallStatus={status.overall} 
        />
      </div>

      <div className="top-controls">
        <div className="left-controls">
          <LastSyncCard 
            lastSync={lastSync} 
            isSyncing={isSyncing} 
            onSync={() => {
              setLastSync(new Date().toISOString());
              fetchData();
            }} 
          />
          
          <div className="module-selector">
            <label>Module:</label>
            <select 
              value={selectedCol != null ? String(selectedCol) : ''} 
              onChange={(e) => setSelectedCol(parseInt(e.target.value, 10))}
            >
              {columns.length === 0 && <option value="">(no modules)</option>}
              {columns.map((c, i) => (
                <option key={i} value={String(i + 1)}>{c || `Module ${i + 1}`}</option>
              ))}
            </select>
          </div>
          
          <div className="unlock-controls">
            <input 
              placeholder="Enter key" 
              value={inputKey} 
              onChange={(e) => setInputKey(e.target.value)} 
            />
            <button className="search-btn" onClick={handleUnlock}>Unlock</button>
            <button className="edit-btn" onClick={autofillKey}>Autofill</button>
            {lockError && <div className="lock-error">{lockError}</div>}
          </div>
        </div>
        
        <div className="right-controls">
          <ViewToggleCard viewMode={viewMode} onToggle={handleViewToggle} />
        </div>
      </div>
      {viewMode === 'consumer' ? (
        unlocked ? (
          <>
            <div className="dashboard-grid">
              <aside className="left-column">
                <div className="sensors-card">
                  <div className="sensors-grid">
                    {sensors.map((s) => (
                      <SensorCard key={s.id} sensor={s} />
                    ))}
                  </div>
                </div>
              </aside>

              <main className="main-column">
                <div className="main-row">
                  <div className="right-widgets">
                    <MapWidget location={location} />
                    <CommunicationsPanel comms={communications} />
                    <UptimeWidget status={status} />
                    <MissionTimer mission={mission} />
                  </div>
                </div>
              </main>
            </div>
            
            {/* Sensor Data Table for Consumer View */}
            {colMapsState && colMapsState[selectedCol] && (
              <SensorDataTable 
                moduleData={colMapsState[selectedCol]} 
                moduleName={columns[selectedCol - 1] || `Module ${selectedCol}`}
              />
            )}
          </>
        ) : (
          <div className="locked-message">
            Data locked — enter the correct key for the selected module to view data.
          </div>
        )
      ) : (
        <div className="company-dashboard">
          <div className="company-left-column">
            <div className="modules-section">
              <h3>Module Status</h3>
              <div className="modules-grid">
                {columns.map((moduleName, index) => {
                  const moduleData = colMapsState && colMapsState[index + 1];
                  return (
                    <ModuleCard 
                      key={moduleName} 
                      moduleName={moduleName} 
                      moduleData={moduleData} 
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="company-right-column">
            <div className="right-widgets">
              <MapWidget location={location} />
              {colMapsState && colMapsState[selectedCol] ? (() => {
                const model = colMapToModel(colMapsState[selectedCol]);
                return (
                  <>
                    <CommunicationsPanel comms={model.communications} />
                    <UptimeWidget status={model.status} />
                  </>
                );
              })() : (
                <>
                  <CommunicationsPanel comms={communications} />
                  <UptimeWidget status={status} />
                </>
              )}
              <ObstacleAvoidanceCard 
                modulesData={colMapsState} 
                moduleNames={columns} 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
