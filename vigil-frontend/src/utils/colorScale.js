import { scaleLinear } from 'd3-scale';

export const getCountryColor = (val) => {
  if (val == null) return '#151525';
  const scale = scaleLinear()
    .domain([0, 25, 50, 75, 100])
    .range(['#10b981', '#84cc16', '#fbbf24', '#f97316', '#ef4444']);
  return scale(Math.min(val, 100));
};

export const getIndexTextColor = (val) => {
  if (val == null) return '#44445a';
  if (val < 25) return '#10b981';
  if (val < 50) return '#d4a017';
  if (val < 75) return '#f97316';
  return '#ef4444';
};

export const formatIndex = (val) => {
  if (val == null) return 'N/A';
  return Math.round(val);
};

export const getSeverityLabel = (val) => {
  if (val == null) return 'No Data';
  if (val < 25) return 'Low Risk';
  if (val < 50) return 'Moderate';
  if (val < 75) return 'Elevated';
  return 'Critical';
};
