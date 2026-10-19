import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export const Route = createFileRoute('/privacidad')({
  head: () => ({ meta: [
    { title: 'Privacidad y seguridad · CineTrack' }, { name: 'description', content: 'Datos privados, publicaciones públicas y límites de protección en CineTrack.' },
    { property: 'og:title', content: 'Privacidad y seguridad · CineTrack' }, { property: 'og:description', content: 'Cómo se tratan tu cuenta, tu biblioteca y tus publicaciones.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Privacy,
});

function Privacy() {
  const { openAuth } = useStore();
  return <section className="mx-auto max-w-2xl space-y-6 py-8">
    <h1 className="font-display text-4xl">Privacidad en CineTrack</h1>
    <p className="text-sm text-muted-foreground">Aviso provisional · 19 de octubre de 2026</p>
    <div className="space-y-3"><h2 className="text-xl font-semibold">Tu cuenta y tu biblioteca</h2><p>Usamos tu correo para acceder, confirmar tu cuenta y recuperar tu contraseña. Solo guardamos un nombre visible en tu perfil; no pedimos avatar. Tu biblioteca y tu perfil solo pueden consultarse con tu propia cuenta. Las contraseñas las gestiona Lovable Cloud; la aplicación no las guarda como texto.</p></div>
    <div className="space-y-3"><h2 className="text-xl font-semibold">Lo que decides publicar</h2><p>Las citas, las calificaciones y las reseñas publicadas son visibles para cualquier visitante junto con tu nombre visible y la fecha. El catálogo de películas agregadas también es público. Guardar una película o marcarla como «Viendo» no publica actividad automáticamente. No incluyas tu correo, dirección ni otra información sensible en publicaciones.</p></div>
    <div className="space-y-3"><h2 className="text-xl font-semibold">Protecciones y límites</h2><p>Confirmamos tu correo y comprobamos contraseñas filtradas. Puedes activar una aplicación autenticadora desde «Seguridad de cuenta». Los identificadores internos de cuenta no se incluyen en las lecturas públicas.</p><p>La sesión se conserva en el navegador y no utiliza cookies HttpOnly. Ninguna aplicación elimina todos los riesgos. Usa una contraseña única, no compartas códigos y cierra sesión en equipos compartidos.</p></div>
    <div className="space-y-3"><h2 className="text-xl font-semibold">Antes de abrir el servicio al público</h2><p>La persona responsable debe completar su identidad y contacto de privacidad, plazos de conservación, procedimiento de acceso y eliminación de datos, información del proveedor y respuesta a incidentes. Esos datos aún no están definidos; este aviso no certifica cumplimiento legal. CAPTCHA, auditoría externa y comprobación de HTTPS del sitio publicado están pendientes.</p></div>
    <Button onClick={() => openAuth('signup')}>Registrarse</Button>
  </section>;
}