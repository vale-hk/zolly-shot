import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Clapperboard, Compass, NotebookPen, UserRound, Users } from "lucide-react";
import { CameraHeader } from "@/components/layout/CameraHeader";
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
  const { displayName, pseudonym } = useStore();
  return <>
    <div className="-mx-4 -mt-6 mb-8 md:-mx-10 md:-mt-10"><CameraHeader compact><h1 className="text-4xl md:text-5xl">¡Hola, {pseudonym || displayName}!</h1><p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/85">Qué gusto tenerte de vuelta en Zolly Shot. Este es tu espacio para vivir el cine a tu propio ritmo: explora nuestro catálogo, inmortaliza tus ideas y citas favoritas en el diario personal o comparte tu pasión en la comunidad. ¡Que disfrutes la función!</p></CameraHeader></div>
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="frame-imax self-start p-6"><h2 className="mb-4 text-2xl">Lo que puedes hacer</h2><ul className="space-y-3 text-sm text-muted-foreground">
        <Cap to="/explorar" icon={<Compass />} label="Catálogo de cine" text="Busca películas y guárdalas en tu Filmoteca." />
        <Cap to="/filmoteca" icon={<Clapperboard />} label="Filmoteca" text="Marca lo que viste, califica y reseña." />
        <Cap to="/citas" icon={<NotebookPen />} label="Diario personal" text="Guarda citas públicas e ideas privadas." />
        <Cap to="/feed" icon={<Users />} label="Comunidad cinéfila" text="Comenta y da me gusta a otros cinéfilos." />
        <Cap to="/mi-ritmo" icon={<CalendarDays />} label="Mi ritmo" text="Mira tus películas por semana, mes y año." />
      </ul></section>
      <ProfileCard />
    </div>
  </>;
}

function Cap({ to, icon, label, text }: { to: "/explorar" | "/filmoteca" | "/citas" | "/feed" | "/mi-ritmo"; icon: React.ReactNode; label: string; text: string }) {
  return <li><Link to={to} className="flex items-start gap-3 rounded-md p-2 transition hover:bg-muted"><span className="text-star [&_svg]:h-5 [&_svg]:w-5">{icon}</span><span><span className="block font-semibold text-foreground">{label}</span>{text}</span></Link></li>;
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
