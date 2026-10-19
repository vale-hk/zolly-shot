import { z } from 'zod';

export const emailSchema = z.string().trim().email('Escribe un correo válido.').max(254);
export const passwordSchema = z.string().min(12, 'Usa al menos 12 caracteres.').max(128, 'Usa como máximo 128 caracteres.');
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1, 'Escribe tu nombre visible.').max(60),
  consent: z.literal(true, { errorMap: () => ({ message: 'Lee y acepta el aviso de privacidad.' }) }),
});
export const otpSchema = z.string().regex(/^\d{6}$/, 'Escribe los seis dígitos de tu aplicación autenticadora.');

export function safeAuthError(code?: string) {
  if (code === 'weak_password') return 'Elige una contraseña larga, única y que no haya sido filtrada.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
  return 'No se pudo completar la solicitud. Revisa los datos e intenta nuevamente.';
}