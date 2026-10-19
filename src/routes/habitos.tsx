import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown, ChevronLeft, ChevronRight, Film, Star, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/AppShell';
import { MediaCard } from '@/components/media/MediaCard';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { inPeriod } from '@/lib/library-rules';
import { cn } from '@/lib/utils';
export const Route = createFileRoute('/habitos')({ head: () => ({ meta: [
  { title: 'Hábitos de cine · CineTrack' }, { name: 'description', content: 'Tus películas vistas esta semana, este mes y este año.' },
  { property: 'og:title', content: 'Hábitos de cine · CineTrack' }, { property: 'og:description', content: 'Tus películas vistas esta semana, este mes y este año.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: Habits });
const periods = [{ id: 'week', label: 'Esta Semana' }, { id: 'month', label: 'Este Mes' }, { id: 'year', label: 'Este Año' }] as const;
function Habits() {
  const { statuses, media, user, openAuth } = useStore();
  const [now] = useState(() => new Date()); const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [open, setOpen] = useState<Record<string, boolean>>({ week: true }); const [selected, setSelected] = useState<string | null>(null);
  const watched = statuses.filter(s => s.status === 'watched');
  const dateOf = (s: (typeof watched)[number]) => s.watched_at ?? s.updated_at;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const key = (d: number) => `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const yearCount = watched.filter(s => inPeriod(dateOf(s), 'year', now)).length;
  const rated = watched.filter(s => s.rating != null); const average = rated.length ? rated.reduce((sum,s) => sum+(s.rating ?? 0),0)/rated.length : 0;
  return <><PageHeader title="Hábitos" subtitle="Un momento para cada historia." />
    {!user && <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y py-4"><p className="text-muted-foreground">Tu calendario de cine comienza con tu cuenta.</p><Button onClick={() => openAuth()}>Iniciar Sesión</Button></div>}
    <div className="mb-8 grid grid-cols-3 gap-4 border-y py-5">{[{ icon: Film, label: 'Vistas este año', value: yearCount }, { icon: Star, label: 'Calificación media', value: average.toFixed(1) }, { icon: CalendarDays, label: 'Días de cine', value: new Set(watched.map(dateOf)).size }].map(({ icon: Icon, label, value }) => <div key={label}><Icon className="mb-3 h-5 w-5 text-star" /><p className="font-display text-3xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div>
    <div className="grid gap-10 xl:grid-cols-[1fr_320px]"><div>{periods.map(period => {
      const rows = watched.filter(s => inPeriod(dateOf(s), period.id, now)); const minutes = rows.reduce((sum,s) => sum+(media.find(m => m.id === s.media_id)?.duration ?? 0),0);
      return <section key={period.id} className="border-b"><Button variant="ghost" className="h-auto w-full justify-between rounded-none px-0 py-6" aria-expanded={!!open[period.id]} aria-controls={`period-${period.id}`} onClick={() => setOpen(o => ({ ...o, [period.id]: !o[period.id] }))}><span className="font-display text-2xl">{period.label}</span><span className="flex items-center gap-3 text-muted-foreground">{rows.length} <Film /><ChevronDown className={cn('transition',open[period.id] && 'rotate-180')} /></span></Button>
        {open[period.id] && <div id={`period-${period.id}`} className="pb-7"><div className="mb-5 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>{rows.length} películas vistas</span><span>{minutes} minutos registrados</span></div>{rows.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{rows.map(s => { const item = media.find(m => m.id === s.media_id); return item ? <div key={s.media_id}><MediaCard item={item} status="watched" rating={s.rating} /><div className="mt-2 flex items-center justify-between text-xs text-star"><span>Vista · {dateOf(s)}</span><span>100%</span></div><progress className="mt-1 h-1 w-full" value={100} max={100} aria-label={`${item.title} completada`} /></div> : null; })}</div> : <p className="border-l-2 border-primary py-3 pl-4 text-sm text-muted-foreground">Aún no has registrado películas vistas en este período.</p>}</div>}
      </section>;
    })}</div><section className="self-start"><div className="mb-5 flex items-center justify-between"><Button variant="ghost" size="icon" aria-label="Mes anterior" onClick={() => setMonth(m => new Date(m.getFullYear(),m.getMonth()-1,1))}><ChevronLeft /></Button><h2 className="text-xl capitalize">{month.toLocaleDateString('es-CL',{ month:'long', year:'numeric' })}</h2><Button variant="ghost" size="icon" aria-label="Mes siguiente" onClick={() => setMonth(m => new Date(m.getFullYear(),m.getMonth()+1,1))}><ChevronRight /></Button></div><div className="grid grid-cols-7 gap-1 text-center">{['L','M','X','J','V','S','D'].map((d,i) => <span key={i} className="py-2 text-xs text-muted-foreground">{d}</span>)}{Array.from({ length:offset },(_,i) => <span key={`blank${i}`} />)}{Array.from({ length:days },(_,i) => { const date = key(i+1); const count = watched.filter(s => dateOf(s)===date).length; return <Button key={date} variant="ghost" className={cn('aspect-square h-auto p-0 text-xs', count > 0 && 'bg-primary text-primary-foreground', selected===date && 'ring-1 ring-ring')} onClick={() => setSelected(date)} aria-label={`${date}: ${count} películas`}>{i+1}</Button>; })}</div>{selected && <div className="mt-5 border-t pt-4"><p className="mb-3 text-xs text-muted-foreground">{selected}</p>{watched.filter(s => dateOf(s)===selected).map(s => { const item=media.find(m => m.id===s.media_id); return item ? <MediaCard key={item.id} item={item} rating={s.rating} /> : null; })}{!watched.some(s => dateOf(s)===selected) && <p className="text-sm text-muted-foreground">Sin películas registradas.</p>}</div>}</section></div>
  </>;
}
