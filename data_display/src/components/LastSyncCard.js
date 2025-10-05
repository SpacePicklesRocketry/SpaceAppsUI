import React from 'react';

export default function LastSyncCard({ lastSync, isSyncing, onSync }) {
  const formatted = lastSync ? new Date(lastSync).toLocaleString() : 'Never';

  return (
    <div className="last-sync-card widget">
      <h4>Last Sync</h4>
      <div className="last-sync-time">{formatted}</div>
      <div style={{ marginTop: 8 }}>
        <button 
          className="search-btn" 
          onClick={onSync}
          disabled={isSyncing}
          style={{ 
            opacity: isSyncing ? 0.7 : 1,
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isSyncing && <span style={{ 
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid #ffffff',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></span>}
          {isSyncing ? 'Syncing...' : 'Sync now'}
        </button>
      </div>
    </div>
  );
}
