import React, { useEffect, useState } from 'react';

function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${days}d ${hours}h ${mins}m ${secs}s`;
}

export default function MissionTimer({ mission }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mission) return null;

  const start = new Date(mission.startTime).getTime();
  const end = new Date(mission.endTime).getTime();
  const elapsed = now - start;
  const remaining = end - now;

  return (
    <div className="widget mission-timer">
      <h3>Mission Timer</h3>
      <div>Elapsed: {start ? formatDuration(elapsed) : 'N/A'}</div>
      <div>Remaining: {end ? formatDuration(remaining) : 'N/A'}</div>
    </div>
  );
}
