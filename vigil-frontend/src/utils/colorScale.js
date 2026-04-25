import { scaleLinear } from 'd3-scale';

// Color scale for index values (0-100)
// Low index (good) = green, high index (bad) = red
export const getCountryColor = (indexValue) => {
  if (indexValue === null || indexValue === undefined) {
    return '#2a2f4a'; // Default gray for no data
  }

  const colorScale = scaleLinear()
    .domain([0, 25, 50, 75, 100])
    .range(['#10b981', '#84cc16', '#fbbf24', '#f97316', '#ef4444']);

  return colorScale(indexValue);
};

// Get text color based on index severity
export const getIndexTextColor = (indexValue) => {
  if (indexValue === null || indexValue === undefined) {
    return '#9ca3af';
  }

  if (indexValue < 25) return '#10b981'; // Green
  if (indexValue < 50) return '#84cc16'; // Lime
  if (indexValue < 75) return '#fbbf24'; // Amber
  return '#ef4444'; // Red
};

// Format index value for display
export const formatIndex = (value) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return Math.round(value);
};

// Get severity label
export const getSeverityLabel = (indexValue) => {
  if (indexValue === null || indexValue === undefined) {
    return 'No Data';
  }

  if (indexValue < 25) return 'Low Risk';
  if (indexValue < 50) return 'Moderate';
  if (indexValue < 75) return 'Elevated';
  return 'Critical';
};
