import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Empty, TrackBadge, StatCard } from "@/components/UI";
import { useStore, projectProgressFromLogs } from "@/lib/store";
import { WorkLogTimeline } from "@/components/WorkLogTimeline";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/projects/$projectId/progress")({
  component: () => (<AuthGate allow={["consultant","admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const { projectId } = Route.useParams();
  const project = useStore(s => s.projects.find(p => p.id === projectId));
  const mentor = useStore(s => s.mentors.find(m => m.id === project?.assignedMentorId));
  const allLogs = useStore(s => s.workLogs);
  const allComments = useStore(s => s.workLogComments);
  const logs = useMemo(() => allLogs.filter(l => l.projectId === projectId), [allLogs, projectId]);
  const comments = useMemo(() => allComments.filter(c => logs.some(l => l.id === c.logId)), [allComments, logs]);

  if (!project) return <Empty title="Project not found" />;

  const totalEntries = logs.length;
  const totalHours = logs.reduce((s, l) => s + l.hoursSpent, 0);
  const lastActivity = logs.length ? Math.max(...logs.map(l => l.createdAt)) : 0;

  // avg hours/week from earliest log to today
  let avgPerWeek = 0;
  if (logs.length) {
    const earliest = Math.min(...logs.map(l => new Date(l.date + "T00:00:00").getTime()));
    const weeks = Math.max(1, (Date.now() - earliest) / (1000 * 60 * 60 * 24 * 7));
    avgPerWeek = totalHours / weeks;
  }

  const pct = projectProgressFromLogs(project.id);

  return (
    <>
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-3"><ArrowLeft className="w-3.5 h-3.5"/> Back to projects</Link>
      <PageHeader
        eyebrow="Scholar progress"
        title={project.name}
        description={`${project.scholarName}${mentor ? ` · Mentored by ${mentor.name}` : ""}`}
        actions={<TrackBadge track={project.track}/>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Progress" value={`${pct}%`} accent="teal" />
        <StatCard label="Entries" value={totalEntries} />
        <StatCard label="Avg / week" value={`${avgPerWeek.toFixed(1)}h`} />
        <StatCard label="Last activity" value={lastActivity ? relTime(lastActivity) : "—"} />
      </div>

      <h3 className="font-serif text-2xl text-ink mb-4">Timeline</h3>
      <WorkLogTimeline
        logs={logs}
        comments={comments}
        mode="consultant"
        emptyTitle="Scholar hasn't logged work yet"
        emptyHint="Once they post entries you'll see the full research timeline here."
      />
    </>
  );
}

function relTime(ts: number) {
  const diff = Date.now() - ts;
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d/7)}w ago`;
  return `${Math.floor(d/30)}mo ago`;
}
