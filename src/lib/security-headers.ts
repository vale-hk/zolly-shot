export function securityHeaders(https: boolean) {
  const headers = new Headers({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // No unsafe script allowlist: Start currently streams inline hydration scripts.
    // Script nonces and full strict CSP require a separate compatible renderer migration.
    'Content-Security-Policy': "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://lovable.dev https://*.lovable.dev https://*.lovable.app https://*.lovableproject.com",
  });
  if (https) headers.set('Strict-Transport-Security', 'max-age=31536000');
  return headers;
}