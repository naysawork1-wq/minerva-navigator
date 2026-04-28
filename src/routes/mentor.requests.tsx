import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Empty, Badge } from "@/components/UI";
import { useStore, acceptRequest, rejectRequest } from "@/lib/store";
import { Modal } from "@/components/Modal";
import { timeAgo, timeUntil } from "@/lib/utils";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";
import type { MentorRequest } from "@/lib/types";

export const Route = createFileRoute("/mentor/requests")({
  component: () => (<AuthGate allow={["mentor"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const user = useStore(s => s.user);
  const requests = useStore(s => s.requests.filter(r => r.mentorId === user?.linkedMentorId));
  const projects = useStore(s => s.projects);
  const [rejecting, setRejecting] = useState<MentorRequest | null>(null);
  const [details, setDetails] = useState<MentorRequest | null>(null);
  const [reason, setReason] = useState("");

  const pending = requests.filter(r => r.status === "pending");

  return (
    <>
      <PageHeader eyebrow="Mentor workspace" title="Incoming requests" description="Review pending allocation requests from consultants." />
      {pending.length === 0 ? <Empty title="No pending requests" hint="Past requests below." /> : null}

      <div className="grid md:grid-cols-2 gap-4">
        {requests.map(r => {
          const status = r.status;
          const cls = status === "pending" ? "badge-status-pending" : status === "accepted" ? "badge-status-accepted" : status === "rejected" ? "badge-status-rejected" : status === "withdrawn" ? "badge-status-withdrawn" : "badge-status-expired";
          return (
            <div key={r.id} className="card-elev p-5 anim-fade-up" style={{ borderRadius: 4 }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-serif text-xl text-ink leading-tight">{r.projectName}</h3>
                  <div className="text-xs text-ink-muted mt-1">Scholar: <strong className="text-ink-soft">{r.scholarName}</strong></div>
                </div>
                <Badge className={cls}>{status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px] text-ink-muted mb-3">
                <div><div className="uppercase tracking-[0.14em]">Sent</div><div className="text-ink-soft">{timeAgo(r.sentDate)}</div></div>
                <div><div className="uppercase tracking-[0.14em]">Expires</div><div className="text-ink-soft">{timeUntil(r.expiryDate)}</div></div>
              </div>
              {status === "pending" && (
                <>
                  <div className="bg-cream text-xs text-ink-soft p-3 mb-3" style={{ borderRadius: 2 }}>
                    If you accept, this request is immediately removed from all other mentors' lists. If you reject, the consultant is notified to find another mentor.
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="btn-teal" onClick={() => { acceptRequest(r.id, user!.name); toast.success("Project accepted"); }}><Check className="w-4 h-4"/> Accept project</button>
                    <button className="btn-ghost" onClick={() => { setRejecting(r); setReason(""); }}><X className="w-4 h-4"/> Reject</button>
                    <button className="btn-ghost" onClick={() => setDetails(r)}><Eye className="w-4 h-4"/> View details</button>
                  </div>
                </>
              )}
              {status === "rejected" && r.rejectionReason && <div className="text-xs text-ink-muted">Reason: {r.rejectionReason}</div>}
            </div>
          );
        })}
      </div>

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject request" subtitle={rejecting?.projectName}>
        <div className="space-y-4">
          <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft">Reason (optional)</label>
          <textarea className="input-base" rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="Capacity, scope mismatch, schedule conflict…" />
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setRejecting(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => { rejectRequest(rejecting!.id, reason); toast.success("Request rejected"); setRejecting(null); }}>Confirm reject</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!details} onClose={() => setDetails(null)} title={details?.projectName ?? ""} subtitle={`Scholar: ${details?.scholarName}`}>
        {details && (() => {
          const p = projects.find(x => x.id === details.projectId);
          if (!p) return <p className="text-sm text-ink-muted">Project details unavailable.</p>;
          return (
            <div className="space-y-3 text-sm">
              <div><span className="text-ink-muted">Topic:</span> {p.topic}</div>
              <div><span className="text-ink-muted">Track:</span> {p.track}</div>
              <div><span className="text-ink-muted">Description:</span> {p.description}</div>
              <div><span className="text-ink-muted">Tech stack:</span> {p.techStack.join(", ")}</div>
              <div><span className="text-ink-muted">Timeline:</span> {p.timeline}</div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}
