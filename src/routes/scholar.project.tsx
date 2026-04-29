import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Avatar, TrackBadge, Empty } from "@/components/UI";
import { useStore, getMilestones, toggleMilestone, addWorkLog } from "@/lib/store";
import { WorkLogModal, type WorkLogFormValues } from "@/components/WorkLogModal";
import { Check, Plus, Download, NotebookPen } from "lucide-react";
import { exportWorkLogsPdf } from "@/lib/pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/scholar/project")({
  component: () => (<AuthGate allow={["scholar"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const user = useStore(s => s.user);
  const scholar = useStore(s => s.scholars.find(x => x.id === user?.linkedScholarId));
  const project = useStore(s => s.projects.find(p => p.scholarId === user?.linkedScholarId && p.status === "accepted"));
  const mentor = useStore(s => s.mentors.find(m => m.id === project?.assignedMentorId));
  const milestones = useStore(() => scholar ? getMilestones(scholar.id) : []);
  const allLogs = useStore(s => s.workLogs);
  const logs = useMemo(() => allLogs.filter(l => l.projectId === project?.id), [allLogs, project]);

  const [logging, setLogging] = useState(false);

  if (!scholar) return null;
  const done = milestones.filter(m => m.done).length;
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;

  function handleSaveLog(v: WorkLogFormValues) {
    if (!project || !scholar) return;
    addWorkLog({ ...v, scholarId: scholar.id, projectId: project.id });
    toast.success("Log added", { description: "Your timeline has been updated." });
    setLogging(false);
  }

  function handleDownload() {
    if (!project || !scholar) return;
    if (logs.length === 0) { toast.error("No logs to export yet"); return; }
    exportWorkLogsPdf({ scholar, project, mentorName: mentor?.name, logs });
    toast.success("PDF downloaded");
  }

  return (
    <>
      <PageHeader
        eyebrow={`Welcome back, ${scholar.name.split(" ")[0]}`}
        title="My project"
        description={`Grade ${scholar.grade} · ${scholar.school}`}
        actions={project ? (
          <>
            <button className="btn-ghost" onClick={handleDownload}><Download className="w-4 h-4"/> <span className="hidden sm:inline">Download logs PDF</span><span className="sm:hidden">PDF</span></button>
            <button className="btn-teal" onClick={() => setLogging(true)}><Plus className="w-4 h-4"/> Log work</button>
          </>
        ) : null}
      />

      {!project ? <Empty title="Your consultant hasn't assigned a project yet" hint="Hang tight — your ideation session is being prepared." /> : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <div className="card-elev p-6" style={{ borderRadius: 4 }}>
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{project.name}</h2>
                <TrackBadge track={project.track} />
              </div>
              <p className="text-ink-soft mb-4">{project.description}</p>
              <div className="grid grid-cols-3 gap-4 text-[11px] text-ink-muted pb-4 mb-4 border-b border-[#E4DFD3]">
                <div><div className="uppercase tracking-[0.14em]">Timeline</div><div className="text-ink-soft text-sm">{project.timeline}</div></div>
                <div><div className="uppercase tracking-[0.14em]">Feasibility</div><div className="text-ink-soft text-sm">{project.feasibility}</div></div>
                <div><div className="uppercase tracking-[0.14em]">Logs</div><div className="text-ink-soft text-sm">{logs.length} entries</div></div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map(t => <span key={t} className="text-[11px] bg-cream border border-[#E4DFD3] px-2 py-0.5" style={{ borderRadius: 2 }}>{t}</span>)}
              </div>
            </div>

            <div className="card-elev p-6" style={{ borderRadius: 4 }}>
              <h3 className="font-serif text-2xl text-ink mb-4">Learning milestones</h3>
              <ul className="space-y-2">
                {milestones.map(m => (
                  <li key={m.id}>
                    <button onClick={() => toggleMilestone(scholar.id, m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 border text-left transition-colors ${m.done ? "border-teal bg-cream-soft" : "border-[#E4DFD3] hover:bg-cream"}`}
                      style={{ borderRadius: 2 }}>
                      <span className={`w-5 h-5 flex items-center justify-center border ${m.done ? "bg-teal border-teal" : "border-[#E4DFD3]"}`} style={{ borderRadius: 2 }}>
                        {m.done && <Check className="w-3 h-3 text-white"/>}
                      </span>
                      <span className={`text-sm ${m.done ? "line-through text-ink-muted" : "text-ink-soft"}`}>{m.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-elev p-6 text-center" style={{ borderRadius: 4 }}>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-2">Project progress</div>
              <ProgressRing pct={pct} />
              <div className="text-sm text-ink-soft mt-3">{done} of {milestones.length} milestones complete</div>
            </div>

            <div className="card-elev p-5" style={{ borderRadius: 4 }}>
              <div className="flex items-center gap-2 mb-2">
                <NotebookPen className="w-4 h-4 text-teal"/>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Daily logging</div>
              </div>
              <p className="text-xs text-ink-soft mb-3">Log your daily work. Entries appear in your research journal and are visible to your mentor.</p>
              <div className="flex flex-col gap-2">
                <button className="btn-teal w-full justify-center" onClick={() => setLogging(true)}><Plus className="w-4 h-4"/> Log today</button>
                <button className="btn-ghost w-full justify-center" onClick={handleDownload}><Download className="w-4 h-4"/> Download all logs (PDF)</button>
              </div>
            </div>

            {mentor ? (
              <div className="card-elev p-6" style={{ borderRadius: 4 }}>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-3">Your mentor</div>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar initials={mentor.initials} color="var(--violet)" />
                  <div>
                    <div className="font-serif text-lg text-ink leading-tight">{mentor.name}</div>
                    <div className="text-xs text-ink-muted">{mentor.designation}</div>
                  </div>
                </div>
                <div className="text-xs text-ink-soft">{mentor.organization}</div>
                <div className="text-xs text-ink-muted mt-2">Available: {mentor.availabilityDays.join(", ")} · {mentor.mode}</div>
              </div>
            ) : (
              <div className="card-elev p-6 text-center" style={{ borderRadius: 4 }}>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-2">Mentor</div>
                <p className="text-sm text-ink-soft">Mentor allocation in progress.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <WorkLogModal open={logging} onClose={() => setLogging(false)} onSave={handleSaveLog} mode="add" />
    </>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 50, c = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r={r} stroke="#F2EFE8" strokeWidth="10" fill="none" />
      <circle cx="60" cy="60" r={r} stroke="var(--teal)" strokeWidth="10" fill="none"
        strokeDasharray={c} strokeDashoffset={c - (pct/100)*c} strokeLinecap="round"
        transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
      <text x="60" y="68" textAnchor="middle" className="font-serif" fontSize="28" fill="var(--ink)">{pct}%</text>
    </svg>
  );
}
