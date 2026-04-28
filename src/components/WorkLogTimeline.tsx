import { useState } from "react";
import type { WorkLog, WorkLogComment, WorkLogTag } from "@/lib/types";
import { Avatar, Badge } from "./UI";
import { Pencil, Trash2, MessageSquarePlus, Paperclip, Clock, Calendar } from "lucide-react";

const TAG_COLORS: Record<WorkLogTag, string> = {
  "Research": "bg-[#EEF1FB] text-[#3247A3] border-[#CFD7EE]",
  "Build": "bg-[#E5F5EE] text-[#0DA882] border-[#B6E5D2]",
  "Testing": "bg-[#FFF6E0] text-[#A37200] border-[#F2DFA5]",
  "Writing": "bg-[#F4ECF7] text-[#6F3D8F] border-[#DEC8E8]",
  "Mentor Session": "bg-[#FBE6E6] text-[#B23838] border-[#F0BFBF]",
};

export function WorkLogTagPill({ tag }: { tag: WorkLogTag }) {
  return <span className={`inline-block text-[10px] uppercase tracking-[0.14em] font-medium px-2 py-0.5 border ${TAG_COLORS[tag]}`} style={{ borderRadius: 2 }}>{tag}</span>;
}

export function StatusPill({ status }: { status: WorkLog["status"] }) {
  const cls = status === "Completed" ? "bg-[#E5F5EE] text-[#0DA882] border-[#B6E5D2]" : "bg-[#FFF6E0] text-[#A37200] border-[#F2DFA5]";
  return <span className={`text-[10px] uppercase tracking-[0.14em] font-medium px-2 py-0.5 border ${cls}`} style={{ borderRadius: 2 }}>{status}</span>;
}

export interface WorkLogTimelineProps {
  logs: WorkLog[];
  comments: WorkLogComment[];
  mode: "scholar" | "mentor" | "consultant";
  onEdit?: (log: WorkLog) => void;
  onDelete?: (log: WorkLog) => void;
  onComment?: (log: WorkLog) => void;
  emptyTitle?: string;
  emptyHint?: string;
}

export function WorkLogTimeline({ logs, comments, mode, onEdit, onDelete, onComment, emptyTitle, emptyHint }: WorkLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-[#E4DFD3] bg-cream-soft" style={{ borderRadius: 4 }}>
        <div className="font-serif text-2xl text-ink-soft">{emptyTitle ?? "No work logged yet"}</div>
        {emptyHint && <div className="text-sm text-ink-muted mt-2">{emptyHint}</div>}
      </div>
    );
  }
  const sorted = [...logs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt));
  return (
    <div className="relative pl-6 md:pl-8">
      <div className="absolute left-2 md:left-3 top-2 bottom-2 w-px bg-[#E4DFD3]" />
      <div className="space-y-5">
        {sorted.map(log => (
          <LogCard
            key={log.id}
            log={log}
            comments={comments.filter(c => c.logId === log.id)}
            mode={mode}
            onEdit={onEdit ? () => onEdit(log) : undefined}
            onDelete={onDelete ? () => onDelete(log) : undefined}
            onComment={onComment ? () => onComment(log) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function LogCard({ log, comments, mode, onEdit, onDelete, onComment }: {
  log: WorkLog; comments: WorkLogComment[]; mode: "scholar"|"mentor"|"consultant";
  onEdit?: () => void; onDelete?: () => void; onComment?: () => void;
}) {
  const [showComments, setShowComments] = useState(true);
  return (
    <div className="relative anim-fade-up">
      <div className="absolute -left-[22px] md:-left-[26px] top-5 w-3 h-3 bg-teal border-4 border-cream-soft" style={{ borderRadius: 999 }} />
      <div className="card-elev p-5" style={{ borderRadius: 4 }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-ink-muted uppercase tracking-[0.16em]">
              <Calendar className="w-3 h-3"/> {formatDate(log.date)}
              <span>·</span>
              <Clock className="w-3 h-3"/> {log.hoursSpent}h
            </div>
            <h4 className="font-serif text-xl text-ink leading-tight mt-1">{log.title}</h4>
          </div>
          <StatusPill status={log.status} />
        </div>

        <p className="text-sm text-ink-soft whitespace-pre-wrap mb-3">{log.description}</p>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {log.tags.map(t => <WorkLogTagPill key={t} tag={t}/>)}
        </div>

        {log.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-3 mb-3 border-b border-[#E4DFD3]">
            {log.attachments.map(a => (
              <span key={a.id} className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft bg-cream border border-[#E4DFD3] px-2 py-1" style={{ borderRadius: 2 }}>
                <Paperclip className="w-3 h-3"/> {a.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E4DFD3]">
          <button className="text-[11px] text-ink-muted hover:text-ink underline-offset-2 hover:underline" onClick={() => setShowComments(s => !s)}>
            {comments.length} comment{comments.length === 1 ? "" : "s"}
          </button>
          <div className="flex gap-1.5">
            {mode === "scholar" && onEdit && <button className="btn-ghost !py-1.5 !px-2.5 text-[11px]" onClick={onEdit}><Pencil className="w-3 h-3"/> Edit</button>}
            {mode === "scholar" && onDelete && <button className="btn-ghost !py-1.5 !px-2.5 text-[11px] text-[#B23838]" onClick={onDelete}><Trash2 className="w-3 h-3"/> Delete</button>}
            {mode === "mentor" && onComment && <button className="btn-ghost !py-1.5 !px-2.5 text-[11px]" onClick={onComment}><MessageSquarePlus className="w-3 h-3"/> Add comment</button>}
          </div>
        </div>

        {showComments && comments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#E4DFD3] space-y-2.5">
            {comments.sort((a,b) => a.timestamp - b.timestamp).map(c => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar initials={initialsOf(c.userName)} size={28} color={c.role === "mentor" ? "var(--violet)" : "var(--teal)"} />
                <div className="flex-1 bg-cream-soft p-2.5 border border-[#E4DFD3]" style={{ borderRadius: 2 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-ink">{c.userName}</span>
                    <Badge className="bg-cream border border-[#E4DFD3] text-ink-muted">{c.role}</Badge>
                    <span className="text-[10px] text-ink-muted ml-auto">{new Date(c.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-ink-soft whitespace-pre-wrap">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function initialsOf(name: string) {
  return name.split(" ").map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}
function formatDate(iso: string) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch { return iso; }
}
