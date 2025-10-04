import React from 'react';

export default function SensorCard({ sensor }) {
  const statusClass = sensor?.status ? sensor.status.toLowerCase() : 'unknown';
  const history = sensor?.history || [];
  const last = history.length ? history[history.length - 1] : sensor?.value;
  const min = history.length ? Math.min(...history) : sensor?.value;
  const max = history.length ? Math.max(...history) : sensor?.value;

  return (
    <div className={`sensor-card ${statusClass}`}>
      <div className="sensor-card-top">
        <div className="sensor-label">{sensor?.label || sensor?.id}</div>
        <div className={`sensor-status ${statusClass}`}>{sensor?.status || 'N/A'}</div>
      </div>

      <div className="sensor-main">
        <div className="sensor-value">{sensor?.value != null ? `${sensor.value}` : '—'}</div>
        <div className="sensor-units">{sensor?.units || ''}</div>
      </div>

      <div className="sensor-meta">
        <div className="meta-item">Last: {last != null ? last : '—'}</div>
        <div className="meta-item">Min: {min != null ? min : '—'}</div>
        <div className="meta-item">Max: {max != null ? max : '—'}</div>
      </div>

      <div className="sensor-history">
        {history.slice(-10).map((v, i) => (
          <div key={i} className="spark-dot" title={v} />
        ))}
      </div>
    </div>
  );
}

