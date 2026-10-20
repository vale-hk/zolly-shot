import { expect, test } from '@playwright/test';
import { authFixture, fixtureEmail, fixturePassword, openLogin, openSignup } from './auth-fixture';

test('signup requires confirmation, then logout and password login persist through reload', async ({ page }) => {
  const fixture = await authFixture(page);
  const signup = await openSignup(page);
  await signup.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(signup.getByRole('status')).toContainText('confirma tu cuenta');
  expect(fixture.requests.signup?.email).toBe(fixtureEmail);
  expect(fixture.requests.signup?.password).toBe(fixturePassword);
  expect(fixture.requests.signup?.data).toMatchObject({ display_name: 'Cuenta de prueba', privacy_notice_version: '2026-10-19' });
  await expect(signup.getByLabel('Contraseña', { exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toHaveCount(0);
  await signup.getByRole('button', { name: 'Ya tengo cuenta', exact: true }).click();
  await signup.getByLabel('Contraseña', { exact: true }).fill(fixturePassword);
  await signup.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click();
  await expect(signup.getByRole('status')).toContainText('No pudimos iniciar sesión');
  await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toHaveCount(0);
  await fixture.confirmInBrowser();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  const login = await openLogin(page);
  await login.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click();
  await expect(login).toBeHidden();
  expect(fixture.requests.login?.email).toBe(fixtureEmail);
  await expect(page.getByRole('link', { name: 'Seguridad de cuenta' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toBeVisible();
});

for (const [name, code, status] of [
  ['rejected email', 'email_address_invalid', 400],
  ['leaked password', 'weak_password', 422],
  ['email throttling', 'over_email_send_rate_limit', 429],
  ['unexpected server failure', 'unexpected_failure', 500],
] as const) {
  test(`signup safely handles ${name} and permits retry`, async ({ page }) => {
    await authFixture(page);
    const dialog = await openSignup(page);
    await page.route('**/auth/v1/signup**', route => route.fulfill({ status, json: { code, msg: 'INTERNAL_ONLY password=private-value access_token=private-token user@private.example SQLSTATE 23505' } }));
    await dialog.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    await expect(dialog.getByRole('status')).toBeVisible();
    const text = await dialog.getByRole('status').innerText();
    for (const secret of ['INTERNAL_ONLY', 'private-value', 'private-token', 'user@private.example', 'SQLSTATE']) expect(text).not.toContain(secret);
    await expect(dialog.getByLabel('Contraseña', { exact: true })).toHaveValue('');
    await expect(dialog.getByRole('button', { name: 'Crear cuenta', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toHaveCount(0);
  });
}

test('connection failure is safe and does not leave signup disabled', async ({ page }) => {
  await authFixture(page);
  const dialog = await openSignup(page);
  await page.route('**/auth/v1/signup**', route => route.abort('failed'));
  await dialog.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(dialog.getByRole('status')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Crear cuenta', exact: true })).toBeEnabled();
  await expect(dialog.getByRole('status')).not.toContainText(/TypeError|fetch|stack|password=/);
  await expect(dialog.getByLabel('Contraseña', { exact: true })).toHaveValue('');
});

test('login hides account existence and provider details', async ({ page }) => {
  await authFixture(page);
  await page.goto('/');
  const dialog = await openLogin(page);
  await page.route('**/auth/v1/token**', route => route.fulfill({ status: 400, json: { code: 'invalid_credentials', msg: 'INTERNAL_ONLY user exists password=private-value' } }));
  await dialog.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click();
  await expect(dialog.getByRole('status')).toContainText('No pudimos iniciar sesión');
  await expect(dialog.getByRole('status')).not.toContainText(/INTERNAL_ONLY|user exists|private-value/);
  await expect(dialog.getByLabel('Contraseña', { exact: true })).toHaveValue('');
  await expect(dialog.getByRole('button', { name: 'Iniciar Sesión', exact: true })).toBeEnabled();
});