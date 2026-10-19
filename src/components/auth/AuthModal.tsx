import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';
import { useStore } from '@/lib/store';
import { Modal, inputCls } from '@/components/ui-kit/Modal';
import { Button } from '@/components/ui/button';
export function AuthModal() {
  const { authMode, openAuth, closeAuth } = useStore();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const [pending, setPending] = useState(false); const [message, setMessage] = useState(''); const [forgot, setForgot] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setPending(true); setMessage('');
    try {
      if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        setMessage(error ? error.message : 'Revisa tu correo para restablecer tu contraseña.'); return;
      }
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: name.trim() } } });
        if (error) setMessage(error.message);
        else if (!data.session) setMessage('Revisa tu correo y confirma tu cuenta para comenzar.');
        else closeAuth();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage('No pudimos iniciar sesión. Revisa tu correo y contraseña.'); else closeAuth();
      }
    } catch { setMessage('No se pudo conectar. Intenta nuevamente.'); } finally { setPending(false); }
  };
  const social = async (provider: 'google' | 'lovable') => {
    setMessage('');
    try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin }); if (result.error) setMessage(result.error.message); } catch { setMessage('No se pudo iniciar sesión. Intenta nuevamente.'); }
  };
  return <Modal open={!!authMode} onClose={closeAuth} title={forgot ? 'Recuperar contraseña' : authMode === 'signup' ? 'Tu primera escena' : 'Bienvenida de nuevo'}>
    <p className="mb-5 text-sm text-muted-foreground">{forgot ? 'Te enviaremos un enlace por correo.' : 'Tu historia de cine empieza aquí.'}</p>
    <form onSubmit={submit} className="space-y-4">
      {!forgot && authMode === 'signup' && <label className="block text-sm">Nombre visible<input required maxLength={60} className={`${inputCls} mt-1`} value={name} onChange={e => setName(e.target.value)} autoComplete="nickname" /></label>}
      <label className="block text-sm">Correo electrónico<input type="email" required className={`${inputCls} mt-1`} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
      {!forgot && <label className="block text-sm">Contraseña<input type="password" required minLength={8} className={`${inputCls} mt-1`} value={password} onChange={e => setPassword(e.target.value)} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} /></label>}
      {message && <p role="status" className="text-sm text-star">{message}</p>}
      <Button className="w-full" type="submit" disabled={pending}><Mail />{pending ? 'Un momento…' : forgot ? 'Enviar enlace' : authMode === 'signup' ? 'Crear cuenta' : 'Iniciar Sesión'}</Button>
    </form>
    {!forgot && <div className="mt-4 space-y-2 border-t pt-4"><Button variant="outline" className="w-full" onClick={() => social('google')}>Continuar con Google</Button><Button className="lovable-auth-button w-full" onClick={() => social('lovable')}>Continue with Lovable</Button></div>}
    <div className="mt-4 flex flex-wrap justify-center gap-1"><Button variant="link" onClick={() => { setForgot(false); setMessage(''); openAuth(authMode === 'signup' ? 'login' : 'signup'); }}>{authMode === 'signup' ? 'Ya tengo cuenta' : 'Registrarse'}</Button><Button variant="link" onClick={() => { setForgot(!forgot); setMessage(''); }}>{forgot ? 'Volver al acceso' : 'Olvidé mi contraseña'}</Button></div>
  </Modal>;
}
