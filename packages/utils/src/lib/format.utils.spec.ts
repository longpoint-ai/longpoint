import { formatBytes, parseBytes } from './format.utils';

describe('formatBytes', () => {
  describe('zero bytes', () => {
    it('should return "0 B" for zero bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });
  });

  describe('bytes (B)', () => {
    it('should format single digit bytes', () => {
      expect(formatBytes(1)).toBe('1 B');
      expect(formatBytes(5)).toBe('5 B');
      expect(formatBytes(9)).toBe('9 B');
    });

    it('should format double digit bytes', () => {
      expect(formatBytes(10)).toBe('10 B');
      expect(formatBytes(50)).toBe('50 B');
      expect(formatBytes(99)).toBe('99 B');
    });

    it('should format triple digit bytes', () => {
      expect(formatBytes(100)).toBe('100 B');
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(999)).toBe('999 B');
    });
  });

  describe('kilobytes (KB)', () => {
    it('should format exactly 1 KB', () => {
      expect(formatBytes(1000)).toBe('1 KB');
    });

    it('should format KB with decimal places', () => {
      expect(formatBytes(1500)).toBe('1.5 KB'); // 1.5 KB
      expect(formatBytes(2500)).toBe('2.5 KB'); // 2.5 KB
      expect(formatBytes(5000)).toBe('5 KB'); // 5 KB (no trailing .0)
    });

    it('should format larger KB values', () => {
      expect(formatBytes(10000)).toBe('10 KB');
      expect(formatBytes(100000)).toBe('100 KB');
      expect(formatBytes(999999)).toBe('1000 KB'); // Just under 1 MB (rounded up)
    });
  });

  describe('megabytes (MB)', () => {
    it('should format exactly 1 MB', () => {
      expect(formatBytes(1000000)).toBe('1 MB');
    });

    it('should format MB with decimal places', () => {
      expect(formatBytes(1500000)).toBe('1.5 MB'); // 1.5 MB
      expect(formatBytes(2500000)).toBe('2.5 MB'); // 2.5 MB
      expect(formatBytes(5000000)).toBe('5 MB'); // 5 MB (no trailing .0)
    });

    it('should format larger MB values', () => {
      expect(formatBytes(10000000)).toBe('10 MB');
      expect(formatBytes(100000000)).toBe('100 MB');
      expect(formatBytes(999999999)).toBe('1000 MB'); // Just under 1 GB (rounded up)
    });
  });

  describe('gigabytes (GB)', () => {
    it('should format exactly 1 GB', () => {
      expect(formatBytes(1000000000)).toBe('1 GB');
    });

    it('should format GB with decimal places', () => {
      expect(formatBytes(1500000000)).toBe('1.5 GB'); // 1.5 GB
      expect(formatBytes(2500000000)).toBe('2.5 GB'); // 2.5 GB
      expect(formatBytes(5000000000)).toBe('5 GB'); // 5 GB (no trailing .0)
    });

    it('should format larger GB values', () => {
      expect(formatBytes(10000000000)).toBe('10 GB');
      expect(formatBytes(100000000000)).toBe('100 GB');
      expect(formatBytes(999999999999)).toBe('1000 GB'); // Just under 1 TB (rounded up)
    });
  });

  describe('terabytes (TB)', () => {
    it('should format exactly 1 TB', () => {
      expect(formatBytes(1000000000000)).toBe('1 TB');
    });

    it('should format TB with decimal places', () => {
      expect(formatBytes(1500000000000)).toBe('1.5 TB'); // 1.5 TB
      expect(formatBytes(2500000000000)).toBe('2.5 TB'); // 2.5 TB
      expect(formatBytes(5000000000000)).toBe('5 TB'); // 5 TB (no trailing .0)
    });

    it('should format larger TB values', () => {
      expect(formatBytes(10000000000000)).toBe('10 TB');
      expect(formatBytes(100000000000000)).toBe('100 TB');
    });

    it('should handle very large TB values', () => {
      // Test that values larger than TB still get formatted as TB
      expect(formatBytes(1000000000000000)).toBe('1000 TB');
    });
  });

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      expect(formatBytes(-1000)).toBe('-1 KB');
      expect(formatBytes(-1000000)).toBe('-1 MB');
    });

    it('should handle very small decimal values', () => {
      expect(formatBytes(0.5)).toBe('0.5 B');
      expect(formatBytes(0.1)).toBe('0.1 B');
    });

    it('should remove trailing zeros from decimal places', () => {
      expect(formatBytes(1000)).toBe('1 KB'); // 1.0 -> 1
      expect(formatBytes(2000)).toBe('2 KB'); // 2.0 -> 2
      expect(formatBytes(5000)).toBe('5 KB'); // 5.0 -> 5
      expect(formatBytes(1000000)).toBe('1 MB'); // 1.0 -> 1
      expect(formatBytes(2000000)).toBe('2 MB'); // 2.0 -> 2
    });

    it('should preserve non-zero decimal places', () => {
      expect(formatBytes(1500)).toBe('1.5 KB'); // 1.5 KB
      expect(formatBytes(1800)).toBe('1.8 KB'); // 1.8 KB (actual behavior)
      expect(formatBytes(1500000)).toBe('1.5 MB'); // 1.5 MB
    });
  });

  describe('boundary values', () => {
    it('should handle values just below unit thresholds', () => {
      expect(formatBytes(999)).toBe('999 B'); // Just below 1 KB
      expect(formatBytes(999999)).toBe('1000 KB'); // Just below 1 MB (rounded up)
      expect(formatBytes(999999999)).toBe('1000 MB'); // Just below 1 GB (rounded up)
      expect(formatBytes(999999999999)).toBe('1000 GB'); // Just below 1 TB (rounded up)
    });

    it('should handle values just above unit thresholds', () => {
      expect(formatBytes(1000)).toBe('1 KB'); // Exactly 1 KB
      expect(formatBytes(1000000)).toBe('1 MB'); // Exactly 1 MB
      expect(formatBytes(1000000000)).toBe('1 GB'); // Exactly 1 GB
      expect(formatBytes(1000000000000)).toBe('1 TB'); // Exactly 1 TB
    });
  });
});

