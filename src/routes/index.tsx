import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import { MediaCard } from "@/components/media/MediaCard";
import { RateModal } from "@/components/media/RateModal";
import { useStore } from "@/lib/store";
import { STATUS_LABELS, type MediaItem, type MediaStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mi Biblioteca · CineTrack" },
      { name: "description", content: "Tus películas vistas, en curso y por ver, con calificaciones." },
      { property: "og:title", content: "Mi Biblioteca · CineTrack" },
      { property: "og:description", content: "Tus películas vistas, en curso y por ver, con calificaciones." },
    ],
  }),
  component: Library,
});

const TABS: MediaStatus[] = ["watched", "watching", "watchlist"];

function Library() {
  const { media, statuses, setStatus } = useStore();
  const [tab, setTab] = useState<MediaStatus>("watched");
  const [rating, setRating] = useState<MediaItem | null>(null);

  const rows = statuses.filter((s) => s.status === tab).map((s) => ({ s, item: media.find((m) => m.id === s.media_id)! })).filter((r) => r.item);
  const rated = statuses.filter((s) => s.rating != null);
  const avg = rated.length ? rated.reduce((a, s) => a + (s.rating ?? 0), 0) / rated.length : 0;

  return (
    <>
      <PageHeader title="Mi Biblioteca" subtitle="Todo lo que has visto, estás viendo y quieres ver." />

      <div className="mb-8 grid grid-cols-3 gap-3 md:max-w-xl">
        {TABS.map((t) => (
          <div key={t} className="rounded-xl border bg-card p-4">
            <p className="font-display text-3xl">{statuses.filter((s) => s.status === t).length}</p>
            <p className="text-xs text-muted-foreground">{STATUS_LABELS.movie[t]}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="inline-flex rounded-full border bg-card p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {STATUS_LABELS.movie[t]}
            </button>
          ))}
        </div>
        <p className="hidden text-sm text-muted-foreground sm:block">Promedio <span className="text-star">★ {avg.toFixed(1)}</span></p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Nada por aquí todavía.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {rows.map(({ s, item }) => (
            <MediaCard key={item.id} item={item} mediaType="movie" status={s.status} rating={s.rating} onStatus={(st) => setStatus(item.id, st)} onRate={() => setRating(item)} />
          ))}
        </div>
      )}

      {rating && <RateModal item={rating} initial={statuses.find((s) => s.media_id === rating.id)?.rating ?? null} onClose={() => setRating(null)} />}
    </>
  );
}
