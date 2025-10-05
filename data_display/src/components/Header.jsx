import React from 'react';

export default function Header({ mission, overallStatus }) {
  return (
    <div className="header">
      <div className="header-left">
        <h1>{mission?.name || 'Mock Space Module'}</h1>
        <div className={`status-badge ${overallStatus?.toLowerCase() || 'unknown'}`}>{overallStatus || 'UNKNOWN'}</div>
      </div>
      <div className="header-right">
      </div>
    </div>
  );
}
