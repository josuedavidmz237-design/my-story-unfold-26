import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { MockStoreProvider } from "@/lib/mock-store";

function NotFoundComponent() {
  return (
    <div className="ambient-bg flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gradient">404</h1>
        <p className="mt-4 text-muted-foreground">Esta página no existe.</p>
        <a
          href="/"
          className="btn-primary mt-6 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="ambient-bg flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">Algo se rompió</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Intenta recargar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary rounded-full px-5 py-2 text-sm font-semibold"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MyStoryAI — Tu historia de progreso personal" },
      {
        name: "description",
        content:
          "Convierte tus hábitos y journaling diario en una narrativa de progreso personal generada por IA.",
      },
      { property: "og:title", content: "MyStoryAI — Tu historia de progreso personal" },
      {
        property: "og:description",
        content:
          "Registra hábitos, escribe tu diario y recibe un resumen semanal generado por IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <MockStoreProvider>
        <Outlet />
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "color-mix(in oklab, var(--card) 85%, transparent)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </MockStoreProvider>
    </QueryClientProvider>
  );
}
