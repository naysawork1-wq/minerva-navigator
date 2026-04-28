import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, TrackBadge, Avatar, Empty, Badge, Tag } from "@/components/UI";
import { useStore, sendMentorRequest } from "@/lib/store";
import { Modal } from "@/components/Modal";
import type { Mentor, Project } from "@/lib/types";
import { Search, Send, Sparkles, MapPin, Calendar, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mentors")({
  validateSearch: (s: Record<string, unknown>) => ({ projectId: (s.projectId as string) || "" }),
  component: () => (<AuthGate allow={["consultant","admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

const MODES = ["Online", "In-person", "Hybrid"] as const;

// Derived helpers — mock but stable per mentor id
function activeLoad(mentorId: string, requests: any[], projects: any[]) {
  const accepted = projects.filter(p => p.assignedMentorId === mentorId && p.status === "accepted").length;
  const pending = requests.filter(r => r.mentorId === mentorId && r.status === "pending").length;
  return accepted + pending;
}
function availability(load: number, max: number): { label: string; tone: "green"|"yellow"|"red" } {
  if (load >= max) return { label: "Full", tone: "red" };
  if (load >= Math.max(1, max - 1)) return { label: "Limited", tone: "yellow" };
  return { label: "Available", tone: "green" };
}
function acceptRate(id: string) {
  // deterministic pseudo value
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 70 + (n % 26);
}
function pastProjectsFor(id: string) {
  const lib = [
    "Wearable EMG glove for stroke rehab — ISEF Finalist",
    "Rural air-quality IoT mesh — Regional Sci-Fair",
    "ML triage tool for tier-2 clinics — IEEE student paper",
    "Drone-based crop disease scout — Hackathon winner",
    "Maternal health survey & policy brief — Yale YGA",
    "Soft exo-glove for elderly grip support — patent filed",
  ];
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return [lib[n % lib.length], lib[(n + 2) % lib.length], lib[(n + 4) % lib.length]];
}
function bestMatchFor(m: Mentor, project: Project | null | undefined): boolean {
  if (!project) return false;
  if (m.track !== "Both" && m.track !== project.track) return false;
  const tokens = [project.topic, ...(project.techStack || [])].join(" ").toLowerCase();
  return [...m.domains, ...m.subExpertise].some(d => tokens.includes(d.toLowerCase().split(" ")[0]));
}

function Page() {
  const { projectId } = Route.useSearch();
  const mentors = useStore(s => s.mentors);
  const projects = useStore(s => s.projects);
  const requests = useStore(s => s.requests);
  const project = projectId ? projects.find(p => p.id === projectId) : null;

  const [q, setQ] = useState("");
  const [trackFilter, setTrackFilter] = useState<"all"|"Minerva"|"Pangea">("all");
  const [availFilter, setAvailFilter] = useState<"all"|"Available"|"Limited"|"Full">("all");
  const [modeFilter, setModeFilter] = useState<"all"|typeof MODES[number]>("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [profile, setProfile] = useState<Mentor | null>(null);
  const [sendTo, setSendTo] = useState<Mentor | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach(m => m.domains.forEach(d => set.add(d)));
    return Array.from(set).slice(0, 14);
  }, [mentors]);

  const enriched = useMemo(() => mentors.map(m => {
    const load = activeLoad(m.id, requests, projects);
    return { mentor: m, load, avail: availability(load, m.maxConcurrentScholars) };
  }), [mentors, requests, projects]);

  const filtered = useMemo(() => enriched.filter(({ mentor: m, avail }) => {
    const matchQ = !q || [m.name, ...m.domains, ...m.subExpertise].join(" ").toLowerCase().includes(q.toLowerCase());
    const matchT = trackFilter === "all" || m.track === trackFilter || m.track === "Both";
    const matchA = availFilter === "all" || avail.label === availFilter;
    const matchM = modeFilter === "all" || m.mode === modeFilter;
    const matchTags = tagFilter.length === 0 || tagFilter.every(t => m.domains.includes(t));
    return matchQ && matchT && matchA && matchM && matchTags;
  }), [enriched, q, trackFilter, availFilter, modeFilter, tagFilter]);

  // sort: best match first if project, then available
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const ba = bestMatchFor(a.mentor, project) ? 1 : 0;
    const bb = bestMatchFor(b.mentor, project) ? 1 : 0;
    if (ba !== bb) return bb - ba;
    const order = { Available: 0, Limited: 1, Full: 2 } as const;
    return order[a.avail.label] - order[b.avail.label];
  }), [filtered, project]);

  return (
    <>
      <PageHeader eyebrow="Consultant workspace" title="Mentor gallery" description="A curated network of researchers, faculty and industry experts." />

      {project && (
        <div className="bg-navy text-white p-4 mb-6 flex items-center justify-between anim-fade-up" style={{ borderRadius: 4 }}>
          <div className="text-sm">
            <span className="text-white/60 uppercase tracking-[0.18em] text-[10px]">Project</span>{" "}
            <strong className="font-serif text-base ml-2">{project.name}</strong>
            <span className="text-white/60 ml-3">— Select a mentor to send request</span>
          </div>
          <Badge className="bg-teal text-white">Scholar: {project.scholarName}</Badge>
        </div>
      )}

      {/* Filter bar */}
      <div className="card-elev p-4 mb-4 space-y-3" style={{ borderRadius: 4 }}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 border border-[#E4DFD3] bg-white px-3" style={{ borderRadius: 2 }}>
            <Search className="w-4 h-4 text-ink-muted" />
            <input className="flex-1 py-2.5 outline-none text-sm bg-transparent" placeholder="Search by name, domain, expertise…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select className="input-base md:w-40" value={trackFilter} onChange={e => setTrackFilter(e.target.value as any)}>
            <option value="all">All tracks</option><option>Minerva</option><option>Pangea</option>
          </select>
          <select className="input-base md:w-40" value={availFilter} onChange={e => setAvailFilter(e.target.value as any)}>
            <option value="all">Any availability</option><option>Available</option><option>Limited</option><option>Full</option>
          </select>
          <select className="input-base md:w-40" value={modeFilter} onChange={e => setModeFilter(e.target.value as any)}>
            <option value="all">Any mode</option>{MODES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted self-center mr-1">Expertise</span>
          {allTags.map(t => (
            <Tag key={t} active={tagFilter.includes(t)} onClick={() => setTagFilter(f => f.includes(t) ? f.filter(x => x !== t) : [...f, t])}>{t}</Tag>
          ))}
          {tagFilter.length > 0 && <button className="text-[11px] text-ink-muted underline ml-1" onClick={() => setTagFilter([])}>clear</button>}
        </div>
      </div>

      <div className="text-xs text-ink-muted mb-4">{sorted.length} mentor{sorted.length === 1 ? "" : "s"} shown</div>

      {sorted.length === 0 ? <Empty title="No mentors match your filters" hint="Try removing a tag or widening availability." /> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(({ mentor: m, load, avail }) => {
            const best = bestMatchFor(m, project);
            return (
              <div key={m.id} className="group card-elev p-5 anim-fade-up transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(10,22,40,0.18)] relative" style={{ borderRadius: 4 }}>
                {best && (
                  <div className="absolute -top-2 left-4 bg-teal text-white text-[10px] uppercase tracking-[0.18em] px-2 py-1 flex items-center gap-1" style={{ borderRadius: 2 }}>
                    <Sparkles className="w-3 h-3"/> Best match
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={m.initials} size={48} color="var(--violet)" />
                    <div>
                      <div className="font-serif text-lg leading-tight text-ink">{m.name}</div>
                      <div className="text-xs text-ink-muted">{m.designation}</div>
                      <div className="text-[11px] text-ink-muted">{m.organization}</div>
                    </div>
                  </div>
                  <AvailabilityPill tone={avail.tone} label={avail.label} />
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {m.domains.slice(0, 4).map(d => <DomainPill key={d}>{d}</DomainPill>)}
                </div>

                <p className="text-xs text-ink-soft line-clamp-1 mb-3 italic">{m.subExpertise.slice(0,3).join(" · ")}</p>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-ink-muted py-3 border-t border-b border-[#E4DFD3] mb-3">
                  <div className="flex items-center gap-1.5"><UsersIcon className="w-3.5 h-3.5"/> {load} / {m.maxConcurrentScholars}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> {m.mode}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {m.availabilityDays.length}d/wk</div>
                </div>

                <div className="flex gap-2">
                  <button className="btn-ghost flex-1" onClick={() => setProfile(m)}>View profile</button>
                  {project && <button className="btn-teal flex-1 disabled:opacity-50" disabled={avail.tone === "red"} onClick={() => setSendTo(m)}><Send className="w-4 h-4"/> Send request</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProfileModal mentor={profile} onClose={() => setProfile(null)} onSend={() => { setSendTo(profile); setProfile(null); }} hasProject={!!project} />
      <SendRequestModal mentor={sendTo} project={project} onClose={() => setSendTo(null)} />
    </>
  );
}

function AvailabilityPill({ tone, label }: { tone: "green"|"yellow"|"red"; label: string }) {
  const cls = tone === "green" ? "bg-[#E5F5EE] text-[#0DA882] border border-[#B6E5D2]"
    : tone === "yellow" ? "bg-[#FFF6E0] text-[#A37200] border border-[#F2DFA5]"
    : "bg-[#FBE6E6] text-[#B23838] border border-[#F0BFBF]";
  return <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] font-medium px-2 py-1 ${cls}`} style={{ borderRadius: 2 }}>
    <span className={`w-1.5 h-1.5 rounded-full ${tone === "green" ? "bg-[#0DA882]" : tone === "yellow" ? "bg-[#D49A00]" : "bg-[#B23838]"}`}/>
    {label}
  </span>;
}
function DomainPill({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] bg-cream border border-[#E4DFD3] text-ink-soft px-2 py-0.5" style={{ borderRadius: 2 }}>{children}</span>;
}

function ProfileModal({ mentor, onClose, onSend, hasProject }: { mentor: Mentor | null; onClose: () => void; onSend: () => void; hasProject: boolean }) {
  if (!mentor) return null;
  const past = pastProjectsFor(mentor.id);
  const rate = acceptRate(mentor.id);
  return (
    <Modal open={!!mentor} onClose={onClose} title={mentor.name} subtitle={`${mentor.designation} · ${mentor.organization}`} maxWidth="max-w-2xl">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar initials={mentor.initials} size={64} color="var(--violet)" />
            <div>
              <TrackBadge track={mentor.track === "Both" ? "Minerva" : mentor.track} />
              <div className="text-xs text-ink-muted mt-1.5">{mentor.mode} · Available {mentor.availabilityDays.join(", ")}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">Accept rate</div>
            <div className="font-serif text-3xl text-teal leading-none">{rate}%</div>
          </div>
        </div>

        <Section label="Bio"><p className="text-sm text-ink-soft">{mentor.bio}</p></Section>

        <Section label="Domain expertise">
          <div className="flex flex-wrap gap-1.5">{mentor.domains.map(d => <DomainPill key={d}>{d}</DomainPill>)}</div>
        </Section>

        <Section label="Sub-expertise">
          <div className="flex flex-wrap gap-1.5">{mentor.subExpertise.map(d => <DomainPill key={d}>{d}</DomainPill>)}</div>
        </Section>

        <Section label="Past mentored projects">
          <ul className="space-y-1.5 text-sm text-ink-soft">
            {past.map((p, i) => <li key={i} className="flex gap-2"><span className="text-teal">·</span>{p}</li>)}
          </ul>
        </Section>

        <Section label="Capacity">
          <div className="text-sm text-ink-soft">Max {mentor.maxConcurrentScholars} concurrent scholars</div>
        </Section>

        {hasProject && (
          <div className="flex justify-end gap-2 pt-4 border-t border-[#E4DFD3]">
            <button className="btn-ghost" onClick={onClose}>Close</button>
            <button className="btn-teal" onClick={onSend}><Send className="w-4 h-4"/> Send request</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-1.5">{label}</div>
      {children}
    </div>
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
    <Modal open={!!mentor} onClose={onClose} title="Confirm mentor request" subtitle={`To: ${mentor.name}`}>
      <div className="space-y-3 text-sm text-ink-soft">
        <div className="grid grid-cols-3 gap-3 bg-cream-soft p-3 border border-[#E4DFD3]" style={{ borderRadius: 2 }}>
          <Info label="Project" value={project?.name ?? "—"} />
          <Info label="Scholar" value={project?.scholarName ?? "—"} />
          <Info label="Mentor" value={mentor.name} />
        </div>
        <div className="bg-cream p-3 text-xs text-ink-muted" style={{ borderRadius: 2 }}>
          The request expires in 48 hours. If accepted, all other pending requests for this project will be automatically withdrawn.
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-teal" onClick={send}><Send className="w-4 h-4"/> Confirm request</button>
        </div>
      </div>
    </Modal>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">{label}</div>
      <div className="text-sm text-ink mt-0.5 font-medium">{value}</div>
    </div>
  );
}
