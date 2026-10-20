import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Clapperboard, NotebookPen, UserRound, Users } from "lucide-react";
import { CameraHeader } from "@/components/layout/CameraHeader";
import { PageHeader } from "@/components/layout/AppShell";
import { MediaCard } from "@/components/media/MediaCard";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/ui-kit/Modal";
import { useStore } from "@/lib/store";
import { profileSchema } from "@/lib/profile-rules";
import { STATUS_LABELS, type MediaStatus } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zolly Shot · Tu diario de cine" },
      { name: "description", content: "Registra, califica y comenta tus películas con la comunidad cinéfila de Zolly Shot." },
      { property: "og:title", content: "Zolly Shot · Tu diario de cine" },
      { property: "og:description", content: "Registra, califica y comenta tus películas con la comunidad cinéfila." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, media } = useStore();
  if (!user) return <><CameraHeader landing /><section className="mx-auto max-w-7xl px-6 py-8 md:px-10"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase text-star">Próxima función</p><h2 className="mt-2 text-3xl">Historias por descubrir</h2></div><Button variant="link" asChild><Link to="/explorar">Ver Catálogo de cine →</Link></Button></div><p className="mb-6 text-sm text-muted-foreground">Selección de demostración · Películas y fichas ficticias</p><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{media.slice(0, 6).map(item => <MediaCard key={item.id} item={item} />)}</div></section></>;
  return <Dashboard />;
}

function Dashboard() {
  const { statuses, media, displayName, pseudonym } = useStore();
  const count = (s: MediaStatus) => statuses.filter(x => x.status === s).length;
  const recent = [...statuses].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5).map(s => media.find(m => m.id === s.media_id)).filter(m => !!m);
  return <>
    <PageHeader title={`Hola, ${pseudonym || displayName}`} subtitle="Tu sala privada de Zolly Shot." />
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">{(["watched", "watching", "watchlist"] as MediaStatus[]).map(s => <div key={s} className="ticket px-4"><p className="font-display text-3xl">{count(s)}</p><p className="text-xs text-muted-foreground">{STATUS_LABELS.movie[s]}</p></div>)}</div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Shortcut to="/filmoteca" icon={<Clapperboard />} label="Filmoteca" />
          <Shortcut to="/citas" icon={<NotebookPen />} label="Diario personal" />
          <Shortcut to="/feed" icon={<Users />} label="Comunidad cinéfila" />
        </div>
        <div><h2 className="mb-4 text-2xl">Movimientos recientes</h2>{recent.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">{recent.map(m => <MediaCard key={m.id} item={m} status={statuses.find(s => s.media_id === m.id)?.status} />)}</div> : <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">Aún no guardas películas. <Link to="/explorar" className="text-primary underline">Abre el Catálogo de cine</Link>.</p>}</div>
      </div>
      <ProfileCard />
    </div>
  </>;
}

function Shortcut({ to, icon, label }: { to: "/filmoteca" | "/citas" | "/feed"; icon: React.ReactNode; label: string }) {
  return <Button variant="outline" asChild className="h-auto justify-between py-4"><Link to={to}><span className="flex items-center gap-2">{icon}{label}</span><ArrowRight /></Link></Button>;
}

function ProfileCard() {
  const { displayName, pseudonym, updateProfile } = useStore();
  const [name, setName] = useState(displayName); const [alias, setAlias] = useState(pseudonym ?? ""); const [err, setErr] = useState("");
  useEffect(() => { setName(displayName); setAlias(pseudonym ?? ""); }, [displayName, pseudonym]);
  const done = [displayName !== "Cinéfilo", !!pseudonym].filter(Boolean).length;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = profileSchema.safeParse({ name, pseudonym: alias });
    if (!r.success) return setErr(r.error.issues[0]?.message ?? "Revisa los datos");
    setErr(""); await updateProfile(r.data.name, r.data.pseudonym);
  };
  return <form onSubmit={submit} className="film-frame space-y-3 self-start px-6 py-5">
    <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-primary/20 font-display text-xl text-primary">{(alias || name || "C")[0]?.toUpperCase()}</span><div><h2 className="text-xl">Completar perfil</h2><p className="text-xs text-muted-foreground">{done} de 2 listos</p></div></div>
    <progress className="h-1.5 w-full" value={done} max={2} />
    <label className="block text-sm">Nombre visible<input className={`${inputCls} mt-1`} value={name} maxLength={60} onChange={e => setName(e.target.value)} /></label>
    <label className="block text-sm">Seudónimo cinéfilo<input className={`${inputCls} mt-1`} value={alias} maxLength={40} placeholder="Ej.: La Ojo de Kubrick" onChange={e => setAlias(e.target.value)} /></label>
    {err && <p className="text-xs text-destructive">{err}</p>}
    <p className="flex items-start gap-2 text-xs text-muted-foreground"><UserRound className="h-4 w-4 shrink-0" />Tu nombre visible aparece en tus publicaciones. No uses datos personales.</p>
    <Button type="submit" className="w-full">Guardar perfil</Button>
  </form>;
}
