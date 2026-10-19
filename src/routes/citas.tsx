import { createFileRoute } from "@tanstack/react-router";
import { Plus, Quote as QuoteIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import { Modal, btnPrimary, inputCls } from "@/components/ui-kit/Modal";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/citas")({
  head: () => ({
    meta: [
      { title: "Citas Célebres · CineTrack" },
      { name: "description", content: "Un muro con las frases que te marcaron del cine." },
      { property: "og:title", content: "Citas Célebres · CineTrack" },
      { property: "og:description", content: "Un muro con las frases que te marcaron del cine." },
    ],
  }),
  component: Quotes,
});

function Quotes() {
  const { quotes, media, addQuote } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ media_id: "", text: "", ts: "" });
  const [err, setErr] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.media_id) return setErr("Elige una película");
    if (form.text.trim().length < 3 || form.text.length > 300) return setErr("La cita debe tener entre 3 y 300 caracteres");
    if (form.ts && !/^\d{1,2}:\d{2}:\d{2}$/.test(form.ts)) return setErr("Formato de tiempo hh:mm:ss");
    addQuote(form.media_id, form.text.trim(), form.ts || "—");
    setForm({ media_id: "", text: "", ts: "" });
    setErr("");
    setOpen(false);
  };

  return (
    <>
      <PageHeader title="Citas Célebres" subtitle="Frases que se quedan contigo después de los créditos." action={<button className={btnPrimary} onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Publicar cita</button>} />
      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
        {quotes.map((q) => {
          const m = media.find((x) => x.id === q.media_id);
          return (
            <figure key={q.id} className="relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border bg-card">
              {m && <img src={m.poster_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-15" />}
              <div className="relative p-6">
                <QuoteIcon className="mb-3 h-6 w-6 text-primary" />
                <blockquote className="font-display text-xl leading-snug">{q.quote_text}</blockquote>
                <figcaption className="mt-4 text-xs text-muted-foreground">{m?.title} · {q.timestamp} · por {q.user}</figcaption>
              </div>
            </figure>
          );
        })}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Nueva cita">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <select className={inputCls} value={form.media_id} onChange={(e) => setForm({ ...form, media_id: e.target.value })}>
            <option value="">Película</option>
            {media.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <textarea className={inputCls} rows={4} placeholder="Escribe la cita…" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          <input className={inputCls} placeholder="Minuto (hh:mm:ss, opcional)" value={form.ts} onChange={(e) => setForm({ ...form, ts: e.target.value })} />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button className={btnPrimary}>Publicar</button>
        </form>
      </Modal>
    </>
  );
}
