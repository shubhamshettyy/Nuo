import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import './AlertBanner.css';

export default function AlertBanner() {
  const { alerts, loading } = useAlerts();
  const [gone, setGone]     = useState(false);
  if (loading || !alerts.length || gone) return null;
  const ticker = alerts.map(a => a.message).join('   ·   ');
  return (
    <div className="alert-bar">
      <span className="alert-tag">Alert</span>
      <div className="alert-sep" />
      <div className="alert-ticker-wrap">
        <div className="alert-ticker">
          <span>{ticker}</span>
          <span>{ticker}</span>
        </div>
      </div>
      <button className="alert-close" onClick={() => setGone(true)}>×</button>
    </div>
  );
}
