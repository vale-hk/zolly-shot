import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Film, Quote, CalendarDays } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import camera from '@/assets/cinema-camera.jpg';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ZollyLogo } from './ZollyLogo';

const LOOP = { duration: 9, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const };

/** Continuous dolly zoom (vertigo): background pushes in while the camera pulls back, in an endless subtle loop. */
export function CameraHeader({ landing = false, compact = false, title, subtitle, action, children }: { landing?: boolean; compact?: boolean; title?: string; subtitle?: string; action?: ReactNode; children?: ReactNode }) {
  const { openAuth } = useStore(); const still = useReducedMotion();
  return <section className={`camera-hero ${landing ? 'landing-hero' : ''} ${compact ? 'compact-hero' : ''}`} style={{ perspective: 900 }}>
    <motion.img src={camera} alt="" aria-hidden className="dolly-bg" width={1920} height={1024} animate={still ? {} : { scale: [1.15, 1.45], rotateX: [0, 2] }} transition={LOOP} />
    <motion.img src={camera} alt="Cámara de cine profesional con carretes de película" className="dolly-fg" width={1920} height={1024} animate={still ? {} : { scale: [1, 0.86], y: [0, 14] }} transition={LOOP} />
    <div className="hero-content">{children ?? (title ? <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl md:text-5xl">{title}</h1>{subtitle && <p className="mt-2 text-foreground/80">{subtitle}</p>}</div>{action}</div> : <>
      <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-star"><Film className="h-4 w-4" /> El cine no termina en los créditos</p>
      {landing ? <h1><ZollyLogo size="xl" /></h1> : <h1 className="text-5xl md:text-6xl">Mi Filmoteca</h1>}
      <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/80">{landing ? 'Registra cada película que ves, califícala, guarda las frases que te marcaron y descubre qué está viendo la comunidad cinéfila.' : 'Las historias que viste. Las que te esperan. Todas tienen un lugar aquí.'}</p>
      {landing ? <div className="mt-7 flex flex-wrap gap-3"><Button size="lg" onClick={() => openAuth('signup')}>Registrarse <ArrowRight /></Button><Button size="lg" variant="outline" onClick={() => openAuth('login')}>Iniciar Sesión</Button></div> : <Button asChild className="mt-6"><Link to="/explorar">Buscar en el Catálogo de cine <ArrowRight /></Link></Button>}
      <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Film className="h-4 w-4 text-star" /> Diario personal</span><span className="flex items-center gap-2"><Quote className="h-4 w-4 text-star" /> Comunidad cinéfila</span><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-star" /> Mi ritmo</span></div>
    </>)}</div>
  </section>;
}
