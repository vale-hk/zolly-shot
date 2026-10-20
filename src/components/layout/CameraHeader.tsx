import { useEffect, useRef } from 'react';
import { ArrowRight, Film, Quote, CalendarDays } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import camera from '@/assets/cinema-camera.jpg';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
export function CameraHeader({ landing = false }: { landing?: boolean }) {
  const image = useRef<HTMLImageElement>(null); const { openAuth } = useStore();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const move = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (image.current) { const scroll = Math.min(window.scrollY, 800); image.current.style.transform = `translateY(${scroll * .16}px) scale(${1 + scroll * .00035})`; } }); };
    window.addEventListener('scroll', move, { passive: true }); move();
    return () => { window.removeEventListener('scroll', move); cancelAnimationFrame(frame); };
  }, []);
  return <section className={`camera-hero ${landing ? 'landing-hero' : ''}`}>
    <img ref={image} src={camera} alt="Cámara de cine profesional con carretes de película" width={1920} height={1024} />
    <div className="hero-content">
      <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-star"><Film className="h-4 w-4" /> El cine no termina en los créditos</p>
      <h1 className={landing ? 'hero-title' : 'text-5xl md:text-6xl'}>{landing ? 'Zolly Shot' : 'Mi Biblioteca'}</h1>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/80">{landing ? 'Cada película, una historia contigo. Tu diario cinematográfico, tu comunidad y tu próximo gran descubrimiento.' : 'Las historias que viste. Las que te esperan. Todas tienen un lugar aquí.'}</p>
      {landing ? <div className="mt-7 flex flex-wrap gap-3"><Button size="lg" onClick={() => openAuth('signup')}>Registrarse <ArrowRight /></Button><Button size="lg" variant="outline" onClick={() => openAuth('login')}>Iniciar Sesión</Button></div> : <Button asChild className="mt-6"><Link to="/explorar">Buscar mi próxima película <ArrowRight /></Link></Button>}
      <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Film className="h-4 w-4 text-star" /> Diario personal</span><span className="flex items-center gap-2"><Quote className="h-4 w-4 text-star" /> Comunidad cinéfila</span><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-star" /> Hábitos de cine</span></div>
    </div>
  </section>;
}
