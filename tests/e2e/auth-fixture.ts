import { expect, type Page } from '@playwright/test';

// Synthetic identities only. Never use real credentials in mocked tests.
export const fixtureEmail = 'cinetrack-test@example.org';
export const fixturePassword = 'Synthetic-only-pass-2026';
const userId = 'a1111111-1111-4111-8111-111111111111';

export async function authFixture(page: Page) {
  let confirmed = false;
  const requests: { signup?: Record<string, unknown>; login?: Record<string, unknown> } = {};
  const user = () => ({
    id: userId, aud: 'authenticated', role: 'authenticated', email: fixtureEmail,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { display_name: 'Cuenta de prueba' },
    created_at: new Date().toISOString(),
    ...(confirmed ? { email_confirmed_at: new Date().toISOString(), confirmed_at: new Date().toISOString() } : {}),
  });
  const token = () => {
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, aud: 'authenticated', role: 'authenticated', aal: 'aal1', amr: [], iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 })}.synthetic-signature`;
  };
  const session = () => ({ access_token: token(), refresh_token: 'synthetic-refresh-token', token_type: 'bearer', expires_in: 3600, user: user() });
  await page.route('**/auth/v1/**', async route => {
    const url = new URL(route.request().url());
    const body = route.request().postDataJSON() as Record<string, unknown> | null;
    if (url.pathname.endsWith('/signup')) {
      requests.signup = body ?? {};
      await route.fulfill({ json: { user: user(), session: null } });
    } else if (url.pathname.endsWith('/token')) {
      requests.login = body ?? {};
      if (!confirmed) await route.fulfill({ status: 400, json: { code: 'email_not_confirmed', msg: 'Email not confirmed' } });
      else await route.fulfill({ json: session() });
    } else if (url.pathname.endsWith('/user')) {
      await route.fulfill({ json: user() });
    } else if (url.pathname.endsWith('/factors')) {
      await route.fulfill({ json: { all: [], totp: [], phone: [] } });
    } else await route.fulfill({ json: {} });
  });
  await page.route('**/rest/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    await route.fulfill({ json: path.endsWith('/profiles') ? { display_name: 'Cuenta de prueba' } : [] });
  });
  return {
    requests,
    // This deliberately simulates the auth provider's confirmation callback;
    // delivery and real link validity are covered ONLY by real_signup.py.
    async confirmInBrowser() {
      confirmed = true;
      const values = new URLSearchParams({ access_token: token(), refresh_token: 'synthetic-refresh-token', expires_in: '3600', token_type: 'bearer', type: 'signup' });
      await page.goto('about:blank');
      await page.goto(`/#${values}`);
      await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toBeVisible();
      await expect.poll(() => new URL(page.url()).hash).toBe('');
    },
  };
}

export async function openSignup(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Registrarse', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nombre visible').fill('Cuenta de prueba');
  await dialog.getByLabel('Correo electrónico').fill(fixtureEmail);
  await dialog.getByLabel('Contraseña', { exact: true }).fill(fixturePassword);
  await dialog.getByRole('checkbox').check();
  return dialog;
}

export async function openLogin(page: Page) {
  await page.getByRole('button', { name: 'Iniciar Sesión', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Correo electrónico').fill(fixtureEmail);
  await dialog.getByLabel('Contraseña', { exact: true }).fill(fixturePassword);
  return dialog;
}