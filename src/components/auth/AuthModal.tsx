import { useEffect, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';
import { useStore } from '@/lib/store';
import { Modal, inputCls } from '@/components/ui-kit/Modal';
import { Button } from '@/components/ui/button';
import { emailSchema, signupSchema, otpSchema, safeAuthError } from '@/lib/auth-rules';
export function AuthModal() {
  const { authMode, openAuth, closeAuth, user, syncUser } = useStore();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const [pending, setPending] = useState(false); const [message, setMessage] = useState(''); const [forgot, setForgot] = useState(false);
  const [consent, setConsent] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  useEffect(() => {
    setPassword(''); setCode(''); setMessage(''); setForgot(false); setConsent(false); setFactorId(null);
    if (!authMode || !user) return;
    let active = true;
    void supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(async ({ data }) => {
      if (data?.nextLevel !== 'aal2' || data.currentLevel === 'aal2') return;
      const factors = await supabase.auth.mfa.listFactors();
      if (active) setFactorId(factors.data?.totp.find(f => f.status === 'verified')?.id ?? null);
    });
    return () => { active = false; };
  }, [authMode, user?.id]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setPending(true); setMessage('');
    try {
      if (factorId) {
        const parsed = otpSchema.safeParse(code);
        if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? 'Código inválido.'); return; }
        const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: parsed.data });
        if (error) setMessage('Código incorrecto o vencido. Intenta con el siguiente.');
        else { setCode(''); const { data } = await supabase.auth.getUser(); await syncUser(data.user); closeAuth(); }
        return;
      }
      const parsedEmail = emailSchema.safeParse(email);
      if (!parsedEmail.success) { setMessage('Escribe un correo válido.'); return; }
      if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, { redirectTo: `${window.location.origin}/reset-password` });
        setMessage(error ? safeAuthError(error.code) : 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.'); return;
      }
      if (authMode === 'signup') {
        const parsed = signupSchema.safeParse({ email, password, name, consent });
        if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? 'Revisa tus datos.'); return; }
        const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: parsed.data.name, privacy_notice_version: '2026-10-19', privacy_notice_accepted_at: new Date().toISOString() } } });
        if (error) setMessage(safeAuthError(error.code));
        else if (!data.session) setMessage('Revisa tu correo y confirma tu cuenta para comenzar.');
        else closeAuth();
        setPassword('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: parsedEmail.data, password });
        setPassword('');
        if (error) setMessage('No pudimos iniciar sesión. Revisa tu correo y contraseña.');
      }
    } catch { setMessage('No se pudo conectar. Intenta nuevamente.'); } finally { setPassword(''); setPending(false); }
  };
  const social = async (provider: 'google' | 'lovable') => {
    setMessage('');
    if (authMode === 'signup' && !consent) { setMessage('Lee y acepta el aviso de privacidad.'); return; }
    setPending(true);
    try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin }); if (result.error) setMessage('No se pudo iniciar sesión. Intenta nuevamente.'); } catch { setMessage('No se pudo iniciar sesión. Intenta nuevamente.'); } finally { setPending(false); }
  };
  return <Modal open={!!authMode} onClose={closeAuth} title={factorId ? 'Verificar tu identidad' : forgot ? 'Recuperar contraseña' : authMode === 'signup' ? 'Tu primera escena' : 'Bienvenida de nuevo'}>
    {factorId ? <form onSubmit={submit} className="space-y-4"><label className="block text-sm">Código de tu aplicación autenticadora<input className={`${inputCls} mt-2`} value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required /></label>{message && <p role="status" className="text-star text-sm">{message}</p>}<Button type="submit" disabled={pending}>Verificar</Button></form> : <>
    <p className="mb-5 text-sm text-muted-foreground">{forgot ? 'Te enviaremos un enlace por correo.' : 'Tu historia de cine empieza aquí.'}</p>
    <form onSubmit={submit} className="space-y-4">
      {!forgot && authMode === 'signup' && <label className="block text-sm">Nombre visible<input required maxLength={60} className={`${inputCls} mt-1`} value={name} onChange={e => setName(e.target.value)} autoComplete="nickname" /></label>}
      <label className="block text-sm">Correo electrónico<input type="email" required maxLength={254} className={`${inputCls} mt-1`} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
      {!forgot && <label className="block text-sm">Contraseña<input aria-label="Contraseña" type="password" required minLength={authMode === 'signup' ? 12 : 1} maxLength={128} className={`${inputCls} mt-1`} value={password} onChange={e => setPassword(e.target.value)} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} />{authMode === 'signup' && <span className="mt-1 block text-xs text-muted-foreground">Al menos 12 caracteres; usa una contraseña única.</span>}</label>}
      {!forgot && authMode === 'signup' && <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 accent-primary" /><span>He leído el <Link to="/privacidad" onClick={closeAuth} className="underline text-primary">aviso de privacidad</Link>. Mi biblioteca es privada; las citas y reseñas que publique serán públicas.</span></label>}
      {message && <p role="status" className="text-sm text-star">{message}</p>}
      <Button className="w-full" type="submit" disabled={pending}><Mail />{pending ? 'Un momento…' : forgot ? 'Enviar enlace' : authMode === 'signup' ? 'Crear cuenta' : 'Iniciar Sesión'}</Button>
    </form>
    {!forgot && <div className="mt-4 space-y-2 border-t pt-4"><Button variant="outline" disabled={pending} className="w-full" onClick={() => social('google')}>Continuar con Google</Button><Button disabled={pending} className="lovable-auth-button w-full" onClick={() => social('lovable')}>Continue with Lovable</Button></div>}
    <div className="mt-4 flex flex-wrap justify-center gap-1"><Button variant="link" onClick={() => { setForgot(false); setMessage(''); openAuth(authMode === 'signup' ? 'login' : 'signup'); }}>{authMode === 'signup' ? 'Ya tengo cuenta' : 'Registrarse'}</Button><Button variant="link" onClick={() => { setForgot(!forgot); setMessage(''); }}>{forgot ? 'Volver al acceso' : 'Olvidé mi contraseña'}</Button></div>
    </>}
  </Modal>;
}
