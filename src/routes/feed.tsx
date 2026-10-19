import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import { RatingStars } from "@/components/media/RatingStars";
import { useStore } from "@/lib/store";
import type { Activity } from "@/lib/types";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
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
  const { feed, media } = useStore();
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  return (
    <>
      <PageHeader title="Feed Social" subtitle="Lo que está viendo la comunidad." />
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {feed.map((a) => {
          const m = media.find((x) => x.id === a.media_id);
          if (!m) return null;
          return (
            <article key={a.id} className="flex gap-4 rounded-2xl border bg-card p-4">
              <img src={m.poster_url} alt={m.title} loading="lazy" className="h-28 w-20 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary">{a.user[0]}</span>
                  <p><span className="font-semibold">{a.user}</span> <span className="text-muted-foreground">{VERB[a.action_type]}</span> <span className="font-semibold">{m.title}</span></p>
                </div>
                {a.rating != null && <div className="mt-2"><RatingStars value={a.rating} /></div>}
                {a.comment && <p className={a.action_type === "quoted" ? "mt-2 font-display text-lg italic" : "mt-2 text-sm text-muted-foreground"}>{a.action_type === "quoted" ? `“${a.comment}”` : a.comment}</p>}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{a.created_at}</span>
                  <button onClick={() => setLiked((l) => ({ ...l, [a.id]: !l[a.id] }))} className={liked[a.id] ? "flex items-center gap-1 text-accent" : "flex items-center gap-1 hover:text-foreground"}>
                    <Heart className={liked[a.id] ? "h-4 w-4 fill-accent" : "h-4 w-4"} /> Me gusta
                  </button>
                  <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> Comentar</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
