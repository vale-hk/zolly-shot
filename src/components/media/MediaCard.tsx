import { Eye, Play, Bookmark, Star } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { ItemStatusBadge } from "./ItemStatusBadge";
import type { MediaItem, MediaStatus, MediaType } from "@/lib/types";

interface Props {
  item: MediaItem;
  mediaType?: MediaType;
  status?: MediaStatus;
  rating?: number | null;
  onRate?: () => void;
  onStatus?: (s: MediaStatus) => void;
}

export function MediaCard({ item, mediaType = item.type, status, rating, onRate, onStatus }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-xl border bg-card transition hover:-translate-y-1 hover:shadow-glow">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img src={item.poster_url} alt={item.title} loading="lazy" width={672} height={992} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-poster-fade" />
        {status && (
          <div className="absolute left-2 top-2">
            <ItemStatusBadge status={status} mediaType={mediaType} />
          </div>
        )}
        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition group-hover:opacity-100">
          {onStatus && (
            <>
              <IconBtn label="Vista" onClick={() => onStatus("watched")}><Eye className="h-4 w-4" /></IconBtn>
              <IconBtn label="Viendo" onClick={() => onStatus("watching")}><Play className="h-4 w-4" /></IconBtn>
              <IconBtn label="Por ver" onClick={() => onStatus("watchlist")}><Bookmark className="h-4 w-4" /></IconBtn>
            </>
          )}
          {onRate && <IconBtn label="Calificar" onClick={onRate}><Star className="h-4 w-4" /></IconBtn>}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{item.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.year} · {item.genre}</p>
          {rating != null && <div className="mt-2"><RatingStars value={rating} size={14} /></div>}
        </div>
      </div>
    </article>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button title={label} aria-label={label} onClick={onClick} className="rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition hover:bg-primary hover:text-primary-foreground">
      {children}
    </button>
  );
}
