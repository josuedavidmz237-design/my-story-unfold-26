import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const Ctx = createContext<AuthCtx>({ session: null, user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading }),
    [session, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

/** Traduce errores de Supabase a mensajes en español, sin exponer el mensaje crudo. */
export function authErrorMessage(raw: string | undefined, mode: "signin" | "signup") {
  const m = (raw ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Debes confirmar tu correo antes de iniciar sesión.";
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already"))
    return "Este correo ya está registrado.";
  if (m.includes("password") && (m.includes("short") || m.includes("at least") || m.includes("6 characters")))
    return "La contraseña es demasiado corta.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (m.includes("invalid email") || m.includes("email address"))
    return "El correo no es válido.";
  return mode === "signup"
    ? "No pudimos crear tu cuenta. Inténtalo de nuevo."
    : "No pudimos iniciar sesión. Inténtalo de nuevo.";
}
