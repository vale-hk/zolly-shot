import type { UserMediaStatus } from './types';
export function saveOnce(rows: UserMediaStatus[], mediaId: string, date: string): UserMediaStatus[] {
  if (rows.some(row => row.media_id === mediaId)) return rows;
  return [...rows, { media_id: mediaId, status: 'watchlist', rating: null, updated_at: date }];
}
export function inPeriod(date: string, period: 'week' | 'month' | 'year', now: Date): boolean {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'week') start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  if (period === 'month') start.setDate(1);
  if (period === 'year') { start.setMonth(0); start.setDate(1); }
  const value = new Date(`${date}T12:00:00`);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return value >= start && value < end;
}
