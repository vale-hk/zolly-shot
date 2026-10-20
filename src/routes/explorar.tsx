import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { PageHeader } from "@/components/layout/AppShell";
import { MediaCard } from "@/components/media/MediaCard";
import { Modal, btnPrimary, inputCls } from "@/components/ui-kit/Modal";
import { GENRES, FIRST_YEAR, catalogYears } from "@/lib/mock-data";
import { STATUS_LABELS } from "@/lib/types";
import { useStore } from "@/lib/store";
import type { MediaStatus } from "@/lib/types";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Catálogo de cine · Zolly Shot" },
      { name: "description", content: "Busca y filtra películas por año y género." },
      { property: "og:title", content: "Catálogo de cine · Zolly Shot" },
      { property: "og:description", content: "Busca y filtra películas por año y género." },
    ],
  }),
  component: Explore,
});

const movieSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(120),
  year: z.coerce.number().int().min(FIRST_YEAR, `Desde ${FIRST_YEAR}`).max(new Date().getFullYear(), "Año inválido"),
  based_on: z.string().trim().max(120).optional(),
  genre: z.string().min(1, "Elige un género"),
  poster_url: z.string().trim().url("URL inválida"),
});

function Explore() {
  const { media, statuses, setStatus, user, openAuth } = useStore();
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [open, setOpen] = useState(false);
  const years = catalogYears();
  const list = media.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()) && (!genre || m.genre === genre) && (!year || m.year === +year));

  return (
    <>
      <PageHeader title="Catálogo de cine" subtitle="Solo películas: encuentra tu próxima función." action={<Button onClick={() => user ? setOpen(true) : openAuth()}><Plus className="h-4 w-4" /> Agregar película faltante</Button>} />
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input className={`${inputCls} pl-9`} aria-label="Buscar por título" placeholder="Buscar por título…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select aria-label="Género" className={`${inputCls} w-auto`} value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Todos los géneros</option>
          {GENRES.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select aria-label="Año" className={`${inputCls} w-auto`} value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Todos los años</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.map((m) => {
          const s = statuses.find((x) => x.media_id === m.id);
          return <MediaCard key={m.id} item={m} status={s?.status} rating={s?.rating} onStatus={(st) => setStatus(m.id, st)} />;
        })}
      </div>
      {list.length === 0 && <p className="py-10 text-center text-muted-foreground">Sin resultados. ¿Falta alguna? Agrégala.</p>}
      <AddMovieModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function AddMovieModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addMedia, setStatus } = useStore();
  const empty = { title: "", year: "", genre: "", poster_url: "", synopsis: "", director: "", duration: "", based_on: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [added, setAdded] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const close = () => { setAdded(null); onClose(); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = movieSchema.safeParse(form);
    if (!r.success) { setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]))); return; }
    const id = await addMedia({ ...r.data, based_on: r.data.based_on || undefined, synopsis: form.synopsis.trim() || undefined, director: form.director.trim() || undefined, duration: +form.duration || undefined, type: "movie" }, "watchlist");
    setForm(empty); setErrors({});
    if (id) setAdded(id); else onClose();
  };

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null);
  if (added) return <Modal open={open} onClose={close} title="Guardada en Por ver">
    <p className="mb-4 text-sm text-muted-foreground">¿Cuál es su estado real?</p>
    <div className="grid gap-2">{([["watched", "Ya la vi"], ["watching", "La estoy viendo"], ["watchlist", "Por ver"]] as [MediaStatus, string][]).map(([s, label]) => <Button key={s} variant={s === "watchlist" ? "default" : "outline"} onClick={async () => { if (s !== "watchlist") await setStatus(added, s); close(); }}>{label}</Button>)}</div>
  </Modal>;
  return (
    <Modal open={open} onClose={onClose} title="Agregar película">
      <p className="mb-3 text-xs text-muted-foreground">Zolly Shot registra solo películas. Si adapta un libro, indícalo abajo.</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div><input className={inputCls} placeholder="Título de la película" value={form.title} onChange={(e) => set("title", e.target.value)} /><Err k="title" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><select className={inputCls} aria-label="Año" value={form.year} onChange={(e) => set("year", e.target.value)}><option value="">Año</option>{catalogYears().map(y => <option key={y}>{y}</option>)}</select><Err k="year" /></div>
          <div><select className={inputCls} aria-label="Género" value={form.genre} onChange={(e) => set("genre", e.target.value)}><option value="">Género</option>{GENRES.map((g) => <option key={g}>{g}</option>)}</select><Err k="genre" /></div>
        </div>
        <div><input className={inputCls} placeholder="URL del póster (https://…)" value={form.poster_url} onChange={(e) => set("poster_url", e.target.value)} /><Err k="poster_url" /></div>
        <textarea className={inputCls} rows={4} placeholder="Sinopsis completa (opcional)" value={form.synopsis} onChange={e => set("synopsis", e.target.value)} />
        <div className="grid grid-cols-2 gap-3"><input className={inputCls} placeholder="Dirección (opcional)" value={form.director} onChange={e => set("director", e.target.value)} /><input type="number" min={1} className={inputCls} placeholder="Duración en minutos" value={form.duration} onChange={e => set("duration", e.target.value)} /></div>
        <div><input className={inputCls} maxLength={120} placeholder="Basada en el libro… (opcional)" value={form.based_on} onChange={e => set("based_on", e.target.value)} /><Err k="based_on" /></div>
        <p className="text-xs text-muted-foreground">Se guardará en "{STATUS_LABELS.movie.watchlist}" y luego eliges su estado.</p>
        <Button type="submit" className="mt-2">Agregar</Button>
      </form>
    </Modal>
  );
}
