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

  const isNegative = bytes < 0;
  const absBytes = Math.abs(bytes);
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const divisor = 1000;

  const unitIndex = Math.floor(Math.log(absBytes) / Math.log(divisor));
  const clampedIndex = Math.max(0, Math.min(unitIndex, units.length - 1));
  const value = absBytes / Math.pow(divisor, clampedIndex);
  const formattedValue = value.toFixed(1).replace(/\.0$/, '');
  const sign = isNegative ? '-' : '';

  return `${sign}${formattedValue} ${units[clampedIndex]}`;
}

/**
 * Parses a human-readable byte string into a number of bytes
 * Uses decimal (1000-based) units to match formatBytes behavior
 * @param sizeString - The size string to parse (e.g., "5MB", "1.5 GB", "1000 KB")
 * @returns The number of bytes
 * @throws Error if the string cannot be parsed
 *
 * @example
 * parseBytes("5MB") // 5000000 (5 * 1000 * 1000)
 * parseBytes("1.5GB") // 1500000000 (1.5 * 1000 * 1000 * 1000)
 * parseBytes("0B") // 0
 * parseBytes("1000") // 1000
 */
export function parseBytes(sizeString: string): number {
  const trimmed = sizeString.trim();
  if (trimmed === '' || trimmed === '0') return 0;

  const match = trimmed.match(/^(-?\d+\.?\d*)\s*([a-zA-Z]+)?$/);
  if (!match) {
    throw new Error(`Cannot parse size string: "${sizeString}"`);
  }

  const value = parseFloat(match[1]);
  const rawUnit = match[2] || 'B';
  const unit = rawUnit.toUpperCase();

  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1000,
    MB: 1000 ** 2,
    GB: 1000 ** 3,
    TB: 1000 ** 4,
  };

  const multiplier = multipliers[unit];
  if (!multiplier) {
    throw new Error(`Unknown unit: "${unit}"`);
  }

  return Math.round(value * multiplier);
}
