// Diagnostics are not a place to retain credentials or personal contact details.
export function redactErrorText(text: string): string {
  return text
    .replace(/Bearer\s+[^\s,;"']+/gi, 'Bearer [redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted-token]')
    .replace(/\b(?:sb_secret_|sb_publishable_)[A-Za-z0-9_-]+/g, '[redacted-key]')
    .replace(/((?:access_token|refresh_token|provider_token|password|current_password|secret|authorization)["']?\s*[:=]\s*["']?)[^\s,"'&}]+/gi, '$1[redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .slice(0, 8000);
}