import React from 'react';

export default function ObstacleAvoidanceCard({ modulesData, moduleNames = [] }) {
  const getObstacleStatus = (status) => {
    // Handle both numeric values and text status from Google Sheet
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
          return null; // Filter out unknown statuses
      }
    }
    
    // Handle numeric values (fallback)
    const numValue = parseFloat(status);
    if (isNaN(numValue)) return null;

    if (numValue > 0.8) return { status: 'HIGH RISK', color: '#F44336' };
    if (numValue > 0.5) return { status: 'MEDIUM RISK', color: '#FF9800' };
    if (numValue > 0.2) return { status: 'WARN', color: '#FF9800' };
    return { status: 'CLEAR', color: '#2ECC71' };
  };

  // Map column indices to module names
  const getModuleName = (columnIndex) => {
    return moduleNames[columnIndex - 1] || `Module ${columnIndex}`;
  };

  // Filter out modules with unknown status and create a clean list
  const validModules = Object.entries(modulesData || {}).map(([columnIndex, data]) => {
    const moduleName = getModuleName(parseInt(columnIndex));
    const obstacleStatus = getObstacleStatus(data?.OBSTACLE_AVOIDANCE || data?.OBSTACLE || data?.STATUS);
    
    return {
      columnIndex,
      moduleName,
      data,
      obstacleStatus
    };
  }).filter(module => module.obstacleStatus !== null);

  return (
    <div className="obstacle-avoidance-card widget">
      <h3>Obstacle Avoidance Status</h3>
      <div className="obstacle-modules">
        {validModules.map(({ columnIndex, moduleName, obstacleStatus }) => (
          <div key={columnIndex} className="obstacle-module">
            <div className="module-name">{moduleName}</div>
            <div
              className="obstacle-status"
              style={{ color: obstacleStatus.color }}
            >
              {obstacleStatus.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
