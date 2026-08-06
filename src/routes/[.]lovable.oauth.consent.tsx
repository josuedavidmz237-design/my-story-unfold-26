import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OAuthDetails = {
  client?: { name?: string | null } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Falta authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/login", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="ambient-bg flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md p-6 text-center">
        <h1 className="font-display text-xl font-semibold">No pudimos cargar la solicitud</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "una aplicación";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("El servidor de autorización no devolvió una redirección.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="ambient-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-md p-6 sm:p-7">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="text-white" size={26} />
          </div>
          <h1 className="font-display text-2xl font-bold text-gradient">
            Conectar {clientName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esto permite que {clientName} lea y escriba tus hábitos, registros diarios y tu
            identidad deseada en MyStoryAI, actuando como tú.
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 text-center text-xs font-medium text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : null}
            Aprobar
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="w-full rounded-full border border-border/60 px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5"
          >
            Denegar
          </button>
        </div>
      </div>
    </main>
  );
}
