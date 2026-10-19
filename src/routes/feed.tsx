import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Bookmark, Check } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import { RatingStars } from "@/components/media/RatingStars";
import { useStore } from "@/lib/store";
import { Button } from '@/components/ui/button';
import { MovieDetailModal } from '@/components/media/MovieDetailModal';
import type { MediaItem } from '@/lib/types';
import type { Activity } from "@/lib/types";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Feed Social · CineTrack" },
      { name: "description", content: "Calificaciones, citas y reseñas de la comunidad." },
      { property: "og:title", content: "Feed Social · CineTrack" },
      { property: "og:description", content: "Calificaciones, citas y reseñas de la comunidad." },
    ],
  }),
  component: Feed,
});

const VERB: Record<Activity["action_type"], string> = { rated: "calificó", quoted: "citó", started: "empezó a ver", added: "agregó" };

function Feed() {
  const { feed, media, statuses, saveToWatchlist } = useStore();
  const [detail, setDetail] = useState<MediaItem | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  return (
    <>
      <PageHeader title="Feed Social" subtitle="Lo que está viendo la comunidad." />
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {feed.map((a) => {
          const m = media.find((x) => x.id === a.media_id);
          if (!m) return null;
          return (
            <article key={a.id} className="flex gap-4 film-frame">
              <Button variant="ghost" className="h-28 w-20 shrink-0 overflow-hidden p-0" aria-label={`Ver detalles de ${m.title}`} onClick={() => setDetail(m)}><img src={m.poster_url} alt={m.title} loading="lazy" className="h-full w-full object-cover" /></Button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary">{a.user[0]}</span>
                  <p><span className="font-semibold">{a.user}</span> <span className="text-muted-foreground">{VERB[a.action_type]}</span> <span className="font-semibold">{m.title}</span></p>
                </div>
                {a.rating != null && <div className="mt-2"><RatingStars value={a.rating} /></div>}
                {a.comment && <p className={a.action_type === "quoted" ? "mt-2 font-display text-lg italic" : "mt-2 text-sm text-muted-foreground"}>{a.action_type === "quoted" ? `“${a.comment}”` : a.comment}</p>}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{a.created_at}</span>
                  <Button variant="ghost" size="sm" onClick={() => setLiked((l) => ({ ...l, [a.id]: !l[a.id] }))} className={liked[a.id] ? "flex items-center gap-1 text-accent" : "flex items-center gap-1 hover:text-foreground"}>
                    <Heart className={liked[a.id] ? "h-4 w-4 fill-accent" : "h-4 w-4"} /> Me gusta
                  </Button>
                  
                </div>
                <Button variant="outline" size="sm" className="mt-3 max-w-full whitespace-normal" disabled={statuses.some(s => s.media_id === m.id)} onClick={() => saveToWatchlist(m.id)}>{statuses.some(s => s.media_id === m.id) ? <Check /> : <Bookmark />}{statuses.some(s => s.media_id === m.id) ? 'En tu lista' : 'Guardar en Mi Watchlist'}</Button>
              </div>
            </article>
          );
        })}
      </div>
      <MovieDetailModal item={detail} onClose={() => setDetail(null)} />
    </>
  );
}
