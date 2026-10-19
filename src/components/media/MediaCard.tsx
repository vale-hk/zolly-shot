import { useState } from 'react';
import { Eye, Play, Bookmark, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { RatingStars } from './RatingStars';
import { ItemStatusBadge } from './ItemStatusBadge';
import { MovieDetailModal } from './MovieDetailModal';
import type { MediaItem, MediaStatus, MediaType } from '@/lib/types';
interface Props { item: MediaItem; mediaType?: MediaType; status?: MediaStatus | undefined; rating?: number | null | undefined; onRate?: () => void; onStatus?: (s: MediaStatus) => void; }
export function MediaCard({ item, mediaType = item.type, status, rating, onRate, onStatus }: Props) {
  const [detail, setDetail] = useState(false); const { statuses, saveToWatchlist } = useStore();
  const saved = statuses.some(s => s.media_id === item.id);
  return <><article className="film-frame group overflow-hidden transition hover:shadow-glow">
    <div className="relative aspect-[2/3] overflow-hidden rounded-sm">
      <Button variant="ghost" className="block h-full w-full overflow-hidden rounded-none p-0" aria-label={`Ver detalles de ${item.title}`} onClick={() => setDetail(true)}><img src={item.poster_url} alt={item.title} loading="lazy" width={672} height={992} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></Button>
      {status && <div className="pointer-events-none absolute left-2 top-2"><ItemStatusBadge status={status} mediaType={mediaType} /></div>}
    </div>
    <Button variant="link" className="mt-2 h-auto w-full justify-start whitespace-normal px-1 text-left font-display text-lg text-foreground" onClick={() => setDetail(true)}>{item.title}</Button>
    <p className="px-1 text-xs text-muted-foreground">{item.year} · {item.genre}</p>
    {rating != null && <div className="mt-2 px-1"><RatingStars value={rating} size={14} /></div>}
    <div className="mt-3 flex items-center gap-1 border-t pt-2">
      <Button variant="ghost" size="icon" disabled={saved} title={saved ? 'En tu lista' : 'Guardar en Mi Watchlist'} aria-label={saved ? 'En tu lista' : 'Guardar en Mi Watchlist'} onClick={() => saveToWatchlist(item.id)}>{saved ? <Check /> : <Bookmark />}</Button>
      {onStatus && <><Button variant="ghost" size="icon" title="Vista" aria-label="Vista" onClick={() => onStatus('watched')}><Eye /></Button><Button variant="ghost" size="icon" title="Viendo" aria-label="Viendo" onClick={() => onStatus('watching')}><Play /></Button></>}
      {onRate && <Button variant="ghost" size="icon" title="Calificar" aria-label="Calificar" onClick={onRate}><Star /></Button>}
    </div>
  </article><MovieDetailModal item={detail ? item : null} onClose={() => setDetail(false)} /></>;
}
