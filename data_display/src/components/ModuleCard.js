import React, { useState, useEffect } from 'react';

export default function ModuleCard({ moduleName, moduleData }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


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


  const getObstacleStatus = (status) => {
    if (typeof status === 'string') {
      const upperStatus = status.toUpperCase();
      switch (upperStatus) {
        case 'CLEAR':
          return { status: 'CLEAR', color: '#2ECC71' };
        case 'WARN':
        case 'WARNING':
          return { status: 'WARN', color: '#FF9800' };
        case 'HIGH RISK':
        case 'HIGH':
          return { status: 'HIGH RISK', color: '#F44336' };
        case 'MEDIUM RISK':
        case 'MEDIUM':
          return { status: 'MEDIUM RISK', color: '#FF9800' };
        default:
          return { status: 'UNKNOWN', color: '#9E9E9E' };
      }
    }
    
    // Handle numeric values (fallback)
    const numValue = parseFloat(status);
    if (isNaN(numValue)) return { status: 'UNKNOWN', color: '#9E9E9E' };

    if (numValue > 0.8) return { status: 'HIGH RISK', color: '#F44336' };
    if (numValue > 0.5) return { status: 'MEDIUM RISK', color: '#FF9800' };
    if (numValue > 0.2) return { status: 'WARN', color: '#FF9800' };
    return { status: 'CLEAR', color: '#2ECC71' };
  };

  const formatDuration = (milliseconds) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getMissionTimers = () => {
    const missionStart = moduleData?.MISSION_START ? new Date(moduleData.MISSION_START) : null;
    const missionEnd = moduleData?.MISSION_END ? new Date(moduleData.MISSION_END) : null;

    if (!missionStart) return null;

    const now = currentTime;
    const elapsed = now - missionStart;
    const remaining = missionEnd ? missionEnd - now : null;

    return {
      elapsed: formatDuration(elapsed),
      remaining: remaining ? (remaining > 0 ? formatDuration(remaining) : 'EXPIRED') : null,
      isExpired: remaining ? remaining <= 0 : false
    };
  };

  const obstacleStatus = getObstacleStatus(getLatestValue(moduleData?.OBSTACLE_AVOIDANCE || moduleData?.OBSTACLE));
  const timers = getMissionTimers();

  return (
    <div className="module-card widget">
      <div className="module-header">
        <h3>{moduleName}</h3>
        <div
          className="status-indicator"
          style={{
            backgroundColor: obstacleStatus.color,
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            marginLeft: '8px'
          }}
        ></div>
      </div>

      <div className="module-sensors-compact">
        <div className="sensor-grid">
          <div className="sensor-item">
            <div className="sensor-icon">🌡️</div>
            <div className="sensor-info">
              <div className="sensor-value">{getLatestValue(moduleData?.CORE_TEMP_DATA) || 'N/A'}°C</div>
              <div className="sensor-label">Temperature</div>
            </div>
          </div>

          <div className="sensor-item">
            <div className="sensor-icon">🔋</div>
            <div className="sensor-info">
              <div className="sensor-value">{getLatestValue(moduleData?.BATTERY_VOLTS_DATA) || 'N/A'}V</div>
              <div className="sensor-label">Battery</div>
            </div>
          </div>

          <div className="sensor-item">
            <div className="sensor-icon">🚧</div>
            <div className="sensor-info">
              <div 
                className="sensor-value" 
                style={{ color: obstacleStatus.color }}
              >
                {obstacleStatus.status}
              </div>
              <div className="sensor-label">Obstacle</div>
            </div>
          </div>

          <div className="sensor-item">
            <div className="sensor-icon">⚠️</div>
            <div className="sensor-info">
              <div className="sensor-value">{getLatestValue(moduleData?.RADIATION_DATA) || 'N/A'}</div>
              <div className="sensor-label">Radiation</div>
            </div>
          </div>
        </div>
      </div>

      {timers && (
        <div className="module-timers">
          <div className="timer-item">
            <div className="timer-icon">⏱️</div>
            <div className="timer-info">
              <div className="timer-value">{timers.elapsed}</div>
              <div className="timer-label">Elapsed</div>
            </div>
          </div>
          {timers.remaining && (
            <div className="timer-item">
              <div className="timer-icon">⏰</div>
              <div className="timer-info">
                <div 
                  className="timer-value"
                  style={{ 
                    color: timers.isExpired ? '#F44336' : '#4CAF50' 
                  }}
                >
                  {timers.remaining}
                </div>
                <div className="timer-label">Remaining</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="module-status">
        <span className="status-label">Overall:</span>
        <span
          className="status-value"
          style={{ color: obstacleStatus.color }}
        >
          {obstacleStatus.status}
        </span>
      </div>
    </div>
  );
}
