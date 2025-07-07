/**
 * Format a date string into a human-readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Truncate a string to a specified length and add ellipsis
 * @param {string} str - The string to truncate
 * @param {number} length - The maximum length
 * @returns {string} - The truncated string
 */
export function truncate(str, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  
  return str.slice(0, length) + '...';
}

/**
 * Convert a string to title case
 * @param {string} str - The string to convert
 * @returns {string} - The title-cased string
 */
export function toTitleCase(str) {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
