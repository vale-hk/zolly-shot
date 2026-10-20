import { useEffect, useState } from 'react';
import { BookOpen, Bookmark, Check, Clock, Film, Trash2 } from 'lucide-react';
import { Modal, inputCls } from '@/components/ui-kit/Modal';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { RatingStars } from './RatingStars';
import { STATUS_LABELS, type MediaItem, type MediaStatus } from '@/lib/types';

export function MovieDetailModal({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  const { statuses, saveToWatchlist, setStatus, rate, removeFromList } = useStore();
  const entry = item ? statuses.find(s => s.media_id === item.id) : undefined;
  const [value, setValue] = useState(0); const [comment, setComment] = useState('');
  useEffect(() => { setValue(entry?.rating ?? 0); setComment(''); }, [item?.id]);
  if (!item) return null;
  return <Modal open onClose={onClose} title={item.title}>
    <div className="flex gap-4"><div className="poster h-40 w-28 shrink-0"><img src={item.poster_url} alt={item.title} width={672} height={992} className="h-full w-full object-cover" /></div><div className="space-y-2 py-1 text-sm"><p className="text-star">{item.year} · {item.genre}</p><p className="flex items-center gap-2"><Film className="h-4 w-4" />{item.director ?? 'Dirección no disponible'}</p><p className="flex items-center gap-2"><Clock className="h-4 w-4" />{item.duration ? `${item.duration} min` : 'Duración no disponible'}</p>{item.based_on && <p className="flex items-center gap-2 text-accent"><BookOpen className="h-4 w-4" />Adaptación cinematográfica de {item.based_on}</p>}<p className="text-xs text-muted-foreground">{item.id.startsWith('m') ? 'Película de demostración · Ficha ficticia' : 'Agregada por la comunidad'}</p></div></div>
    <h3 className="mt-5 text-xl">Sinopsis</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.synopsis ?? 'Todavía no hay una sinopsis disponible para esta película.'}</p>
    {entry ? <>
      <div className="mt-5 grid grid-cols-3 gap-2">{(['watched', 'watching', 'watchlist'] as MediaStatus[]).map(s => <Button key={s} size="sm" variant={entry.status === s ? 'default' : 'outline'} onClick={() => setStatus(item.id, s)}>{STATUS_LABELS.movie[s]}</Button>)}</div>
      <h3 className="mt-5 text-xl">Tu calificación</h3>
      <div className="mt-2 flex items-center gap-3"><RatingStars value={value} onChange={setValue} size={28} /><span className="font-display text-2xl text-star">{value ? value.toFixed(1) : '—'}</span></div>
      <textarea className={`${inputCls} mt-3`} rows={3} maxLength={280} placeholder="Escribe tu reseña (opcional)" value={comment} onChange={e => setComment(e.target.value)} />
      <p className="mt-1 text-xs text-muted-foreground">La calificación, la reseña y tu nombre visible se publican en la Comunidad cinéfila.</p>
      <Button className="mt-3 w-full" disabled={!value} onClick={async () => { await rate(item.id, value, comment.trim() || undefined); onClose(); }}>Guardar y publicar</Button>
      <Button variant="ghost" className="mt-2 w-full text-destructive" onClick={async () => { await removeFromList(item.id); onClose(); }}><Trash2 />Eliminar de mi lista</Button>
    </> : <Button className="mt-6 w-full" onClick={() => saveToWatchlist(item.id)}><Bookmark />Guardar en Mi Watchlist</Button>}
    {entry && <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground"><Check className="h-3 w-3" />En tu Filmoteca</p>}
  </Modal>;
}
