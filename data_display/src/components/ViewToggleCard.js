import React from 'react';

export default function ViewToggleCard({ viewMode, onToggle }) {
  const getModeColor = (mode) => {
    return mode === 'company' ? '#4CAF50' : '#2196F3';
  };

  return (
    <div className="view-toggle-card widget">
      <div className="view-toggle-header">
        <h4>View Mode</h4>
        <div 
          className="view-indicator"
          style={{
            backgroundColor: getModeColor(viewMode),
            width: '12px',
            height: '12px',
            borderRadius: '50%',
          }}
        ></div>
      </div>
      <div className="view-toggle-content">
        <div className="current-view">
          <span className="view-label">Current:</span>
          <span className="view-name">{viewMode === 'company' ? 'Company' : 'Consumer'}</span>
        </div>
        <button 
          className="view-toggle-btn search-btn" 
          onClick={onToggle}
          style={{
            backgroundColor: getModeColor(viewMode === 'company' ? 'consumer' : 'company'),
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            padding: '10px 15px',
            marginTop: '10px'
          }}
        >
          {viewMode === 'company' ? 'Switch to Consumer' : 'Switch to Company'}
        </button>
      </div>
    </div>
  );
}
