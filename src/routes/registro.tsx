import type { ReactNode } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, authErrorMessage } from "@/lib/auth-context";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — MyStoryAI" },
      {
        name: "description",
        content: "Crea tu cuenta en MyStoryAI y empieza a registrar tu historia de progreso.",
      },
      { property: "og:title", content: "Crear cuenta — MyStoryAI" },
      {
        property: "og:description",
        content: "Crea tu cuenta en MyStoryAI y empieza a registrar tu historia de progreso.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { user, loading: sessionLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionLoading && user) navigate({ to: "/hoy", replace: true });
  }, [user, sessionLoading, navigate]);

  const errors = useMemo(() => {
    const e: { email?: string; password?: string; confirm?: string } = {};
    if (!email.trim()) e.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Ingresa un email válido";
    if (!password) e.password = "Contraseña requerida";
    else if (password.length < 8) e.password = "Mínimo 8 caracteres";
    if (!confirm) e.confirm = "Confirma tu contraseña";
    else if (confirm !== password) e.confirm = "Las contraseñas no coinciden";
    return e;
  }, [email, password, confirm]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setTouched({ email: true, password: true, confirm: true });
    if (!isValid || loading) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setLoading(false);
      toast.error(authErrorMessage(error.message, "signup"));
      return;
    }
    if (!data.session) {
      // Si la confirmación de correo está desactivada en Supabase, esto inicia sesión directo.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setLoading(false);
        toast.success("Cuenta creada. Revisa tu correo para confirmarla.");
        navigate({ to: "/login", replace: true });
        return;
      }
    }
    toast.success("¡Cuenta creada!");
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
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-center text-sm font-medium text-muted-foreground"
            >
              Iniciar sesión
            </Link>
            <span className="rounded-full bg-primary/20 px-4 py-2 text-center text-sm font-medium text-primary">
              Crear cuenta
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </Field>
            <Field
              label="Confirmar contraseña"
              error={touched.confirm ? errors.confirm : undefined}
            >
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                className="input-base"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
              />
            </Field>

            <button
              type="submit"
              disabled={!isValid || loading}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Creando cuenta…
                </>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="underline">
            Inicia sesión
          </Link>
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
