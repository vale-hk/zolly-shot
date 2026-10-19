import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/ui-kit/Modal';
import { passwordSchema, safeAuthError } from '@/lib/auth-rules';
export const Route = createFileRoute('/reset-password')({ head: () => ({ meta: [{ title: 'Restablecer contraseña · CineTrack' }, { name: 'description', content: 'Recupera el acceso a tu diario de cine.' }, { property: 'og:title', content: 'Restablecer contraseña · CineTrack' }, { property: 'og:description', content: 'Recupera el acceso a tu diario de cine.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }), component: ResetPassword });
function ResetPassword() {
  const [recovery, setRecovery] = useState(false); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [pending, setPending] = useState(false);
  useEffect(() => { setRecovery(new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'); }, []);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!recovery) return;
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? 'Revisa tu contraseña.'); return; }
    setPending(true);
    try {
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !data.user) { setMessage('El enlace venció. Solicita uno nuevo.'); return; }
      const { error } = await supabase.auth.updateUser({ password });
      setMessage(error ? safeAuthError(error.code) : 'Contraseña actualizada. Ya puedes volver a tu biblioteca.');
      if (!error) setPassword('');
    } catch { setMessage('No se pudo conectar. Intenta nuevamente.'); } finally { setPending(false); }
  };
  return <section className="mx-auto max-w-md py-10"><h1 className="mb-6 text-3xl">Nueva contraseña</h1>{recovery ? <form onSubmit={submit} className="space-y-4"><label className="block">Contraseña<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" className={`${inputCls} mt-2`} value={password} onChange={e => setPassword(e.target.value)} /></label><Button type="submit" disabled={pending}>Guardar contraseña</Button></form> : <p className="text-muted-foreground">Abre el enlace de recuperación que recibiste por correo.</p>}<p className="mt-4" role="status">{message}</p></section>;
}