describe('parseBytes', () => {
  describe('zero and empty', () => {
    it('should return 0 for "0"', () => {
      expect(parseBytes('0')).toBe(0);
    });

    it('should return 0 for "0B"', () => {
      expect(parseBytes('0B')).toBe(0);
    });

    it('should return 0 for empty string', () => {
      expect(parseBytes('')).toBe(0);
      expect(parseBytes('  ')).toBe(0);
    });
  });

  describe('bytes (B)', () => {
    it('should parse numbers without units as bytes', () => {
      expect(parseBytes('1000')).toBe(1000);
      expect(parseBytes('500')).toBe(500);
      expect(parseBytes('1')).toBe(1);
    });

    it('should parse explicit byte units', () => {
      expect(parseBytes('1B')).toBe(1);
      expect(parseBytes('100 B')).toBe(100);
      expect(parseBytes('500 b')).toBe(500);
    });
  });

  describe('kilobytes (KB)', () => {
    it('should parse kilobytes', () => {
      expect(parseBytes('1KB')).toBe(1000);
      expect(parseBytes('1 KB')).toBe(1000);
      expect(parseBytes('1kb')).toBe(1000);
    });

    it('should parse decimal kilobytes', () => {
      expect(parseBytes('1.5KB')).toBe(1500);
      expect(parseBytes('2.5 KB')).toBe(2500);
      expect(parseBytes('10.5kb')).toBe(10500);
    });
  });

  describe('megabytes (MB)', () => {
    it('should parse megabytes', () => {
      expect(parseBytes('1MB')).toBe(1000000);
      expect(parseBytes('1 MB')).toBe(1000000);
      expect(parseBytes('1mb')).toBe(1000000);
      expect(parseBytes('5MB')).toBe(5000000);
    });

    it('should parse decimal megabytes', () => {
      expect(parseBytes('1.5MB')).toBe(1500000);
      expect(parseBytes('2.5 MB')).toBe(2500000);
      expect(parseBytes('10.5mb')).toBe(10500000);
    });
  });

  describe('gigabytes (GB)', () => {
    it('should parse gigabytes', () => {
      expect(parseBytes('1GB')).toBe(1000000000);
      expect(parseBytes('1 GB')).toBe(1000000000);
      expect(parseBytes('1gb')).toBe(1000000000);
      expect(parseBytes('5GB')).toBe(5000000000);
    });

    it('should parse decimal gigabytes', () => {
      expect(parseBytes('1.5GB')).toBe(1500000000);
      expect(parseBytes('2.5 GB')).toBe(2500000000);
    });
  });

  describe('terabytes (TB)', () => {
    it('should parse terabytes', () => {
      expect(parseBytes('1TB')).toBe(1000000000000);
      expect(parseBytes('1 TB')).toBe(1000000000000);
      expect(parseBytes('1tb')).toBe(1000000000000);
      expect(parseBytes('5TB')).toBe(5000000000000);
    });

    it('should parse decimal terabytes', () => {
      expect(parseBytes('1.5TB')).toBe(1500000000000);
      expect(parseBytes('2.5 TB')).toBe(2500000000000);
    });
  });

  describe('case insensitivity', () => {
    it('should handle mixed case units', () => {
      expect(parseBytes('1Kb')).toBe(1000);
      expect(parseBytes('1MB')).toBe(1000000);
      expect(parseBytes('1Gb')).toBe(1000000000);
      expect(parseBytes('1Tb')).toBe(1000000000000);
    });
  });

  describe('whitespace handling', () => {
    it('should handle spaces in input', () => {
      expect(parseBytes(' 5 MB ')).toBe(5000000);
      expect(parseBytes('1.5   GB')).toBe(1500000000);
      expect(parseBytes('\t10\t\t KB ')).toBe(10000);
    });
  });

  describe('negatives', () => {
    it('should parse negative numbers', () => {
      expect(parseBytes('-1000')).toBe(-1000);
      expect(parseBytes('-5MB')).toBe(-5000000);
      expect(parseBytes('-1.5 GB')).toBe(-1500000000);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid strings', () => {
      expect(() => parseBytes('invalid')).toThrow('Cannot parse size string');
      expect(() => parseBytes('ABC')).toThrow('Cannot parse size string');
      expect(() => parseBytes('MB')).toThrow('Cannot parse size string');
    });

    it('should throw error for unknown units', () => {
      expect(() => parseBytes('5PB')).toThrow('Unknown unit: "PB"');
      expect(() => parseBytes('10NYSE')).toThrow('Unknown unit: "NYSE"');
    });

    it('should throw error for malformed input', () => {
      expect(() => parseBytes('..')).toThrow('Cannot parse size string');
      expect(() => parseBytes('abc123')).toThrow('Cannot parse size string');
    });
  });

  describe('round-trip compatibility', () => {
    it('should round-trip with formatBytes for whole units', () => {
      expect(parseBytes(formatBytes(1000))).toBe(1000);
      expect(parseBytes(formatBytes(1000000))).toBe(1000000);
      expect(parseBytes(formatBytes(1000000000))).toBe(1000000000);
      expect(parseBytes(formatBytes(1000000000000))).toBe(1000000000000);
    });

    it('should round-trip with formatBytes for values with decimals', () => {
      expect(parseBytes(formatBytes(1500))).toBe(1500);
      expect(parseBytes(formatBytes(1500000))).toBe(1500000);
      expect(parseBytes(formatBytes(1500000000))).toBe(1500000000);
    });

    it('should handle round-trip for negative values', () => {
      expect(parseBytes(formatBytes(-1000))).toBe(-1000);
      expect(parseBytes(formatBytes(-1000000))).toBe(-1000000);
    });
  });
});
