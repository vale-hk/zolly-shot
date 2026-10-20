import { useEffect, useRef } from 'react';
import { ArrowRight, Film, Quote, CalendarDays } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import camera from '@/assets/cinema-camera.jpg';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ZollyLogo } from './ZollyLogo';

/** Dolly zoom (vertigo): the background pushes in while the camera layer pulls back on scroll. */
export function CameraHeader({ landing = false }: { landing?: boolean }) {
  const root = useRef<HTMLElement>(null); const { openAuth } = useStore();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const move = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const p = Math.min(window.scrollY / 700, 1); root.current?.style.setProperty('--dolly', String(p)); }); };
    window.addEventListener('scroll', move, { passive: true }); move();
    return () => { window.removeEventListener('scroll', move); cancelAnimationFrame(frame); };
  }, []);
  return <section ref={root} className={`camera-hero ${landing ? 'landing-hero' : ''}`}>
    <img src={camera} alt="" aria-hidden className="dolly-bg" width={1920} height={1024} />
    <img src={camera} alt="Cámara de cine profesional con carretes de película" className="dolly-fg" width={1920} height={1024} />
    <div className="hero-content">
      <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-star"><Film className="h-4 w-4" /> El cine no termina en los créditos</p>
      {landing ? <h1><ZollyLogo size="xl" /></h1> : <h1 className="text-5xl md:text-6xl">Mi Filmoteca</h1>}
      <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/80">{landing ? 'Registra cada película que ves, califícala, guarda las frases que te marcaron y descubre qué está viendo la comunidad cinéfila.' : 'Las historias que viste. Las que te esperan. Todas tienen un lugar aquí.'}</p>
      {landing ? <div className="mt-7 flex flex-wrap gap-3"><Button size="lg" onClick={() => openAuth('signup')}>Registrarse <ArrowRight /></Button><Button size="lg" variant="outline" onClick={() => openAuth('login')}>Iniciar Sesión</Button></div> : <Button asChild className="mt-6"><Link to="/explorar">Buscar en el Catálogo de cine <ArrowRight /></Link></Button>}
      <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Film className="h-4 w-4 text-star" /> Diario personal</span><span className="flex items-center gap-2"><Quote className="h-4 w-4 text-star" /> Comunidad cinéfila</span><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-star" /> Hábitos de cine</span></div>
    </div>
  </section>;
}
