import { Link } from "@tanstack/react-router";
import { CalendarDays, Clapperboard, Compass, Library, Quote, Users } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Biblioteca", icon: Library },
  { to: "/feed", label: "Social", icon: Users },
  { to: "/explorar", label: "Explorar", icon: Compass },
  { to: "/citas", label: "Citas", icon: Quote },
  { to: "/habitos", label: "Hábitos", icon: CalendarDays },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card/40 p-5 backdrop-blur md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <Clapperboard className="h-7 w-7 text-primary" />
          <span className="font-display text-2xl font-semibold">CineTrack</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground" activeProps={{ className: "bg-primary/10 !text-primary font-semibold" }}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto text-xs text-muted-foreground">Películas hoy. Libros pronto.</p>
      </aside>

      <header className="sticky top-0 z-40 flex items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Clapperboard className="h-6 w-6 text-primary" />
        <span className="font-display text-xl font-semibold">CineTrack</span>
      </header>

      <main className="flex-1 px-4 pb-24 pt-6 md:px-10 md:pb-10 md:pt-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t bg-background/90 py-2 backdrop-blur md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="flex flex-col items-center gap-0.5 px-2 text-[10px] text-muted-foreground" activeProps={{ className: "!text-primary" }}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-semibold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
