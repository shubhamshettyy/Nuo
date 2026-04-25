import React from 'react';
import { useAlerts } from '../hooks/useAlerts';
import './AlertBanner.css';

export default function AlertBanner() {
  const { alerts, loading, error } = useAlerts();

  if (loading || error || alerts.length === 0) {
    return null;
  }

  const latestAlert = alerts[0];

  return (
    <div className="alert-banner">
      <div className="alert-icon">⚠️</div>
      <div className="alert-content">
        <span className="alert-label">ALERT:</span>
        <span className="alert-message">{latestAlert.message}</span>
        <span className="alert-country">{latestAlert.country_name}</span>
      </div>
    </div>
  );
}
