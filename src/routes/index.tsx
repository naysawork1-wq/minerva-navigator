import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useHydrate, useStore } from "@/lib/store";
import { roleHome } from "@/components/AuthGate";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  useHydrate();
  const user = useStore(s => s.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate({ to: roleHome(user.role) as any });
    else navigate({ to: "/login" });
  }, [user, navigate]);
  return <div className="min-h-screen bg-cream-soft" />;
}
