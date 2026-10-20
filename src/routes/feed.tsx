import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Eye, Play, Bookmark, Info } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import { RatingStars } from "@/components/media/RatingStars";
import { useStore } from "@/lib/store";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MovieDetailModal } from '@/components/media/MovieDetailModal';
import { inputCls } from '@/components/ui-kit/Modal';
import { STATUS_LABELS, type Activity, type MediaItem, type MediaStatus } from '@/lib/types';

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Comunidad cinéfila · Zolly Shot" },
      { name: "description", content: "Calificaciones, citas, reseñas y comentarios de la comunidad cinéfila." },
      { property: "og:title", content: "Comunidad cinéfila · Zolly Shot" },
      { property: "og:description", content: "Calificaciones, citas, reseñas y comentarios de la comunidad cinéfila." },
    ],
  }),
  component: Feed,
});

const VERB: Record<Activity["action_type"], string> = { rated: "calificó", quoted: "citó", started: "empezó a ver", added: "agregó" };
const ICON: Record<MediaStatus, typeof Eye> = { watched: Eye, watching: Play, watchlist: Bookmark };

function MovieMenu({ m, children, onDetail }: { m: MediaItem; children: React.ReactNode; onDetail: () => void }) {
  const { statuses, setStatus } = useStore();
  const current = statuses.find(s => s.media_id === m.id)?.status;
  return <DropdownMenu><DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger><DropdownMenuContent align="start">
    <DropdownMenuLabel>{m.title}</DropdownMenuLabel><DropdownMenuSeparator />
    {(['watched', 'watching', 'watchlist'] as MediaStatus[]).map(s => { const I = ICON[s]; return <DropdownMenuItem key={s} onSelect={() => void setStatus(m.id, s)}><I />Marcar como {STATUS_LABELS.movie[s]}{current === s ? ' ✓' : ''}</DropdownMenuItem>; })}
    <DropdownMenuSeparator /><DropdownMenuItem onSelect={onDetail}><Info />Ver ficha</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;
}

function Comments({ activityId }: { activityId: string }) {
  const { comments, addComment, user, openAuth } = useStore();
  const [text, setText] = useState("");
  const list = comments.filter(c => c.activity_id === activityId);
  const submit = async (e: FormEvent) => { e.preventDefault(); if (!user) return openAuth(); if (!text.trim()) return; if (await addComment(activityId, text)) setText(""); };
  return <div className="mt-3 space-y-2 border-t pt-3">
    {list.map(c => <p key={c.id} className="text-sm"><span className="font-semibold">{c.display_name}</span> <span className="text-muted-foreground">{c.body}</span></p>)}
    <form onSubmit={submit} className="flex gap-2"><input className={inputCls} maxLength={300} aria-label="Escribe un comentario" placeholder={user ? "Escribe un comentario público…" : "Inicia sesión para comentar"} value={text} onChange={e => setText(e.target.value)} /><Button type="submit" size="sm">Enviar</Button></form>
  </div>;
}

function Feed() {
  const { feed, media, likeCounts, myLikes, toggleLike, comments } = useStore();
  const [detail, setDetail] = useState<MediaItem | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <>
      <PageHeader title="Comunidad cinéfila" subtitle="Lo que está viendo la comunidad. Toca una película para guardarla." />
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {feed.map((a) => {
          const m = media.find((x) => x.id === a.media_id);
          if (!m) return null;
          const liked = myLikes.includes(a.id); const nComments = comments.filter(c => c.activity_id === a.id).length;
          return (
            <article key={a.id} className="film-frame px-6">
              <div className="flex gap-4">
                <MovieMenu m={m} onDetail={() => setDetail(m)}><Button variant="ghost" className="poster h-28 w-20 shrink-0 p-0" aria-label={`Opciones para ${m.title}`}><img src={m.poster_url} alt={m.title} loading="lazy" className="h-full w-full object-cover" /></Button></MovieMenu>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary">{a.user[0]}</span>
                    <p><span className="font-semibold">{a.user}</span> <span className="text-muted-foreground">{VERB[a.action_type]}</span> <MovieMenu m={m} onDetail={() => setDetail(m)}><button type="button" className="font-semibold underline decoration-dotted underline-offset-4 hover:text-primary">{m.title}</button></MovieMenu></p>
                  </div>
                  {a.rating != null && <div className="mt-2"><RatingStars value={a.rating} /></div>}
                  {a.comment && <p className={a.action_type === "quoted" ? "mt-2 font-display text-lg italic" : "mt-2 text-sm text-muted-foreground"}>{a.action_type === "quoted" ? `“${a.comment}”` : a.comment}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{a.created_at}</span>
                    <Button variant="ghost" size="sm" aria-pressed={liked} onClick={() => toggleLike(a.id)} className={liked ? "text-primary" : ""}><Heart className={liked ? "fill-primary" : ""} /> Me gusta {likeCounts[a.id] ? `· ${likeCounts[a.id]}` : ''}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setOpen(o => ({ ...o, [a.id]: !o[a.id] }))}><MessageCircle /> Comentarios {nComments ? `· ${nComments}` : ''}</Button>
                  </div>
                </div>
              </div>
              {open[a.id] && <Comments activityId={a.id} />}
            </article>
          );
        })}
      </div>
      <MovieDetailModal item={detail} onClose={() => setDetail(null)} />
    </>
  );
}
