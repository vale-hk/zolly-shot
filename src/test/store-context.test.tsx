import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import * as sharedContext from '@/lib/store-context';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getUser: () => new Promise(() => {}) } },
}));

afterEach(() => { cleanup(); vi.resetModules(); vi.doUnmock('@/lib/store-context'); });

it('keeps an existing consumer connected when the provider module is reloaded', async () => {
  const before = await import('@/lib/store');
  const originalHook = before.useStore;
  function ExistingConsumer() {
    const { media } = originalHook();
    return <output data-testid="media-id">{media[0]?.id}</output>;
  }
  render(<before.StoreProvider><ExistingConsumer /></before.StoreProvider>);
  expect(screen.getByTestId('media-id').textContent).toBe('m1');
  cleanup();

  vi.resetModules();
  // Model Vite retaining the unchanged context dependency during a provider update.
  vi.doMock('@/lib/store-context', () => sharedContext);
  const after = await import('@/lib/store');
  render(<after.StoreProvider><ExistingConsumer /></after.StoreProvider>);
  expect(screen.getByTestId('media-id').textContent).toBe('m1');
});