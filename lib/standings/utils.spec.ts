import { describe, expect, it } from 'vitest';
import { getStartAndEndDates } from './utils';

describe('utils', () => {
  describe('getStartAndEndDates', () => {
    it('should return the correct start and end dates for 2024', () => {
      const { start, end } = getStartAndEndDates(2024);
      expect(start).toBe('08/24/2024');
      expect(end).toBe('11/30/2024');
    });

    it('should return the correct start and end dates for 2025', () => {
      const { start, end } = getStartAndEndDates(2025);
      expect(start).toBe('08/23/2025');
      expect(end).toBe('11/29/2025');
    });
  });
});
