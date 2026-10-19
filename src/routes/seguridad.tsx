import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { ShieldCheck, KeyRound, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/ui-kit/Modal';
import { passwordSchema, otpSchema, safeAuthError } from '@/lib/auth-rules';

export const Route = createFileRoute('/seguridad')({ head: () => ({ meta: [
  { title: 'Seguridad de cuenta · CineTrack' }, { name: 'description', content: 'Verificación en dos pasos, contraseña y cierre de sesiones de CineTrack.' },
  { property: 'og:title', content: 'Seguridad de cuenta · CineTrack' }, { property: 'og:description', content: 'Protege el acceso a tu diario cinematográfico.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: SecurityPage });

function SecurityPage() {
  const { user, openAuth, syncUser } = useStore();
  const [factor, setFactor] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  useEffect(() => {
    let active = true;
    setEnrollment(null); setCode(''); setCurrent(''); setPassword('');
    if (user) void supabase.auth.mfa.listFactors().then(({ data, error }) => { if (active) { setFactor(data?.totp.find(f => f.status === 'verified')?.id ?? null); if (error) setMessage('No se pudo consultar la verificación.'); } });
    return () => { active = false; };
  }, [user?.id]);
  const run = async (action: () => Promise<void>) => {
    setPending(true); setMessage('');
    try { await action(); } catch { setMessage('No se pudo completar la solicitud. Intenta nuevamente.'); } finally { setPending(false); }
  };
  const enroll = () => run(async () => {
    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) { setMessage('No se pudo consultar la verificación.'); return; }
    for (const f of factors.data.all.filter(f => f.factor_type === 'totp' && f.status === 'unverified')) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
      if (error) { setMessage('No se pudo reiniciar la configuración.'); return; }
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'CineTrack', issuer: 'CineTrack' });
    if (error || !data) { setMessage('La verificación no está disponible. Intenta nuevamente.'); return; }
    setEnrollment({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  });
  const verify = (e: FormEvent) => { e.preventDefault(); void run(async () => {
    const id = enrollment?.id ?? factor;
    const parsed = otpSchema.safeParse(code);
    if (!id || !parsed.success) { setMessage('Escribe un código de seis dígitos.'); return; }
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: id, code: parsed.data });
    if (error) { setMessage('Código incorrecto o vencido.'); return; }
    setFactor(id); setEnrollment(null); setCode('');
    const { data } = await supabase.auth.getUser(); await syncUser(data.user);
    setMessage('Verificación en dos pasos activada.');
  }); };
  const disable = () => run(async () => {
    if (!factor) return;
    const parsed = otpSchema.safeParse(code);
    if (!parsed.success) { setMessage('Ingresa un código actual antes de desactivar.'); return; }
    const verified = await supabase.auth.mfa.challengeAndVerify({ factorId: factor, code: parsed.data });
    if (verified.error) { setMessage('Código incorrecto o vencido.'); return; }
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor });
    if (error) { setMessage('No se pudo desactivar.'); return; }
    await supabase.auth.refreshSession(); setFactor(null); setCode(''); setMessage('Verificación desactivada.');
  });
  const change = (e: FormEvent) => { e.preventDefault(); void run(async () => {
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? 'Revisa tu contraseña.'); return; }
    const { error } = await supabase.auth.updateUser({ password: parsed.data, current_password: current });
    setCurrent(''); setPassword(''); setMessage(error ? safeAuthError(error.code) : 'Contraseña actualizada.');
  }); };
  if (!user) return <section className="mx-auto max-w-xl py-10"><h1 className="mb-6 font-display text-4xl">Seguridad de cuenta</h1><Button onClick={() => openAuth()}>Iniciar Sesión</Button></section>;
  return <section className="mx-auto max-w-xl space-y-8 py-4">
    <h1 className="font-display text-4xl">Seguridad de cuenta</h1>
    {message && <p role="status" className="text-star">{message}</p>}
    <div className="space-y-4 border-b pb-8"><h2 className="flex items-center gap-2 text-xl"><ShieldCheck />Verificación en dos pasos</h2><p className="text-sm text-muted-foreground">{factor ? 'Activada. Conserva acceso a tu aplicación autenticadora; no hay recuperación automática si la pierdes.' : 'Añade un código de una aplicación autenticadora para proteger tu acceso.'}</p>
      {!factor && !enrollment && <Button disabled={pending} onClick={enroll}><ShieldCheck />Activar verificación</Button>}
      {enrollment && <div className="space-y-3"><img src={enrollment.qr} alt="Código QR de configuración de tu autenticador" className="h-48 w-48 rounded-md" /><p className="break-all text-sm">Clave de configuración: <span className="font-mono">{enrollment.secret}</span></p><p className="text-sm text-muted-foreground">Escanéalo con tu aplicación autenticadora. No compartas esta clave.</p></div>}
      {(factor || enrollment) && <form onSubmit={verify} className="space-y-3"><label className="block text-sm">Código de autenticador<input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value)} className={`${inputCls} mt-2`} /></label>{enrollment ? <Button disabled={pending} type="submit">Confirmar activación</Button> : <Button disabled={pending} variant="outline" type="button" onClick={disable}>Desactivar verificación</Button>}</form>}
    </div>
    <form onSubmit={change} className="space-y-4 border-b pb-8"><h2 className="flex items-center gap-2 text-xl"><KeyRound />Cambiar contraseña</h2><label className="block text-sm">Contraseña actual<input type="password" required maxLength={128} autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} className={`${inputCls} mt-2`} /></label><label className="block text-sm">Nueva contraseña<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={`${inputCls} mt-2`} /></label><Button disabled={pending} type="submit">Actualizar contraseña</Button></form>
    <Button variant="outline" disabled={pending} onClick={() => run(async () => { const { error } = await supabase.auth.signOut({ scope: 'global' }); if (error) { setMessage('No se pudieron cerrar las sesiones.'); return; } await syncUser(null); })}><LogOut />Cerrar todas las sesiones</Button>
    <p className="text-xs text-muted-foreground">Se revoca la renovación de acceso en todos los dispositivos; un acceso ya emitido puede seguir válido hasta vencer.</p>
  </section>;
}