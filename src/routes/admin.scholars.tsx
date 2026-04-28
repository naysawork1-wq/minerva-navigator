import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, TrackBadge } from "@/components/UI";
import { useStore, addScholar, updateScholar } from "@/lib/store";
import { Modal } from "@/components/Modal";
import type { Scholar, Track } from "@/lib/types";
import { Plus, Edit2, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/scholars")({
  component: () => (<AuthGate allow={["admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

const blank = { name: "", grade: "11", school: "", intendedMajor: "", collegeTargets: "", interests: "", pastProjects: "", track: "Unassigned" as Track };

function Page() {
  const scholars = useStore(s => s.scholars);
  const projects = useStore(s => s.projects);
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Scholar | "new" | null>(null);
  const [form, setForm] = useState(blank);

  function open(s: Scholar | "new") {
    setEditing(s);
    if (s === "new") setForm(blank);
    else setForm({ name: s.name, grade: s.grade, school: s.school, intendedMajor: s.intendedMajor, collegeTargets: s.collegeTargets.join(", "), interests: s.interests.join(", "), pastProjects: s.pastProjects.join(" · "), track: s.track });
  }
  function save() {
    if (!form.name) { toast.error("Name required"); return; }
    const data = {
      name: form.name, grade: form.grade, school: form.school, intendedMajor: form.intendedMajor,
      collegeTargets: form.collegeTargets.split(",").map(s => s.trim()).filter(Boolean),
      interests: form.interests.split(",").map(s => s.trim()).filter(Boolean),
      pastProjects: form.pastProjects.split("·").map(s => s.trim()).filter(Boolean),
      track: form.track as Track,
    };
    if (editing === "new") { addScholar(data); toast.success("Scholar added"); }
    else if (editing) { updateScholar(editing.id, data); toast.success("Scholar updated"); }
    setEditing(null);
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Scholars" description="Manage the Athena scholar roster." actions={<button className="btn-primary" onClick={() => open("new")}><Plus className="w-4 h-4"/> Add scholar</button>} />
      <div className="card-elev overflow-x-auto" style={{ borderRadius: 4 }}>
        <table className="w-full text-sm">
          <thead className="bg-cream text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            <tr><th className="text-left px-4 py-3">Scholar</th><th className="text-left px-4 py-3">Grade & School</th><th className="text-left px-4 py-3">Major</th><th className="text-left px-4 py-3">Track</th><th className="text-left px-4 py-3">Projects</th><th className="text-right px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {scholars.map(s => {
              const accepted = projects.filter(p => p.scholarId === s.id && p.status === "accepted").length;
              return (
                <tr key={s.id} className="border-t border-[#E4DFD3] hover:bg-cream-soft">
                  <td className="px-4 py-3"><div className="font-medium text-ink">{s.name}</div></td>
                  <td className="px-4 py-3 text-ink-soft">Grade {s.grade}<br/><span className="text-xs text-ink-muted">{s.school}</span></td>
                  <td className="px-4 py-3 text-ink-soft">{s.intendedMajor}</td>
                  <td className="px-4 py-3">
                    <select className="input-base !py-1.5 text-xs" value={s.track} onChange={e => updateScholar(s.id, { track: e.target.value as Track })}>
                      <option>Minerva</option><option>Pangea</option><option>Unassigned</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{accepted}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button className="btn-ghost !py-1 !px-2" onClick={() => navigate({ to: "/ideation" as any, search: { scholarId: s.id } as any })}><Lightbulb className="w-3.5 h-3.5"/></button>
                    <button className="btn-ghost !py-1 !px-2" onClick={() => open(s)}><Edit2 className="w-3.5 h-3.5"/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add scholar" : "Edit scholar"}>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ["Full name","name"],["Grade","grade"],["School","school"],["Intended major","intendedMajor"],
            ["College targets (comma)","collegeTargets"],["Interests (comma)","interests"],
          ].map(([l,k]) => (
            <div key={k}><label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">{l}</label>
              <input className="input-base" value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
          ))}
          <div className="md:col-span-2"><label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Past projects (· separated)</label>
            <textarea className="input-base" rows={2} value={form.pastProjects} onChange={e => setForm({ ...form, pastProjects: e.target.value })} /></div>
          <div><label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Track</label>
            <select className="input-base" value={form.track} onChange={e => setForm({ ...form, track: e.target.value as Track })}>
              <option>Minerva</option><option>Pangea</option><option>Unassigned</option>
            </select></div>
        </div>
        <div className="flex justify-end gap-2 mt-5"><button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></div>
      </Modal>
    </>
  );
}
