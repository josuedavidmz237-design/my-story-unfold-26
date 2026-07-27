import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { user } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: user ? "/hoy" : "/login", replace: true });
  }, [user, navigate]);
  return (
    <div className="ambient-bg flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}
