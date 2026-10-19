import { describe, expect, it } from 'vitest';
import { saveOnce, inPeriod } from '@/lib/library-rules';
import type { UserMediaStatus } from '@/lib/types';
describe('watchlist duplicate prevention', () => {
  it('saves each movie only once even after repeated save actions', () => {
    const first = saveOnce([], 'm1', '2026-10-19');
    const second = saveOnce(first, 'm1', '2026-10-19');
    expect(second).toHaveLength(1);
    expect(second[0]?.media_id).toBe('m1');
    expect(second[0]?.status).toBe('watchlist');
  });
  it('does not overwrite an already watched movie when saving again', () => {
    const rows: UserMediaStatus[] = [{ media_id: 'm1', status: 'watched', rating: 4.5, updated_at: '2026-10-18' }];
    expect(saveOnce(rows, 'm1', '2026-10-19')).toEqual(rows);
  });
});
describe('habit periods', () => {
  const now = new Date('2026-10-19T16:00:00');
  it('this week includes Monday and excludes the previous Sunday', () => {
    expect(inPeriod('2026-10-19', 'week', now)).toBe(true);
    expect(inPeriod('2026-10-18', 'week', now)).toBe(false);
  });
  it('this month excludes the previous month', () => {
    expect(inPeriod('2026-10-01', 'month', now)).toBe(true);
    expect(inPeriod('2026-09-30', 'month', now)).toBe(false);
  });
  it('this year excludes previous year and future views', () => {
    expect(inPeriod('2026-01-01', 'year', now)).toBe(true);
    expect(inPeriod('2025-12-31', 'year', now)).toBe(false);
    expect(inPeriod('2026-10-20', 'year', now)).toBe(false);
  });
});
