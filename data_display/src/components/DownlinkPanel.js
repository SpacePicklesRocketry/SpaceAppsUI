import React from 'react';

export default function DownlinkPanel({ comms }) {
  return (
    <div className="widget downlink-panel">
      <h3>Communications</h3>
      <div>Last Downlink: {comms?.lastDownlink ? new Date(comms.lastDownlink).toLocaleString() : 'N/A'}</div>
      <div>Next Transmission: {comms?.nextTransmission ? new Date(comms.nextTransmission).toLocaleString() : 'N/A'}</div>
      <div className="downlink-summary">{comms?.lastDownlinkSummary || '—'}</div>
    </div>
  );
}
