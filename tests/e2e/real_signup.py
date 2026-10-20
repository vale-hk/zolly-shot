"""Human-assisted real-inbox E2E; no mocks, admin confirmation or stored secrets."""
import asyncio
import getpass
from urllib.parse import urlparse, parse_qs
from playwright.async_api import async_playwright, expect


async def main():
    email = getpass.getpass('Correo real nuevo bajo tu control (oculto): ').strip()
    password = getpass.getpass('Contraseña única de al menos 12 caracteres (oculta): ')
    if '@' not in email or len(password) < 12:
        raise ValueError('Datos no válidos.')
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        try:
            await page.goto('http://localhost:8080', wait_until='networkidle')
            await page.get_by_role('button', name='Registrarse', exact=True).first.click()
            dialog = page.get_by_role('dialog')
            await dialog.get_by_label('Nombre visible').fill('Cuenta de prueba')
            await dialog.get_by_label('Correo electrónico').fill(email)
            await dialog.get_by_label('Contraseña', exact=True).fill(password)
            await dialog.get_by_role('checkbox').check()
            async with page.expect_response(lambda r: '/auth/v1/signup' in r.url) as info:
                await dialog.get_by_role('button', name='Crear cuenta', exact=True).click()
            response = await info.value
            if not response.ok:
                raise RuntimeError('Registro no aceptado.')
            await expect(dialog.get_by_role('status')).to_contain_text('confirma tu cuenta')
            await expect(dialog.get_by_label('Contraseña', exact=True)).to_have_value('')
            await expect(page.get_by_role('button', name='Cerrar sesión', exact=True)).to_have_count(0)
            print('Registro aceptado sin sesión. Copia el enlace de tu correo; no lo compartas en chat.')
            link = await asyncio.to_thread(getpass.getpass, 'Enlace original de confirmación (oculto): ')
            parsed = urlparse(link)
            if (parsed.scheme != 'https' or parsed.netloc != urlparse(response.url).netloc
                    or parsed.path != '/auth/v1/verify' or parse_qs(parsed.query).get('type') != ['signup']):
                raise ValueError('Enlace no válido para esta aplicación.')
            # Verify the original emailed token. Bring only the resulting callback
            # back to the local app; never fabricate a token or admin-confirm a user.
            await page.goto('about:blank')
            async def capture_callback(route):
                if urlparse(route.request.url).netloc == parsed.netloc:
                    await route.continue_()
                else:
                    await route.fulfill(status=200, content_type='text/html', body='<html></html>')
            await page.route('**/*', capture_callback)
            await page.goto(link, wait_until='domcontentloaded')
            callback = urlparse(page.url)
            if 'access_token=' not in callback.fragment:
                raise RuntimeError('La confirmación no devolvió una sesión.')
            await page.unroute('**/*', capture_callback)
            await page.goto('http://localhost:8080/#' + callback.fragment)
            await expect(page.get_by_role('button', name='Cerrar sesión', exact=True)).to_be_visible()
            if urlparse(page.url).fragment:
                raise RuntimeError('Enlace de sesión no limpiado.')
            await page.get_by_role('button', name='Cerrar sesión', exact=True).click()
            await page.get_by_role('button', name='Iniciar Sesión', exact=True).first.click()
            dialog = page.get_by_role('dialog')
            await dialog.get_by_label('Correo electrónico').fill(email)
            await dialog.get_by_label('Contraseña', exact=True).fill(password + '-incorrecta')
            await dialog.get_by_role('button', name='Iniciar Sesión', exact=True).click()
            await expect(dialog.get_by_role('status')).to_contain_text('No pudimos iniciar sesión')
            await expect(dialog.get_by_label('Contraseña', exact=True)).to_have_value('')
            await dialog.get_by_label('Contraseña', exact=True).fill(password)
            await dialog.get_by_role('button', name='Iniciar Sesión', exact=True).click()
            await expect(dialog).to_be_hidden()
            await expect(page.get_by_role('link', name='Seguridad de cuenta')).to_be_visible()
            await page.reload()
            await expect(page.get_by_role('button', name='Cerrar sesión', exact=True)).to_be_visible()
            await page.get_by_role('button', name='Cerrar sesión', exact=True).click()
            print('PASS: confirmación real, error seguro, inicio de sesión y recarga verificados.')
        finally:
            await context.close()
            await browser.close()


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except (Exception, KeyboardInterrupt):
        # Playwright exceptions can include credentials/URLs; never print them.
        print('NO VERIFICADO: prueba incompleta. No se guardaron credenciales.')
        raise SystemExit(1)