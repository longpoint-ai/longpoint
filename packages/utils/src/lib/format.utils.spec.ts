import { formatBytes } from './format.utils';

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
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('should format KB with decimal places', () => {
      expect(formatBytes(1536)).toBe('1.5 KB'); // 1.5 KB
      expect(formatBytes(2560)).toBe('2.5 KB'); // 2.5 KB
      expect(formatBytes(5120)).toBe('5 KB'); // 5 KB (no trailing .0)
    });

    it('should format larger KB values', () => {
      expect(formatBytes(10240)).toBe('10 KB');
      expect(formatBytes(102400)).toBe('100 KB');
      expect(formatBytes(1048575)).toBe('1024 KB'); // Just under 1 MB (rounded up)
    });
  });

  describe('megabytes (MB)', () => {
    it('should format exactly 1 MB', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    it('should format MB with decimal places', () => {
      expect(formatBytes(1572864)).toBe('1.5 MB'); // 1.5 MB
      expect(formatBytes(2621440)).toBe('2.5 MB'); // 2.5 MB
      expect(formatBytes(5242880)).toBe('5 MB'); // 5 MB (no trailing .0)
    });

    it('should format larger MB values', () => {
      expect(formatBytes(10485760)).toBe('10 MB');
      expect(formatBytes(104857600)).toBe('100 MB');
      expect(formatBytes(1073741823)).toBe('1024 MB'); // Just under 1 GB (rounded up)
    });
  });

  describe('gigabytes (GB)', () => {
    it('should format exactly 1 GB', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should format GB with decimal places', () => {
      expect(formatBytes(1610612736)).toBe('1.5 GB'); // 1.5 GB
      expect(formatBytes(2684354560)).toBe('2.5 GB'); // 2.5 GB
      expect(formatBytes(5368709120)).toBe('5 GB'); // 5 GB (no trailing .0)
    });

    it('should format larger GB values', () => {
      expect(formatBytes(10737418240)).toBe('10 GB');
      expect(formatBytes(107374182400)).toBe('100 GB');
      expect(formatBytes(1099511627775)).toBe('1024 GB'); // Just under 1 TB (rounded up)
    });
  });

  describe('terabytes (TB)', () => {
    it('should format exactly 1 TB', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });

    it('should format TB with decimal places', () => {
      expect(formatBytes(1649267441664)).toBe('1.5 TB'); // 1.5 TB
      expect(formatBytes(2748779069440)).toBe('2.5 TB'); // 2.5 TB
      expect(formatBytes(5497558138880)).toBe('5 TB'); // 5 TB (no trailing .0)
    });

    it('should format larger TB values', () => {
      expect(formatBytes(10995116277760)).toBe('10 TB');
      expect(formatBytes(109951162777600)).toBe('100 TB');
    });

    it('should handle very large TB values', () => {
      // Test that values larger than TB still get formatted as TB
      expect(formatBytes(1099511627776000)).toBe('1000 TB');
    });
  });

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      expect(formatBytes(-1024)).toBe('-1 KB');
      expect(formatBytes(-1048576)).toBe('-1 MB');
    });

    it('should handle very small decimal values', () => {
      expect(formatBytes(0.5)).toBe('0.5 B');
      expect(formatBytes(0.1)).toBe('0.1 B');
    });

    it('should remove trailing zeros from decimal places', () => {
      expect(formatBytes(1024)).toBe('1 KB'); // 1.0 -> 1
      expect(formatBytes(2048)).toBe('2 KB'); // 2.0 -> 2
      expect(formatBytes(5120)).toBe('5 KB'); // 5.0 -> 5
      expect(formatBytes(1048576)).toBe('1 MB'); // 1.0 -> 1
      expect(formatBytes(2097152)).toBe('2 MB'); // 2.0 -> 2
    });

    it('should preserve non-zero decimal places', () => {
      expect(formatBytes(1536)).toBe('1.5 KB'); // 1.5 KB
      expect(formatBytes(1792)).toBe('1.8 KB'); // 1.8 KB (actual behavior)
      expect(formatBytes(1572864)).toBe('1.5 MB'); // 1.5 MB
    });
  });

  describe('boundary values', () => {
    it('should handle values just below unit thresholds', () => {
      expect(formatBytes(1023)).toBe('1023 B'); // Just below 1 KB
      expect(formatBytes(1048575)).toBe('1024 KB'); // Just below 1 MB (rounded up)
      expect(formatBytes(1073741823)).toBe('1024 MB'); // Just below 1 GB (rounded up)
      expect(formatBytes(1099511627775)).toBe('1024 GB'); // Just below 1 TB (rounded up)
    });

    it('should handle values just above unit thresholds', () => {
      expect(formatBytes(1024)).toBe('1 KB'); // Exactly 1 KB
      expect(formatBytes(1048576)).toBe('1 MB'); // Exactly 1 MB
      expect(formatBytes(1073741824)).toBe('1 GB'); // Exactly 1 GB
      expect(formatBytes(1099511627776)).toBe('1 TB'); // Exactly 1 TB
    });
  });
});
