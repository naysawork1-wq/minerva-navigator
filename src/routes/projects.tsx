import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Empty, TrackBadge } from "@/components/UI";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  component: () => (<AuthGate allow={["consultant","admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const projects = useStore(s => s.projects);
  const [tab, setTab] = useState<"accepted"|"rejected">("accepted");
  const list = projects.filter(p => p.status === tab);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader eyebrow="Consultant workspace" title="Project database" description="Every accepted and rejected idea, organised by status." />
      <div className="flex gap-1 mb-6 border-b border-[#E4DFD3]">
        {(["accepted","rejected"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors -mb-px ${tab===t ? "border-b-2 border-teal text-ink" : "text-ink-muted hover:text-ink"}`}>
            {t} ({projects.filter(p => p.status === t).length})
          </button>
        ))}
      </div>
      {list.length === 0 ? <Empty title={`No ${tab} projects yet`} hint="Generate ideas in the Ideation engine." /> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map(p => {
            const feasCls = p.feasibility === "High" ? "feas-high" : p.feasibility === "Medium" ? "feas-med" : "feas-low";
            return (
              <div key={p.id} className="card-elev p-5 anim-fade-up" style={{ borderRadius: 4 }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-serif text-lg text-ink leading-tight">{p.name}</h3>
                  <span className={`text-[10px] uppercase tracking-[0.14em] px-2 py-1 ${feasCls}`} style={{ borderRadius: 2 }}>{p.feasibility}</span>
                </div>
                <div className="text-xs text-ink-muted mb-2">{p.scholarName} · <TrackBadge track={p.track} /></div>
                <p className="text-sm text-ink-soft mb-3">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.techStack.slice(0,5).map(t => <span key={t} className="text-[10px] bg-cream border border-[#E4DFD3] px-2 py-0.5" style={{ borderRadius: 2 }}>{t}</span>)}
                </div>
                <div className="flex justify-between items-center text-[11px] text-ink-muted pt-3 border-t border-[#E4DFD3]">
                  <span>{p.timeline}</span>
                  <span>{p.acceptedAt ? `Accepted ${timeAgo(p.acceptedAt)}` : "Rejected"}</span>
                </div>
                {tab === "accepted" && !p.assignedMentorId && (
                  <button className="btn-teal w-full mt-3" onClick={() => navigate({ to: "/mentors" as any, search: { projectId: p.id } as any })}>Allocate mentor</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
