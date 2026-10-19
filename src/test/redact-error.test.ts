import { it, expect } from 'vitest';
import { redactErrorText } from '@/lib/redact-error';

it('removes bearer and recovery credentials and email from diagnostic text', () => {
  const result = redactErrorText('Bearer abc123 access_token=abcdef&refresh_token=refresh123 user=test@example.com password=my-private-password');
  for (const secret of ['abc123', 'abcdef', 'refresh123', 'test@example.com', 'my-private-password']) expect(result).not.toContain(secret);
  expect(result).toContain('[redacted]');
});