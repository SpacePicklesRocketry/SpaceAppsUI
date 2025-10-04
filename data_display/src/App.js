import React from 'react';
import './App.css';
import Header from './components/Header';
import UptimeWidget from './components/UptimeWidget';
import MissionTimer from './components/MissionTimer';
import SensorCard from './components/SensorCard';
import MapWidget from './components/MapWidget';
import DownlinkPanel from './components/DownlinkPanel';
import LastSyncCard from './components/LastSyncCard';
import { useState } from 'react';

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
  // For now we use mock data for the dashboard. You can wire fetch logic later.
  const data = mock;
  const [lastSync, setLastSync] = useState(null);

  return (
    <div className="App dashboard-root">
      {/* <Header mission={data.mission} overallStatus={data.status.overall} /> */}

      <div className="header-card">
        <Header mission={data.mission} overallStatus={data.status.overall} />
      </div>

      <div className="last-sync-wrapper">
        <LastSyncCard lastSync={lastSync} onSync={() => setLastSync(new Date().toISOString())} />
      </div>

      <div className="dashboard-grid">
        <aside className="left-column">
          <div className="sensors-card">
            <div className="sensors-grid">
              {data.sensors.map((s) => (
                <SensorCard key={s.id} sensor={s} />
              ))}
            </div>
          </div>
        </aside>

        <main className="main-column">
          <div className="main-row">
            
            <div className="right-widgets">
              <MapWidget location={data.location} />
              <DownlinkPanel comms={data.communications} />
              <UptimeWidget status={data.status} />
              <MissionTimer mission={data.mission} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
