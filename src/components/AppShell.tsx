import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { logout, useStore } from "@/lib/store";
import { Avatar } from "./UI";
import type { Role } from "@/lib/types";
import {
  Search, Lightbulb, Users, FileText, Database, Inbox, UserCircle, FolderKanban,
  GraduationCap, BookOpen, LayoutDashboard, Settings, ClipboardList, UserCog, LogOut, Menu, X, NotebookPen,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV: Record<Role, { to: string; label: string; icon: typeof Search }[]> = {
  consultant: [
    { to: "/scholars", label: "Scholar Search", icon: Search },
    { to: "/ideation", label: "Ideation", icon: Lightbulb },
    { to: "/mentors", label: "Mentor Gallery", icon: Users },
    { to: "/prd", label: "Generate PRD", icon: FileText },
    { to: "/projects", label: "Project Database", icon: Database },
  ],
  mentor: [
    { to: "/mentor/requests", label: "Incoming Requests", icon: Inbox },
    { to: "/mentor/profile", label: "My Profile", icon: UserCircle },
    { to: "/mentor/active", label: "Active Projects", icon: FolderKanban },
  ],
  scholar: [
    { to: "/scholar/project", label: "My Project", icon: BookOpen },
    { to: "/scholar/work", label: "My Work", icon: NotebookPen },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/ideas", label: "Ideas", icon: Lightbulb },
    { to: "/admin/scholars", label: "Scholars", icon: GraduationCap },
    { to: "/admin/mentors", label: "Mentors", icon: Users },
    { to: "/admin/consultants", label: "Consultants", icon: UserCog },
    { to: "/admin/requests", label: "Requests", icon: ClipboardList },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const user = useStore(s => s.user);
  const navigate = useNavigate();
  const path = useRouterState({ select: r => r.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!user) return <>{children}</>;
  const items = NAV[user.role];
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-cream-soft">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-navy text-white border-b border-[#142540]">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-3 md:gap-6">
            <button className="md:hidden p-1.5" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-teal flex items-center justify-center text-white font-serif text-base" style={{ borderRadius: 2 }}>A</div>
              <div className="leading-tight hidden sm:block">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">Athena Education</div>
                <div className="font-serif text-base">Minerva Ideation</div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <div className="text-sm">{user.name}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">{roleLabel}</div>
            </div>
            <Avatar initials={user.name.split(" ").map(p=>p[0]).slice(0,2).join("")} size={34} color="var(--teal)" />
            <button onClick={() => { logout(); navigate({ to: "/login" as any }); }} className="p-1.5 hover:bg-white/10" title="Sign out" style={{ borderRadius: 2 }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${mobileOpen ? "block" : "hidden"} md:block fixed md:sticky top-14 z-30 md:z-auto h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-[#E4DFD3] flex-shrink-0`}>
          <nav className="p-3 space-y-0.5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted px-3 py-2">{roleLabel} workspace</div>
            {items.map(item => {
              const active = path === item.to || (item.to !== "/admin" && path.startsWith(item.to));
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${active ? "bg-navy text-white" : "text-ink-soft hover:bg-cream"}`}
                  style={{ borderRadius: 2 }}>
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-4 left-3 right-3 text-[10px] text-ink-muted px-2">
            v1.0 · Internal tool · Athena Ed
          </div>
        </aside>
        {mobileOpen && <div className="fixed inset-0 bg-black/30 md:hidden z-20" onClick={() => setMobileOpen(false)} />}

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
