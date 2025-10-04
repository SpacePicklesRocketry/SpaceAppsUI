import React from 'react';

export default function LastSyncCard({ lastSync, onSync }) {
  const formatted = lastSync ? new Date(lastSync).toLocaleString() : 'Never';

  return (
    <div className="last-sync-card widget">
      <h4>Last Sync</h4>
      <div className="last-sync-time">{formatted}</div>
      <div style={{ marginTop: 8 }}>
        <button className="search-btn" onClick={onSync}>Sync now</button>
      </div>
    </div>
  );
}
