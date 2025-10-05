import React from 'react';

export default function CommunicationsPanel({ comms }) {
  return (
    <div className="widget communications-panel">
      <h3>Communications</h3>
      <div>Last Uplink: {comms?.lastUplink ? new Date(comms.lastUplink).toLocaleString() : 'N/A'}</div>
      <div>Last Downlink: {comms?.lastDownlink ? new Date(comms.lastDownlink).toLocaleString() : 'N/A'}</div>
      <div>Next Downlink: {comms?.nextDownlink ? new Date(comms.nextDownlink).toLocaleString() : 'N/A'}</div>
      <div className="downlink-summary">{comms?.lastDownlinkSummary || '—'}</div>
    </div>
  );
}
