/**
 * Formats a number of bytes into a human-readable string
 * @param bytes - The number of bytes to format
 * @returns A formatted string with appropriate unit (B, KB, MB, GB, TB)
 *
 * @example
 * formatBytes(1024) // "1.0 KB"
 * formatBytes(2560) // "2.5 KB"
 * formatBytes(1342984) // "1.3 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  // Handle negative numbers by taking absolute value and adding minus sign
  const isNegative = bytes < 0;
  const absBytes = Math.abs(bytes);

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const divisor = 1024;

  // Calculate the appropriate unit index
  const unitIndex = Math.floor(Math.log(absBytes) / Math.log(divisor));

  // Ensure we don't exceed our available units and handle negative indices
  const clampedIndex = Math.max(0, Math.min(unitIndex, units.length - 1));

  // Calculate the value in the appropriate unit
  const value = absBytes / Math.pow(divisor, clampedIndex);

  // Format to 1 decimal place, but remove trailing zeros
  const formattedValue = value.toFixed(1).replace(/\.0$/, '');

  // Add minus sign for negative numbers
  const sign = isNegative ? '-' : '';
  return `${sign}${formattedValue} ${units[clampedIndex]}`;
}
