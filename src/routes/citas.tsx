import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Quote as QuoteIcon, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IdeaArea } from "@/lib/store-context";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import { Modal, btnPrimary, inputCls } from "@/components/ui-kit/Modal";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/citas")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Diario personal · Zolly Shot" },
      { name: "description", content: "Tu diario personal con las frases que te marcaron del cine." },
      { property: "og:title", content: "Diario personal · Zolly Shot" },
      { property: "og:description", content: "Tu diario personal con las frases que te marcaron del cine." },
    ],
  }),
  component: Quotes,
});

function Quotes() {
  const { quotes, media, addQuote, user, openAuth } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ media_id: "", text: "", ts: "" });
  const [err, setErr] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.media_id) return setErr("Elige una película");
    if (form.text.trim().length < 3 || form.text.length > 300) return setErr("La cita debe tener entre 3 y 300 caracteres");
    if (form.ts && !/^\d{1,2}:\d{2}:\d{2}$/.test(form.ts)) return setErr("Formato de tiempo hh:mm:ss");
    await addQuote(form.media_id, form.text.trim(), form.ts || "—");
    setForm({ media_id: "", text: "", ts: "" });
    setErr("");
    setOpen(false);
  };

  return (
    <>
      <PageHeader title="Diario personal" subtitle="Citas públicas para la comunidad e ideas privadas sobre cine." action={<Button onClick={() => user ? setOpen(true) : openAuth()}><Plus className="h-4 w-4" /> Publicar cita</Button>} />
      <Tabs defaultValue="citas">
      <TabsList className="mb-6"><TabsTrigger value="citas">Citas de cine · Público</TabsTrigger><TabsTrigger value="ideas"><Lock className="h-3.5 w-3.5" /> Mis ideas sobre cine · Privado</TabsTrigger></TabsList>
      <TabsContent value="ideas"><Ideas /></TabsContent>
      <TabsContent value="citas">
      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
        {quotes.map((q) => {
          const m = media.find((x) => x.id === q.media_id);
          return (
            <figure key={q.id} className="relative mb-4 break-inside-avoid overflow-hidden frame-imax">
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
      </TabsContent>
      </Tabs>
      <Modal open={open} onClose={() => setOpen(false)} title="Nueva cita">
        <p className="mb-4 text-sm text-muted-foreground">La cita y tu nombre visible serán públicos. No incluyas datos personales.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <select className={inputCls} value={form.media_id} onChange={(e) => setForm({ ...form, media_id: e.target.value })}>
            <option value="">Película</option>
            {media.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <textarea className={inputCls} rows={4} placeholder="Escribe la cita…" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          <input className={inputCls} placeholder="Minuto (hh:mm:ss, opcional)" value={form.ts} onChange={(e) => setForm({ ...form, ts: e.target.value })} />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <Button type="submit">Publicar</Button>
        </form>
      </Modal>
    </>
  );
}

const TEMPLATES: Record<IdeaArea, { label: string; prompts: string }> = {
  guion: { label: "Guion / Premisa", prompts: "Premisa:\nConflicto central:\nArco del protagonista:\nGiro o momento clave:\n" },
  produccion: { label: "Producción / Dirección", prompts: "Puesta en escena:\nFotografía e iluminación:\nDirección de actores:\nDiseño de producción:\n" },
  montaje: { label: "Montaje / Edición", prompts: "Ritmo:\nTransiciones destacadas:\nUso del sonido:\nEscena mejor montada:\n" },
  analisis: { label: "Análisis Crítico", prompts: "Tema principal:\nLo que funciona:\nLo que no funciona:\nConclusión:\n" },
};

function Ideas() {
  const { ideas, media, addIdea, removeIdea, user, openAuth } = useStore();
  const [area, setArea] = useState<IdeaArea>("guion");
  const [form, setForm] = useState({ title: "", body: TEMPLATES.guion.prompts, media_id: "" });
  const [err, setErr] = useState("");
  if (!user) return <div className="frame-imax p-8 text-center"><p className="mb-4 text-muted-foreground">Tus ideas sobre cine son privadas y solo tú puedes verlas.</p><Button onClick={() => openAuth()}>Iniciar Sesión para escribir</Button></div>;
  const pick = (a: IdeaArea) => { setArea(a); setForm(f => ({ ...f, body: TEMPLATES[a].prompts })); };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || form.title.length > 120) return setErr("El título debe tener entre 1 y 120 caracteres");
    if (!form.body.trim() || form.body.length > 5000) return setErr("La nota debe tener entre 1 y 5000 caracteres");
    setErr("");
    if (await addIdea({ area, title: form.title.trim(), body: form.body.trim(), media_id: form.media_id || null })) setForm({ title: "", body: TEMPLATES[area].prompts, media_id: "" });
  };
  return <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
    <form onSubmit={submit} className="film-frame space-y-3 self-start px-6 py-5">
      <h2 className="text-xl">Nueva idea</h2>
      <div className="grid grid-cols-2 gap-2">{(Object.keys(TEMPLATES) as IdeaArea[]).map(a => <Button key={a} type="button" size="sm" variant={a === area ? "default" : "outline"} onClick={() => pick(a)}>{TEMPLATES[a].label}</Button>)}</div>
      <input className={inputCls} placeholder="Título" maxLength={120} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <select className={inputCls} value={form.media_id} onChange={e => setForm({ ...form, media_id: e.target.value })}><option value="">Película (opcional)</option>{media.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
      <textarea className={inputCls} rows={9} maxLength={5000} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
      {err && <p className="text-xs text-destructive">{err}</p>}
      <Button type="submit" className="w-full">Guardar idea privada</Button>
    </form>
    <div className="space-y-4">{ideas.length === 0 ? <p className="frame-perf p-6 text-muted-foreground">Aún no escribes ideas. Elige una plantilla y empieza.</p> : ideas.map(i => {
      const m = media.find(x => x.id === i.media_id);
      return <article key={i.id} className="frame-imax p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase text-star">{TEMPLATES[i.area].label}{m ? ` · ${m.title}` : ""}</p><h3 className="mt-1 text-xl">{i.title}</h3></div><Button variant="ghost" size="icon" aria-label="Eliminar idea" onClick={() => void removeIdea(i.id)}><Trash2 /></Button></div><p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{i.body}</p></article>;
    })}</div>
  </div>;
}
