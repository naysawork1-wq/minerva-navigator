import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Avatar, TrackBadge, Empty } from "@/components/UI";
import { useStore, addWorkLog, updateWorkLog, deleteWorkLog, projectProgressFromLogs } from "@/lib/store";
import { WorkLogTimeline } from "@/components/WorkLogTimeline";
import { WorkLogModal, type WorkLogFormValues } from "@/components/WorkLogModal";
import { Modal } from "@/components/Modal";
import type { WorkLog } from "@/lib/types";
import { Plus, Clock, ListChecks, Download } from "lucide-react";
import { exportWorkLogsPdf } from "@/lib/pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/scholar/work")({
  component: () => (<AuthGate allow={["scholar"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const user = useStore(s => s.user);
  const scholar = useStore(s => s.scholars.find(x => x.id === user?.linkedScholarId));
  const project = useStore(s => s.projects.find(p => p.scholarId === user?.linkedScholarId && p.status === "accepted"));
  const mentor = useStore(s => s.mentors.find(m => m.id === project?.assignedMentorId));
  const allLogs = useStore(s => s.workLogs);
  const allComments = useStore(s => s.workLogComments);

  const logs = useMemo(() => allLogs.filter(l => l.projectId === project?.id), [allLogs, project]);
  const comments = useMemo(() => allComments.filter(c => logs.some(l => l.id === c.logId)), [allComments, logs]);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<WorkLog | null>(null);
  const [deleting, setDeleting] = useState<WorkLog | null>(null);

  if (!scholar) return null;
  if (!project) {
    return (
      <>
        <PageHeader eyebrow="Scholar workspace" title="My work" />
        <Empty title="No active project yet" hint="Your work log unlocks once your consultant assigns a project." />
      </>
    );
  }

  const pct = projectProgressFromLogs(project.id);
  const totalHours = logs.reduce((s, l) => s + l.hoursSpent, 0);

  function handleSave(v: WorkLogFormValues) {
    if (editing) {
      updateWorkLog(editing.id, v);
      toast.success("Log updated");
      setEditing(null);
    } else {
      if (!project) return;
      addWorkLog({ ...v, scholarId: scholar!.id, projectId: project.id });
      toast.success("Log added", { description: "Your timeline has been updated." });
      setAdding(false);
    }
  }
  function handleDelete() {
    if (!deleting) return;
    deleteWorkLog(deleting.id);
    toast.success("Log deleted");
    setDeleting(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Research journal"
        title="My work"
        description="A daily record of your build, research and writing — visible to your mentor and consultant."
        actions={<>
          <button className="btn-ghost" onClick={() => {
            if (logs.length === 0) { toast.error("No logs to export yet"); return; }
            exportWorkLogsPdf({ scholar: scholar!, project: project!, mentorName: mentor?.name, logs });
            toast.success("PDF downloaded");
          }}><Download className="w-4 h-4"/> <span className="hidden sm:inline">Download PDF</span></button>
          <button className="btn-teal" onClick={() => setAdding(true)}><Plus className="w-4 h-4"/> Add work log</button>
        </>}
      />

      {/* Project summary */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 mb-8">
        <div className="card-elev p-6" style={{ borderRadius: 4 }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-1">Active project</div>
              <h2 className="font-serif text-3xl text-ink leading-tight">{project.name}</h2>
            </div>
            <TrackBadge track={project.track} />
          </div>
          <p className="text-sm text-ink-soft mb-4 line-clamp-2">{project.description}</p>
          <div className="grid grid-cols-3 gap-4 text-[11px] text-ink-muted pt-3 border-t border-[#E4DFD3]">
            <Stat label="Mentor" value={mentor?.name ?? "Pending allocation"} />
            <Stat label="Timeline" value={project.timeline} />
            <Stat label="Total hours" value={`${totalHours}h`} />
          </div>
        </div>
        <div className="card-elev p-6 text-center" style={{ borderRadius: 4 }}>
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-2">Project progress</div>
          <ProgressRing pct={pct} />
          <div className="text-sm text-ink-soft mt-3">{logs.length} of 20 entries</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-serif text-2xl text-ink">Work log</h3>
        <div className="text-xs text-ink-muted flex items-center gap-3">
          <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5"/> {logs.length} entries</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {totalHours}h logged</span>
        </div>
      </div>

      <WorkLogTimeline
        logs={logs}
        comments={comments}
        mode="scholar"
        onEdit={setEditing}
        onDelete={setDeleting}
        emptyTitle="No work logged yet"
        emptyHint="Start by adding your first entry — it takes less than a minute."
      />

      <WorkLogModal open={adding} onClose={() => setAdding(false)} onSave={handleSave} mode="add" />
      <WorkLogModal open={!!editing} onClose={() => setEditing(null)} onSave={handleSave} initial={editing} mode="edit" />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete work log" subtitle="This action cannot be undone." maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">Delete <strong className="text-ink">"{deleting?.title}"</strong>? Comments on this entry will also be removed.</p>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
            <button className="btn-primary" style={{ background: "#B23838" }} onClick={handleDelete}>Delete entry</button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="uppercase tracking-[0.14em]">{label}</div>
      <div className="text-ink-soft text-sm mt-0.5">{value}</div>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 50, c = 2 * Math.PI * r;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r={r} stroke="#F2EFE8" strokeWidth="10" fill="none" />
      <circle cx="60" cy="60" r={r} stroke="var(--teal)" strokeWidth="10" fill="none"
        strokeDasharray={c} strokeDashoffset={c - (pct/100)*c} strokeLinecap="round"
        transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
      <text x="60" y="68" textAnchor="middle" className="font-serif" fontSize="26" fill="var(--ink)">{pct}%</text>
    </svg>
  );
}
