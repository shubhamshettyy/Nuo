import { scaleLinear } from 'd3-scale';

export const getCountryColor = (val) => {
  if (val == null) return null; // will use CSS var
  const scale = scaleLinear()
    .domain([0, 25, 50, 75, 100])
    .range(['#a8d5a2', '#f9e07a', '#f4a460', '#e07040', '#c0392b']);
  return scale(Math.min(val, 100));
};

export const getIndexLabel = (val) => {
  if (val == null) return 'No data';
  if (val < 20)  return 'Well covered';
  if (val < 40)  return 'Moderate gap';
  if (val < 60)  return 'Significant gap';
  if (val < 80)  return 'Severe gap';
  return 'Critical gap';
};

export const getIndexColor = (val) => {
  if (val == null) return '#999';
  if (val < 20)  return '#27ae60';
  if (val < 40)  return '#f39c12';
  if (val < 60)  return '#e67e22';
  if (val < 80)  return '#e74c3c';
  return '#c0392b';
};

export const formatIndex = (val) => {
  if (val == null || Number.isNaN(Number(val))) return '--';
  const n = Number(val);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

export const getSeverityLabel = (val) => {
  if (val == null) return 'No data';
  const n = Number(val);
  if (n < 25) return 'Low';
  if (n < 50) return 'Moderate';
  if (n < 75) return 'Elevated';
  return 'Critical';
};

export const getIndexTextColor = (val) => {
  if (val == null) return '#9ca3af';
  const n = Number(val);
  if (n < 25) return '#10b981';
  if (n < 50) return '#84cc16';
  if (n < 75) return '#fbbf24';
  return '#ef4444';
};
