import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import './AlertBanner.css';

export default function AlertBanner() {
  const { alerts, loading } = useAlerts();
  const [gone, setGone] = useState(false);
  if (loading || !alerts.length || gone) return null;
  const ticker = alerts.map(a => a.message).join('   /   ');
  return (
    <div className="alert-bar">
      <span className="alert-label">ALERT</span>
      <div className="alert-divider" />
      <div className="alert-ticker">
        <div className="alert-scroll">
          <span>{ticker}</span>
          <span>{ticker}</span>
        </div>
      </div>
      <span className="alert-country">{alerts[0].country_name}</span>
      <button className="alert-close" onClick={() => setGone(true)}>×</button>
    </div>
  );
}
