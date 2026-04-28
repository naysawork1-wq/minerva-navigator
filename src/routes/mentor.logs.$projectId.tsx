import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Empty, TrackBadge } from "@/components/UI";
import { useStore, addWorkLogComment, projectProgressFromLogs } from "@/lib/store";
import { WorkLogTimeline } from "@/components/WorkLogTimeline";
import { Modal } from "@/components/Modal";
import type { WorkLog } from "@/lib/types";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mentor/logs/$projectId")({
  component: () => (<AuthGate allow={["mentor"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const { projectId } = Route.useParams();
  const user = useStore(s => s.user);
  const project = useStore(s => s.projects.find(p => p.id === projectId));
  const allLogs = useStore(s => s.workLogs);
  const allComments = useStore(s => s.workLogComments);
  const logs = useMemo(() => allLogs.filter(l => l.projectId === projectId), [allLogs, projectId]);
  const comments = useMemo(() => allComments.filter(c => logs.some(l => l.id === c.logId)), [allComments, logs]);

  const [commenting, setCommenting] = useState<WorkLog | null>(null);
  const [text, setText] = useState("");

  if (!project) return <Empty title="Project not found" />;

  function submit() {
    if (!commenting || !text.trim() || !user) return;
    addWorkLogComment({
      logId: commenting.id, userId: user.id, userName: user.name, role: "mentor", comment: text.trim(),
    });
    toast.success("Comment added");
    setText(""); setCommenting(null);
  }

  const pct = projectProgressFromLogs(project.id);

  return (
    <>
      <Link to="/mentor/active" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-3"><ArrowLeft className="w-3.5 h-3.5"/> Back to active projects</Link>
      <PageHeader eyebrow="Mentor workspace" title={project.name} description={`Scholar: ${project.scholarName} · Progress ${pct}%`} actions={<TrackBadge track={project.track}/>} />

      <WorkLogTimeline
        logs={logs}
        comments={comments}
        mode="mentor"
        onComment={setCommenting}
        emptyTitle="No logs yet"
        emptyHint="Waiting for scholar updates — you'll be able to comment as soon as they post."
      />

      <Modal open={!!commenting} onClose={() => { setCommenting(null); setText(""); }} title="Add comment" subtitle={commenting?.title} maxWidth="max-w-lg">
        <div className="space-y-3">
          <textarea autoFocus className="input-base" rows={4} placeholder="Share feedback, ask a question, or suggest a next step…" value={text} onChange={e => setText(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => { setCommenting(null); setText(""); }}>Cancel</button>
            <button className="btn-teal" onClick={submit}><Send className="w-4 h-4"/> Post comment</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
