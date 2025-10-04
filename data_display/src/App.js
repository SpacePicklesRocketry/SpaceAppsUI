import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import UptimeWidget from './components/UptimeWidget';
import MissionTimer from './components/MissionTimer';
import SensorCard from './components/SensorCard';
import MapWidget from './components/MapWidget';
import DownlinkPanel from './components/DownlinkPanel';
import LastSyncCard from './components/LastSyncCard';

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
    lastDown: '2025-09-30T22:44:00Z'
  },
  communications: {
    lastDownlink: '2025-10-01T09:58:12Z',
    nextTransmission: '2025-10-01T10:30:00Z',
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
  // If you prefer, put your sheet URL here so the frontend asks the backend directly
  const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1pHq-AqK4n5VYqx6j8R_CraASY0tCVzcan1GwJoXNebE/';

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
      lastDown: get('LAST_DOWN') || mock.status.lastDown,
    };

    const comms = {
      lastDownlink: get('LAST_DOWN') || get('LAST_DOWNLINK') || mock.communications.lastDownlink,
      nextTransmission: get('NEXT_DOWN') || get('NEXT_TRANSMISSION') || mock.communications.nextTransmission,
      lastDownlinkSummary: get('DOWN_SUMMARY') || get('DOWN_SUMMARY') || mock.communications.lastDownlinkSummary,
    };

    // sensor mapping - try to detect commonly named keys
    const sensorDefs = [
      { key: 'CORE_TEMP', id: 'temp-1', label: 'Core Temp', units: '°C' },
      { key: 'BATTERY_VOLTS', id: 'bat-volt', label: 'Battery Volts', units: 'V' },
      { key: 'PRESSURE', id: 'press-1', label: 'Pressure', units: 'kPa' },
      { key: 'RADIATION', id: 'rad-1', label: 'Radiation', units: 'mSv' },
    ];

    const sensorsArr = sensorDefs.map((def) => {
      const val = parseFloat(get(def.key));
      const history = []; // sheet doesn't provide history; keep single value history
      if (!isNaN(val)) history.push(val);
      return { id: def.id, label: def.label, value: isNaN(val) ? get(def.key) : val, units: def.units, status: 'OK', history };
    });

    const loc = { lat: parseFloat(get('LAT')) || mock.location.lat, lon: parseFloat(get('LONG')) || mock.location.lon };

    return { mission: missionObj, status: statusObj, communications: comms, sensors: sensorsArr, location: loc };
  };

  const fetchAndLoad = async () => {
    try {
  const res = await fetch('/api/sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spreadsheetUrl: SPREADSHEET_URL }) });
      const json = await res.json();
      const rows = json.data || json || [];
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
    }
  };

  useEffect(() => {
    fetchAndLoad();
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

  return (
    <div className="App dashboard-root">
      <div className="header-card">
        <Header mission={mission} overallStatus={status.overall} />
      </div>

      <div className="last-sync-wrapper">
        <LastSyncCard lastSync={lastSync} onSync={() => setLastSync(new Date().toISOString())} />
        {/* column selector */}
        <div style={{ marginLeft: 16 }}>
          <label style={{ marginRight: 8, color: '#cfe9ff' }}>Module:</label>
          <select value={selectedCol || ''} onChange={(e) => setSelectedCol(parseInt(e.target.value, 10))}>
            {columns.length === 0 && <option value="">(no modules)</option>}
            {columns.map((c, i) => (
              <option key={i} value={i + 1}>{c || `Module ${i + 1}`}</option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input placeholder="Enter key" value={inputKey} onChange={(e) => setInputKey(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }} />
          <button className="search-btn" onClick={handleUnlock}>Unlock</button>
          <button className="edit-btn" onClick={autofillKey}>Autofill</button>
          {lockError && <div style={{ color: '#ffccd5', marginLeft: 8 }}>{lockError}</div>}
        </div>
      </div>

      {/* Debug: show detected modules and sheet load status */}
      <div style={{ marginTop: 10, color: '#cfe9ff' }}>
        <strong>Detected modules:</strong> {columns.length ? columns.join(', ') : '(none)'}
      </div>
      {unlocked ? (
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
              <DownlinkPanel comms={communications} />
              <UptimeWidget status={status} />
              <MissionTimer mission={mission} />
            </div>
          </div>
        </main>
        </div>
      ) : (
        <div style={{ marginTop: 20, color: '#cfe9ff' }}>Data locked — enter the correct key for the selected module to view data.</div>
      )}
    </div>
  );
}

export default App;
