import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, TrackBadge, Avatar, Empty, Badge } from "@/components/UI";
import { useStore, sendMentorRequest } from "@/lib/store";
import { Modal } from "@/components/Modal";
import type { Mentor, Project } from "@/lib/types";
import { Search, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mentors")({
  validateSearch: (s: Record<string, unknown>) => ({ projectId: (s.projectId as string) || "" }),
  component: () => (<AuthGate allow={["consultant","admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const { projectId } = Route.useSearch();
  const mentors = useStore(s => s.mentors);
  const projects = useStore(s => s.projects);
  const project = projectId ? projects.find(p => p.id === projectId) : null;
  const [q, setQ] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [profile, setProfile] = useState<Mentor | null>(null);
  const [sendTo, setSendTo] = useState<Mentor | null>(null);

  const filtered = useMemo(() => mentors.filter(m => {
    const matchQ = !q || [m.name, ...m.domains, ...m.subExpertise].join(" ").toLowerCase().includes(q.toLowerCase());
    const matchT = trackFilter === "all" || m.track === trackFilter || m.track === "Both";
    const matchS = statusFilter === "all" || m.status === statusFilter;
    return matchQ && matchT && matchS;
  }), [mentors, q, trackFilter, statusFilter]);

  return (
    <>
      <PageHeader eyebrow="Consultant workspace" title="Mentor repository" description="Search and allocate mentors for accepted projects." />

      {project && (
        <div className="bg-cream border border-[#E4DFD3] p-4 mb-6 flex items-center justify-between" style={{ borderRadius: 4 }}>
          <div className="text-sm">
            <span className="text-ink-muted">Project pending allocation:</span>{" "}
            <strong className="text-ink">{project.name}</strong> — Select a mentor below to send the request.
          </div>
        </div>
      )}

      <div className="card-elev p-4 mb-6 flex flex-col md:flex-row gap-3" style={{ borderRadius: 4 }}>
        <div className="flex-1 flex items-center gap-2 border border-[#E4DFD3] bg-white px-3" style={{ borderRadius: 2 }}>
          <Search className="w-4 h-4 text-ink-muted" />
          <input className="flex-1 py-2.5 outline-none text-sm bg-transparent" placeholder="Search by name, domain, expertise…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="input-base md:w-44" value={trackFilter} onChange={e => setTrackFilter(e.target.value)}>
          <option value="all">All tracks</option><option>Minerva</option><option>Pangea</option><option>Both</option>
        </select>
        <select className="input-base md:w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option><option value="active">Active</option><option value="on leave">On leave</option><option value="inactive">Inactive</option>
        </select>
      </div>

      {filtered.length === 0 ? <Empty title="No mentors match" /> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(m => (
            <div key={m.id} className="card-elev p-5 anim-fade-up" style={{ borderRadius: 4 }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={m.initials} color="var(--violet)" />
                  <div>
                    <div className="font-serif text-lg leading-tight text-ink">{m.name}</div>
                    <div className="text-xs text-ink-muted">{m.designation}</div>
                    <div className="text-xs text-ink-muted">{m.organization}</div>
                  </div>
                </div>
                <Badge className={m.status === "active" ? "badge-status-accepted" : m.status === "on leave" ? "badge-status-pending" : "badge-status-expired"}>{m.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {m.domains.map(d => <span key={d} className="text-[11px] bg-cream border border-[#E4DFD3] px-2 py-0.5" style={{ borderRadius: 2 }}>{d}</span>)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-ink-muted mb-4">
                <div><div className="uppercase tracking-[0.14em]">Days</div><div className="text-ink-soft">{m.availabilityDays.join(", ")}</div></div>
                <div><div className="uppercase tracking-[0.14em]">Capacity</div><div className="text-ink-soft">Max {m.maxConcurrentScholars}</div></div>
                <div><div className="uppercase tracking-[0.14em]">Mode</div><div className="text-ink-soft">{m.mode}</div></div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-[#E4DFD3]">
                <button className="btn-ghost flex-1" onClick={() => setProfile(m)}>View profile</button>
                {project && <button className="btn-teal flex-1" onClick={() => setSendTo(m)}><Send className="w-4 h-4"/> Send request</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!profile} onClose={() => setProfile(null)} title={profile?.name ?? ""} subtitle={`${profile?.designation} · ${profile?.organization}`}>
        {profile && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={profile.initials} size={56} color="var(--violet)" />
              <div>
                <TrackBadge track={profile.track === "Both" ? "Minerva" : profile.track} />
                <span className="ml-2 text-xs text-ink-muted">Available: {profile.availabilityDays.join(", ")} · {profile.mode}</span>
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-1">Bio</div>
            <p className="text-sm text-ink-soft mb-4">{profile.bio}</p>
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-1">Domain expertise</div>
            <div className="flex flex-wrap gap-1.5 mb-4">{profile.domains.map(d => <span key={d} className="text-xs bg-cream border border-[#E4DFD3] px-2 py-1" style={{ borderRadius: 2 }}>{d}</span>)}</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-1">Sub-expertise</div>
            <div className="flex flex-wrap gap-1.5">{profile.subExpertise.map(d => <span key={d} className="text-xs bg-cream border border-[#E4DFD3] px-2 py-1" style={{ borderRadius: 2 }}>{d}</span>)}</div>
          </div>
        )}
      </Modal>

      <SendRequestModal mentor={sendTo} project={project} onClose={() => setSendTo(null)} />
    </>
  );
}

function SendRequestModal({ mentor, project, onClose }: { mentor: Mentor | null; project: Project | null | undefined; onClose: () => void }) {
  if (!mentor) return null;
  function send() {
    if (!project) { toast.error("No project selected"); return; }
    sendMentorRequest(project.id, mentor!.id);
    toast.success(`Request sent to ${mentor!.name}`, { description: "Expires in 48 hours unless accepted." });
    onClose();
  }
  return (
    <Modal open={!!mentor} onClose={onClose} title="Send mentor request" subtitle={`To: ${mentor.name}`}>
      <div className="space-y-3 text-sm text-ink-soft">
        <p>Project: <strong className="text-ink">{project?.name ?? "—"}</strong></p>
        <p>Scholar: <strong className="text-ink">{project?.scholarName ?? "—"}</strong></p>
        <div className="bg-cream p-3 text-xs" style={{ borderRadius: 2 }}>
          The request will expire in 48 hours. If accepted, all other pending requests for this project are automatically withdrawn.
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-teal" onClick={send}><Send className="w-4 h-4"/> Send request</button>
        </div>
      </div>
    </Modal>
  );
}
