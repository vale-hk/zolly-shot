import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Flame, Film, CalendarCheck } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import { ACTIVITY_DAYS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/habitos")({
  head: () => ({
    meta: [
      { title: "Hábitos y Calendario · CineTrack" },
      { name: "description", content: "Tu actividad de cine día a día, mes a mes y en el año." },
      { property: "og:title", content: "Hábitos y Calendario · CineTrack" },
      { property: "og:description", content: "Tu actividad de cine día a día, mes a mes y en el año." },
    ],
  }),
  component: Habits,
});

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const heat = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3"];
const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function Habits() {
  const year = 2026;
  const [month, setMonth] = useState(9);
  const [selected, setSelected] = useState<string | null>(null);
  const days = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthTotal = Array.from({ length: days }, (_, i) => ACTIVITY_DAYS[key(year, month, i + 1)] ?? 0).reduce((a, b) => a + b, 0);
  const yearTotal = Object.values(ACTIVITY_DAYS).reduce((a, b) => a + b, 0);
  const perMonth = MONTHS.map((_, m) => Object.entries(ACTIVITY_DAYS).filter(([k]) => +k.slice(5, 7) === m + 1).reduce((a, [, v]) => a + v, 0));
  const max = Math.max(...perMonth, 1);
  let streak = 0;
  for (let d = 28; d > 0 && ACTIVITY_DAYS[key(year, 9, d)]; d--) streak++;

  return (
    <>
      <PageHeader title="Hábitos" subtitle={`Tu año de cine ${year}.`} />
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={Film} label="Películas este año" value={yearTotal} />
        <Stat icon={CalendarCheck} label={`En ${MONTHS[month]}`} value={monthTotal} />
        <Stat icon={Flame} label="Racha actual (días)" value={streak} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <button aria-label="Mes anterior" onClick={() => setMonth((m) => Math.max(0, m - 1))} className="rounded-md p-1 hover:bg-muted"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="text-xl">{MONTHS[month]} {year}</h2>
            <button aria-label="Mes siguiente" onClick={() => setMonth((m) => Math.min(11, m + 1))} className="rounded-md p-1 hover:bg-muted"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => <span key={d}>{d}</span>)}
            {Array.from({ length: offset }).map((_, i) => <span key={`o${i}`} />)}
            {Array.from({ length: days }, (_, i) => {
              const k = key(year, month, i + 1);
              const v = ACTIVITY_DAYS[k] ?? 0;
              return (
                <button key={k} onClick={() => setSelected(k)} className={cn("aspect-square rounded-lg text-sm transition hover:ring-2 hover:ring-ring", heat[v], v >= 2 ? "text-primary-foreground" : "text-foreground", selected === k && "ring-2 ring-ring")}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {selected ? `${selected}: ${ACTIVITY_DAYS[selected] ?? 0} película(s)` : "Toca un día para ver su actividad."}
          </p>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-xl">Por mes</h2>
          <div className="flex h-48 items-end gap-2">
            {perMonth.map((v, m) => (
              <button key={m} onClick={() => setMonth(m)} className="flex flex-1 flex-col items-center gap-1">
                <div className={cn("w-full rounded-t-md transition", m === month ? "bg-primary" : "bg-heat-1 hover:bg-heat-2")} style={{ height: `${(v / max) * 100}%`, minHeight: 4 }} />
                <span className="text-[10px] text-muted-foreground">{MONTHS[m]}</span>
              </button>
            ))}
          </div>
          <h2 className="mb-3 mt-8 text-xl">Año completo</h2>
          <div className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto">
            {Array.from({ length: 364 }, (_, i) => {
              const d = new Date(year, 0, 1 + i);
              const v = ACTIVITY_DAYS[key(year, d.getMonth(), d.getDate())] ?? 0;
              return <span key={i} className={cn("h-2.5 w-2.5 rounded-[2px]", heat[v])} />;
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Film; label: string; value: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
      <Icon className="h-8 w-8 text-primary" />
      <div>
        <p className="font-display text-3xl">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
