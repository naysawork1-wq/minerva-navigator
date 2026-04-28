import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore, useHydrate } from "@/lib/store";
import type { Role } from "@/lib/types";

export function AuthGate({ children, allow }: { children: React.ReactNode; allow?: Role[] }) {
  useHydrate();
  const user = useStore(s => s.user);
  const path = useRouterState({ select: r => r.location.pathname });
  const navigate = useNavigate();
  useEffect(() => {
    if (!user && path !== "/login") navigate({ to: "/login" as any });
    else if (user && allow && !allow.includes(user.role)) navigate({ to: roleHome(user.role) as any });
  }, [user, path, allow, navigate]);
  if (!user && path !== "/login") return null;
  if (user && allow && !allow.includes(user.role)) return null;
  return <>{children}</>;
}

export function roleHome(r: Role) {
  switch (r) {
    case "consultant": return "/scholars";
    case "mentor": return "/mentor/requests";
    case "scholar": return "/scholar/project";
    case "admin": return "/admin";
  }
}
