import React from 'react';

export default function UptimeWidget({ status }) {
  const { uptimePct, lastUp, lastDown } = status || {};

  return (
    <div className="widget uptime-widget">
      <h3>Uptime</h3>
      <div className="uptime-value">{uptimePct != null ? `${uptimePct}%` : 'N/A'}</div>
      <div className="uptime-times">
        <div>Last Up: {lastUp ? new Date(lastUp).toLocaleString() : '—'}</div>
        <div>Last Down: {lastDown ? new Date(lastDown).toLocaleString() : 'N/A'}</div>
      </div>
    </div>
  );
}
