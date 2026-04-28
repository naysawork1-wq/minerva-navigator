import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Empty } from "@/components/UI";
import { useStore } from "@/lib/store";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";
import { ClipboardList, FileText, BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/active")({
  component: () => (<AuthGate allow={["mentor"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const user = useStore(s => s.user);
  const projects = useStore(s => s.projects.filter(p => p.assignedMentorId === user?.linkedMentorId && p.status === "accepted"));
  const [logging, setLogging] = useState<string | null>(null);
  const [brief, setBrief] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");

  return (
    <>
      <PageHeader eyebrow="Mentor workspace" title="Active projects" description="Scholars currently under your mentorship." />
      {projects.length === 0 ? <Empty title="No active projects yet" hint="Accept a request from your inbox to start mentoring." /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card-elev p-5 anim-fade-up" style={{ borderRadius: 4 }}>
              <h3 className="font-serif text-xl text-ink mb-1">{p.name}</h3>
              <div className="text-xs text-ink-muted mb-3">Scholar: <strong className="text-ink-soft">{p.scholarName}</strong> · Accepted {p.acceptedAt ? timeAgo(p.acceptedAt) : ""}</div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.techStack.slice(0,5).map(t => <span key={t} className="text-[10px] bg-cream border border-[#E4DFD3] px-2 py-0.5" style={{ borderRadius: 2 }}>{t}</span>)}
              </div>
              <div className="flex gap-2 pt-3 border-t border-[#E4DFD3]">
                <button className="btn-teal" onClick={() => { setLogging(p.id); setDate(""); setSummary(""); }}><ClipboardList className="w-4 h-4"/> Log session</button>
                <button className="btn-ghost" onClick={() => setBrief(p.id)}><FileText className="w-4 h-4"/> View brief</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!logging} onClose={() => setLogging(null)} title="Log session" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Session date</label>
            <input type="date" className="input-base" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Summary</label>
            <textarea className="input-base" rows={4} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Topics covered, blockers, next steps…" />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setLogging(null)}>Cancel</button>
            <button className="btn-primary" onClick={() => { toast.success("Session logged"); setLogging(null); }}>Save log</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!brief} onClose={() => setBrief(null)} title="Project brief">
        {(() => {
          const p = projects.find(x => x.id === brief);
          if (!p) return null;
          return (
            <div className="space-y-3 text-sm">
              <div className="font-serif text-2xl text-ink">{p.name}</div>
              <p className="text-ink-soft">{p.description}</p>
              <div><strong>Scholar:</strong> {p.scholarName}</div>
              <div><strong>Track:</strong> {p.track}</div>
              <div><strong>Topic:</strong> {p.topic}</div>
              <div><strong>Tech stack:</strong> {p.techStack.join(", ")}</div>
              <div><strong>Impact:</strong> {p.impact}</div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}
