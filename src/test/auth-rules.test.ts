import { describe, it, expect } from 'vitest';
import { signupSchema, passwordSchema, otpSchema } from '@/lib/auth-rules';
import { securityHeaders } from '@/lib/security-headers';

describe('registration protection', () => {
  it('requires explicit privacy acceptance', () => {
    expect(signupSchema.safeParse({ email: 'test@example.org', password: 'Unique-pass-2026', name: 'Cinéfila', consent: false }).success).toBe(false);
    expect(signupSchema.safeParse({ email: 'test@example.org', password: 'Unique-pass-2026', name: 'Cinéfila', consent: true }).success).toBe(true);
  });
  it('accepts a profile with only a display name', () => {
    const result = signupSchema.parse({ email: 'test@example.org', password: 'Unique-pass-2026', name: 'Valeska', consent: true, avatar: 'unused' });
    expect(result.name).toBe('Valeska');
    expect(result).not.toHaveProperty('avatar');
  });
  it('enforces twelve characters on new passwords', () => {
    expect(passwordSchema.safeParse('12345678901').success).toBe(false);
    expect(passwordSchema.safeParse('123456789012').success).toBe(true);
  });
  it('requires a six digit authenticator code', () => {
    expect(otpSchema.safeParse('12345').success).toBe(false);
    expect(otpSchema.safeParse('123456').success).toBe(true);
  });
  it('only sets HTTPS transport enforcement for HTTPS requests', () => {
    expect(securityHeaders(false).has('Strict-Transport-Security')).toBe(false);
    expect(securityHeaders(true).get('Strict-Transport-Security')).toBe('max-age=31536000');
    expect(securityHeaders(true).get('Referrer-Policy')).toBe('no-referrer');
  });
});