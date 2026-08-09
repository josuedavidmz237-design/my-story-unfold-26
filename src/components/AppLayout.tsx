import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, ListChecks, Sparkles, LogOut, CalendarDays } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { to: "/hoy", label: "Hoy", icon: CalendarCheck },
  { to: "/habitos", label: "Hábitos", icon: ListChecks },
  { to: "/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/resumen", label: "Resumen", icon: Sparkles },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      // scope local: no falla si el token del servidor ya expiró
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      /* ignoramos: igual limpiamos abajo */
    }
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-") && k.includes("auth-token"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage no disponible */
    }
    toast.success("Sesión cerrada exitosamente");
    // Redirección dura para descartar cualquier estado en memoria
    window.location.replace("/login");
  };


  if (loading || !user) {
    return (
      <div className="ambient-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  const email = user.email ?? "";
  const initial = (email[0] ?? "?").toUpperCase();

  const avatarMenu = (compact?: boolean) => (
    <div className="relative" ref={compact ? undefined : menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-white/5"
        aria-label="Menú de usuario"
        aria-expanded={menuOpen}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-white">
          {initial}
        </span>
        {!compact && (
          <span className="max-w-[180px] truncate text-sm text-muted-foreground">{email}</span>
        )}
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-border/60 bg-card/95 p-2 shadow-xl backdrop-blur-xl">
          <p className="truncate px-3 py-2 text-xs text-muted-foreground">{email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );

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
          <div className="flex items-center gap-3">{avatarMenu()}</div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4" ref={menuRef}>
          <Link to="/hoy" className="font-display text-lg font-semibold text-gradient">
            MyStoryAI
          </Link>
          {avatarMenu(true)}
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
