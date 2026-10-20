import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CameraHeader } from '@/components/layout/CameraHeader';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { MediaCard } from "@/components/media/MediaCard";
import { RateModal } from "@/components/media/RateModal";
import { useStore } from "@/lib/store";
import { STATUS_LABELS, type MediaItem, type MediaStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Zolly Shot · Tu diario cinematográfico" },
      { name: "description", content: "Tus películas vistas, en curso y por ver, con calificaciones." },
      { property: "og:title", content: "Zolly Shot · Tu diario cinematográfico" },
      { property: "og:description", content: "Tus películas vistas, en curso y por ver, con calificaciones." },
    ],
  }),
  component: Library,
});

const TABS: MediaStatus[] = ["watched", "watching", "watchlist"];

function Library() {
  const { media, statuses, setStatus, user, loading } = useStore();
  const [tab, setTab] = useState<MediaStatus>("watched");
  const [rating, setRating] = useState<MediaItem | null>(null);

  const rows = statuses.filter((s) => s.status === tab).map((s) => ({ s, item: media.find((m) => m.id === s.media_id) })).filter((r) => r.item);
  const rated = statuses.filter((s) => s.rating != null);
  const avg = rated.length ? rated.reduce((a, s) => a + (s.rating ?? 0), 0) / rated.length : 0;

  if (!user) return <><CameraHeader landing /><section className="mx-auto max-w-7xl px-6 py-8 md:px-10"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase text-star">Próxima función</p><h2 className="mt-2 text-3xl">Historias por descubrir</h2></div><Button variant="link" asChild><Link to="/explorar">Explorar catálogo →</Link></Button></div><p className="mb-6 text-sm text-muted-foreground">Selección de demostración · Películas y fichas ficticias</p><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{media.slice(0,6).map(item => <MediaCard key={item.id} item={item} />)}</div></section></>;
  return (
    <>
      <div className="-mx-4 -mt-6 mb-8 md:-mx-10 md:-mt-10"><CameraHeader /></div>

      <div className="mb-8 grid grid-cols-3 gap-3 md:max-w-xl">
        {TABS.map((t) => (
          <Button key={t} variant="ghost" onClick={() => setTab(t)} className="ticket h-auto flex-col items-start px-4">
            <p className="font-display text-3xl">{statuses.filter((s) => s.status === t).length}</p>
            <p className="text-xs text-muted-foreground">{STATUS_LABELS.movie[t]}</p>
          </Button>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="inline-flex rounded-full border bg-card p-1">
          {TABS.map((t) => (
            <Button variant="ghost" key={t} onClick={() => setTab(t)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {STATUS_LABELS.movie[t]}
            </Button>
          ))}
        </div>
        <p className="hidden text-sm text-muted-foreground sm:block">Promedio <span className="text-star">★ {avg.toFixed(1)}</span></p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{loading ? "Cargando tu Filmoteca…" : "Nada por aquí todavía. Encuentra una película en Explorar."}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {rows.map(({ s, item }) => (
            item && <MediaCard key={item.id} item={item} mediaType="movie" status={s.status} rating={s.rating} onStatus={(st) => setStatus(item.id, st)} onRate={() => setRating(item)} />
          ))}
        </div>
      )}

      {rating && <RateModal item={rating} initial={statuses.find((s) => s.media_id === rating.id)?.rating ?? null} onClose={() => setRating(null)} />}
    </>
  );
}
