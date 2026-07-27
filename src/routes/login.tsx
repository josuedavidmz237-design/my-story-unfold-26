import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — MyStoryAI" },
      {
        name: "description",
        content: "Ingresa a MyStoryAI y sigue construyendo tu historia de progreso.",
      },
      { property: "og:title", content: "Iniciar sesión — MyStoryAI" },
      {
        property: "og:description",
        content: "Ingresa a MyStoryAI y sigue construyendo tu historia de progreso.",
      },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup";

function LoginPage() {
  const { user, login } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/hoy", replace: true });
  }, [user, navigate]);

  const errors = useMemo(() => {
    const e: { name?: string; email?: string; password?: string } = {};
    if (mode === "signup" && !name.trim()) e.name = "Ingresa tu nombre";
    if (!email.trim()) e.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Ingresa un email válido";
    if (!password) e.password = "Contraseña requerida";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    return e;
  }, [mode, name, email, password]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!isValid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    login(mode === "signup" ? name : "", email);
    toast.success(mode === "signup" ? "¡Cuenta creada!" : "¡Bienvenid@ de vuelta!");
    navigate({ to: "/hoy", replace: true });
  };

  const handleDemo = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    login("Demo", "demo@mystoryai.app");
    toast.success("Entrando como demo…");
    navigate({ to: "/hoy", replace: true });
  };

  return (
    <div className="ambient-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="text-white" size={26} />
          </div>
          <h1 className="font-display text-4xl font-bold text-gradient">MyStoryAI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu historia de progreso, contada por ti (y por la IA).
          </p>
        </div>

        <div className="glass-card p-6 sm:p-7">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-white/5 p-1">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  mode === m ? "bg-primary/20 text-primary" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <Field
                label="Nombre"
                error={touched.name ? errors.name : undefined}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  className="input-base"
                  placeholder="¿Cómo te llamas?"
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="Email" error={touched.email ? errors.email : undefined}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className="input-base"
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Contraseña" error={touched.password ? errors.password : undefined}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                className="input-base"
                placeholder="Mínimo 6 caracteres"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </Field>

            <button
              type="submit"
              disabled={!isValid || loading}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Entrando…
                </>
              ) : mode === "signup" ? (
                "Crear cuenta"
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="text-sm font-medium text-primary hover:text-primary-glow disabled:opacity-50"
            >
              Continuar como demo →
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Esta es una demo de UI. Ningún dato se envía a un servidor.{" "}
          <Link to="/hoy" className="underline">Saltar</Link>
        </p>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          background: var(--input);
          border: 1px solid var(--border);
          color: var(--foreground);
          border-radius: calc(var(--radius) - 4px);
          padding: 0.7rem 0.9rem;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .input-base:focus {
          border-color: var(--ring);
          box-shadow: 0 0 0 3px oklch(0.68 0.22 305 / 25%);
        }
        .input-base::placeholder { color: var(--muted-foreground); }
      `}</style>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs font-medium text-destructive">{error}</span>
      )}
    </label>
  );
}

// re-import ReactNode type
import type { ReactNode } from "react";
