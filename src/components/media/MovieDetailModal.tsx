import { Bookmark, Check, Clock, Film } from 'lucide-react';
import { Modal } from '@/components/ui-kit/Modal';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import type { MediaItem } from '@/lib/types';
export function MovieDetailModal({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  const { statuses, saveToWatchlist } = useStore(); if (!item) return null;
  const saved = statuses.some(s => s.media_id === item.id);
  return <Modal open onClose={onClose} title={item.title}>
    <div className="flex gap-4"><img src={item.poster_url} alt={item.title} width={672} height={992} className="h-40 w-28 shrink-0 rounded-md object-cover" /><div className="space-y-3 py-2 text-sm"><p className="text-star">{item.year} · {item.genre}</p><p className="flex items-center gap-2"><Film className="h-4 w-4" />{item.director ?? 'Dirección no disponible'}</p><p className="flex items-center gap-2"><Clock className="h-4 w-4" />{item.duration ? `${item.duration} min` : 'Duración no disponible'}</p><p className="text-xs text-muted-foreground">{item.id.startsWith('m') ? 'Película de demostración · Ficha ficticia' : 'Agregada por la comunidad'}</p></div></div>
    <h3 className="mt-5 text-xl">Sinopsis</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.synopsis ?? 'Todavía no hay una sinopsis disponible para esta película.'}</p>
    <Button className="mt-6 w-full" disabled={saved} onClick={() => saveToWatchlist(item.id)}>{saved ? <Check /> : <Bookmark />}{saved ? 'En tu lista' : 'Guardar en Mi Watchlist'}</Button>
  </Modal>;
}
