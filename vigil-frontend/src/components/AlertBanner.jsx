import React from 'react';
import { useAlerts } from '../hooks/useAlerts';
import './AlertBanner.css';

export default function AlertBanner() {
  const { alerts, loading, error } = useAlerts();

  if (loading || error || alerts.length === 0) {
    return null;
  }

  const latestAlert = alerts[0];
  const tickerText = alerts.map((alert) => alert.message).join('   //   ');

  return (
    <div className="alert-banner">
      <div className="alert-label">⬡ INTEGRITY BREACH</div>
      <div className="alert-content">
        <div className="alert-scroll">
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </div>
      </div>
      <div className="alert-country">{latestAlert.country_name}</div>
    </div>
  );
}
