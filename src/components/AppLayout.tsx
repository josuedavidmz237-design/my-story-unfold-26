import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, ListChecks, Sparkles, LogOut, CalendarDays } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/mock-store";

const NAV = [
  { to: "/hoy", label: "Hoy", icon: CalendarCheck },
  { to: "/habitos", label: "Hábitos", icon: ListChecks },
  { to: "/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/resumen", label: "Resumen", icon: Sparkles },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  return (
    <div className="ambient-bg min-h-screen pb-24 lg:pb-0 lg:pt-20">
      {/* Top nav (desktop) */}
      <header className="fixed top-0 left-0 right-0 z-40 hidden lg:block border-b border-border/60 bg-background/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/hoy" className="font-display text-xl font-semibold text-gradient">
            MyStoryAI
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to === "/hoy" && pathname === "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Hola, {user?.name ?? "invitado"}</span>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-white/5"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/hoy" className="font-display text-lg font-semibold text-gradient">
            MyStoryAI
          </Link>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6 lg:py-10">{children}</main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border/60 bg-background/80 backdrop-blur-xl">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to === "/hoy" && pathname === "/");
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
