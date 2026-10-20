import { describe, expect, it } from 'vitest';
import { catalogYears, GENRES } from '@/lib/mock-data';
import { profileSchema } from '@/lib/profile-rules';

describe('Zolly Shot rules', () => {
  it('catalog years run from 1920 to the current year', () => {
    const years = catalogYears(new Date('2026-10-20T12:00:00'));
    expect(years[0]).toBe(2026);
    expect(years.at(-1)).toBe(1920);
  });
  it('genres include the requested ones', () => {
    for (const g of ['Ciencia ficción', 'Noir', 'Neorrealismo', 'Thriller psicológico', 'Terror', 'Drama', 'Animación', 'Documental']) expect(GENRES).toContain(g);
  });
  it('pseudonym is limited to 40 characters', () => {
    expect(profileSchema.safeParse({ name: 'Ana', pseudonym: 'x'.repeat(41) }).success).toBe(false);
    expect(profileSchema.safeParse({ name: 'Ana', pseudonym: 'x'.repeat(40) }).success).toBe(true);
  });
});
