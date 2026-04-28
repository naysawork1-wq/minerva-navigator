import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, TrackBadge, Tag, Avatar, Empty } from "@/components/UI";
import { useStore } from "@/lib/store";
import { initialsOf } from "@/lib/utils";
import { Search, RefreshCw } from "lucide-react";
import { AirtableModal } from "@/components/AirtableModal";

export const Route = createFileRoute("/scholars")({ component: () => (
  <AuthGate allow={["consultant","admin"]}><AppShell><Page/></AppShell></AuthGate>
)});

function Page() {
  const scholars = useStore(s => s.scholars);
  const projects = useStore(s => s.projects);
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState<string>("all");
  const [track, setTrack] = useState<string>("all");
  const [airtableOpen, setAirtableOpen] = useState(false);
  const navigate = useNavigate();

  const filtered = scholars.filter(s => {
    const matchQ = !q || [s.name, s.school, ...s.interests].join(" ").toLowerCase().includes(q.toLowerCase());
    const matchG = grade === "all" || s.grade === grade;
    const matchT = track === "all" || s.track === track;
    return matchQ && matchG && matchT;
  });

  return (
    <>
      <PageHeader
        eyebrow="Consultant workspace"
        title="Scholar directory"
        description="Search Athena scholars to start an ideation session."
        actions={<button className="btn-ghost" onClick={() => setAirtableOpen(true)}><RefreshCw className="w-4 h-4"/> Sync Airtable</button>}
      />

      <div className="card-elev p-4 mb-6 flex flex-col md:flex-row gap-3" style={{ borderRadius: 4 }}>
        <div className="flex-1 flex items-center gap-2 border border-[#E4DFD3] px-3 bg-white" style={{ borderRadius: 2 }}>
          <Search className="w-4 h-4 text-ink-muted" />
          <input className="flex-1 py-2.5 outline-none text-sm bg-transparent" placeholder="Search by name, school, or interest…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="input-base md:w-44" value={grade} onChange={e => setGrade(e.target.value)}>
          <option value="all">All grades</option>
          {["8","9","10","11","12"].map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select className="input-base md:w-44" value={track} onChange={e => setTrack(e.target.value)}>
          <option value="all">All tracks</option>
          <option>Minerva</option><option>Pangea</option><option>Unassigned</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Empty title="No scholars found" hint="Try a different search or sync from Airtable." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => {
            const accepted = projects.filter(p => p.scholarId === s.id && p.status === "accepted").length;
            return (
              <button key={s.id} onClick={() => navigate({ to: "/ideation" as any, search: { scholarId: s.id } as any })}
                className="card-elev card-elev-hover p-5 text-left anim-fade-up" style={{ borderRadius: 4 }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={initialsOf(s.name)} color="var(--navy)" />
                    <div>
                      <div className="font-serif text-xl text-ink leading-tight">{s.name}</div>
                      <div className="text-xs text-ink-muted">Grade {s.grade} · {s.school.split(",")[0]}</div>
                    </div>
                  </div>
                  <TrackBadge track={s.track} />
                </div>
                <div className="text-xs text-ink-muted uppercase tracking-[0.14em] mb-1">Intended major</div>
                <div className="text-sm text-ink-soft mb-3">{s.intendedMajor}</div>
                <div className="text-xs text-ink-muted uppercase tracking-[0.14em] mb-1">Targets</div>
                <div className="text-sm text-ink-soft mb-3">{s.collegeTargets.slice(0,3).join(" · ")}</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {s.interests.slice(0,4).map(i => (
                    <span key={i} className="text-[11px] bg-cream border border-[#E4DFD3] px-2 py-0.5" style={{ borderRadius: 2 }}>{i}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#E4DFD3]">
                  <span className="text-xs text-ink-muted">{accepted} accepted project{accepted===1?"":"s"}</span>
                  <span className="text-xs text-teal font-medium">Open ideation →</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <AirtableModal open={airtableOpen} onClose={() => setAirtableOpen(false)} />
    </>
  );
}
