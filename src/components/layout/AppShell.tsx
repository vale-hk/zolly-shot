import { Link, useLocation } from "@tanstack/react-router";
import { CalendarDays, Clapperboard, Compass, Library, Quote, Users, LogOut, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const NAV = [
  { to: "/", label: "Biblioteca", icon: Library },
  { to: "/feed", label: "Social", icon: Users },
  { to: "/explorar", label: "Explorar", icon: Compass },
  { to: "/citas", label: "Citas", icon: Quote },
  { to: "/habitos", label: "Hábitos", icon: CalendarDays },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, displayName, openAuth } = useStore();
  const queryClient = useQueryClient();
  const location = useLocation();
  const logout = async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); };
  if (!user && location.pathname === '/') return <div className="min-h-screen"><header className="flex items-center justify-between gap-3 border-b px-6 py-4 md:px-10"><Link to="/" className="flex items-center gap-2 font-display text-2xl"><Clapperboard className="text-primary" />CineTrack</Link><div className="flex gap-2"><Button variant="ghost" onClick={() => openAuth('login')}>Iniciar Sesión</Button><Button className="hidden sm:inline-flex" onClick={() => openAuth('signup')}>Registrarse</Button></div></header>{children}</div>;
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
        <div className="mt-auto border-t pt-4">{user ? <><p className="mb-2 truncate text-sm">{displayName}</p><Button variant="ghost" asChild><Link to="/seguridad"><ShieldCheck />Seguridad de cuenta</Link></Button><Button variant="ghost" onClick={logout}><LogOut />Cerrar sesión</Button></> : <Button onClick={() => openAuth()}>Iniciar Sesión</Button>}<Link to="/privacidad" className="mt-3 block text-xs text-muted-foreground underline">Privacidad</Link></div>
      </aside>

      <header className="sticky top-0 z-40 flex items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Clapperboard className="h-6 w-6 text-primary" />
        <span className="font-display text-xl font-semibold">CineTrack</span><div className="ml-auto flex">{user ? <><Button variant="ghost" size="icon" asChild><Link to="/seguridad" aria-label="Seguridad de cuenta"><ShieldCheck /></Link></Button><Button variant="ghost" size="icon" aria-label="Cerrar sesión" onClick={logout}><LogOut /></Button></> : <Button size="sm" onClick={() => openAuth()}>Iniciar Sesión</Button>}</div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-6 md:px-10 md:pb-10 md:pt-10 min-w-0">{children}</main>

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
