import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Tag } from "./UI";
import { WORK_LOG_TAGS } from "@/lib/mockData";
import type { WorkLog, WorkLogStatus, WorkLogTag, WorkLogAttachment } from "@/lib/types";
import { Paperclip, X } from "lucide-react";

export interface WorkLogFormValues {
  date: string;
  title: string;
  description: string;
  hoursSpent: number;
  tags: WorkLogTag[];
  status: WorkLogStatus;
  attachments: WorkLogAttachment[];
}

const today = () => new Date().toISOString().slice(0, 10);
const empty = (): WorkLogFormValues => ({
  date: today(), title: "", description: "", hoursSpent: 1,
  tags: [], status: "Completed", attachments: [],
});

export function WorkLogModal({ open, onClose, onSave, initial, mode }: {
  open: boolean;
  onClose: () => void;
  onSave: (v: WorkLogFormValues) => void;
  initial?: WorkLog | null;
  mode: "add" | "edit";
}) {
  const [v, setV] = useState<WorkLogFormValues>(empty());

  useEffect(() => {
    if (open) {
      if (initial) {
        setV({
          date: initial.date, title: initial.title, description: initial.description,
          hoursSpent: initial.hoursSpent, tags: initial.tags, status: initial.status,
          attachments: initial.attachments,
        });
      } else setV(empty());
    }
  }, [open, initial]);

  function toggleTag(t: WorkLogTag) {
    setV(s => ({ ...s, tags: s.tags.includes(t) ? s.tags.filter(x => x !== t) : [...s.tags, t] }));
  }
  function addMockFile() {
    const names = ["lab-notes.pdf", "sensor-data.csv", "prototype-v2.png", "literature-review.docx", "ethics-form.pdf"];
    const n = names[Math.floor(Math.random() * names.length)];
    setV(s => ({ ...s, attachments: [...s.attachments, { id: `a-${Date.now()}`, name: n, size: `${(Math.random()*2+0.2).toFixed(1)} MB` }] }));
  }
  function removeFile(id: string) {
    setV(s => ({ ...s, attachments: s.attachments.filter(a => a.id !== id) }));
  }
  function submit() {
    if (!v.title.trim()) return;
    onSave({ ...v, hoursSpent: Math.max(0, Number(v.hoursSpent) || 0) });
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "add" ? "Add work log" : "Edit work log"} subtitle="Document today's research, build or writing." maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input type="date" className="input-base" value={v.date} onChange={e => setV(s => ({...s, date: e.target.value}))} />
          </Field>
          <Field label="Hours spent">
            <input type="number" min={0} step={0.25} className="input-base" value={v.hoursSpent} onChange={e => setV(s => ({...s, hoursSpent: Number(e.target.value)}))} />
          </Field>
        </div>
        <Field label="Title">
          <input className="input-base" placeholder="e.g. Calibrated EMG sensor on test subject" value={v.title} onChange={e => setV(s => ({...s, title: e.target.value}))} />
        </Field>
        <Field label="Description">
          <textarea className="input-base" rows={5} placeholder="What did you work on, what worked, what's next…" value={v.description} onChange={e => setV(s => ({...s, description: e.target.value}))} />
        </Field>
        <Field label="Tags">
          <div className="flex flex-wrap gap-1.5">
            {WORK_LOG_TAGS.map(t => <Tag key={t} active={v.tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Tag>)}
          </div>
        </Field>
        <Field label="Status">
          <select className="input-base" value={v.status} onChange={e => setV(s => ({...s, status: e.target.value as WorkLogStatus}))}>
            <option>Completed</option><option>In Progress</option>
          </select>
        </Field>
        <Field label="Attachments">
          <div className="space-y-2">
            <button type="button" className="btn-ghost" onClick={addMockFile}><Paperclip className="w-4 h-4"/> Attach file</button>
            {v.attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {v.attachments.map(a => (
                  <span key={a.id} className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft bg-cream border border-[#E4DFD3] px-2 py-1" style={{ borderRadius: 2 }}>
                    <Paperclip className="w-3 h-3"/> {a.name} <span className="text-ink-muted">({a.size})</span>
                    <button onClick={() => removeFile(a.id)} className="ml-1 hover:text-[#B23838]"><X className="w-3 h-3"/></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Field>
        <div className="flex justify-end gap-2 pt-2 border-t border-[#E4DFD3]">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-teal" onClick={submit}>Save entry</button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">{label}</label>
      {children}
    </div>
  );
}
