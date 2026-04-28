import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Avatar } from "@/components/UI";
import { useStore, addMentor, updateMentor } from "@/lib/store";
import { Modal } from "@/components/Modal";
import type { Mentor, Track } from "@/lib/types";
import { Plus, Edit2, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/mentors")({
  component: () => (<AuthGate allow={["admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

const blank = { name: "", designation: "", organization: "", track: "Minerva" as Track | "Both", domains: "", availabilityDays: "Mon, Wed, Fri", maxConcurrentScholars: 3, mode: "Hybrid" as Mentor["mode"], bio: "", subExpertise: "", status: "active" as Mentor["status"] };

function Page() {
  const mentors = useStore(s => s.mentors);
  const [editing, setEditing] = useState<Mentor | "new" | null>(null);
  const [profile, setProfile] = useState<Mentor | null>(null);
  const [form, setForm] = useState(blank);

  function open(m: Mentor | "new") {
    setEditing(m);
    if (m === "new") setForm(blank);
    else setForm({ name: m.name, designation: m.designation, organization: m.organization, track: m.track, domains: m.domains.join(", "), availabilityDays: m.availabilityDays.join(", "), maxConcurrentScholars: m.maxConcurrentScholars, mode: m.mode, bio: m.bio, subExpertise: m.subExpertise.join(", "), status: m.status });
  }
  function save() {
    if (!form.name) { toast.error("Name required"); return; }
    const data = { name: form.name, designation: form.designation, organization: form.organization, track: form.track, domains: form.domains.split(",").map(s=>s.trim()).filter(Boolean), availabilityDays: form.availabilityDays.split(",").map(s=>s.trim()).filter(Boolean), maxConcurrentScholars: form.maxConcurrentScholars, mode: form.mode, bio: form.bio, subExpertise: form.subExpertise.split(",").map(s=>s.trim()).filter(Boolean), status: form.status };
    if (editing === "new") { addMentor(data); toast.success("Mentor added"); }
    else if (editing) { updateMentor(editing.id, data); toast.success("Mentor updated"); }
    setEditing(null);
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Mentors" description="Manage the mentor network." actions={<button className="btn-primary" onClick={() => open("new")}><Plus className="w-4 h-4"/> Add mentor</button>} />
      <div className="card-elev overflow-x-auto" style={{ borderRadius: 4 }}>
        <table className="w-full text-sm">
          <thead className="bg-cream text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            <tr><th className="text-left px-4 py-3">Mentor</th><th className="text-left px-4 py-3">Domains</th><th className="text-left px-4 py-3">Track</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Capacity</th><th className="text-right px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {mentors.map(m => (
              <tr key={m.id} className="border-t border-[#E4DFD3] hover:bg-cream-soft">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar initials={m.initials} size={32} color="var(--violet)"/><div><div className="font-medium text-ink">{m.name}</div><div className="text-xs text-ink-muted">{m.organization}</div></div></div></td>
                <td className="px-4 py-3 text-ink-soft text-xs">{m.domains.slice(0,3).join(", ")}</td>
                <td className="px-4 py-3 text-ink-soft">{m.track}</td>
                <td className="px-4 py-3"><select className="input-base !py-1.5 text-xs" value={m.status} onChange={e => updateMentor(m.id, { status: e.target.value as any })}><option value="active">active</option><option value="on leave">on leave</option><option value="inactive">inactive</option></select></td>
                <td className="px-4 py-3 text-ink-soft">{m.maxConcurrentScholars}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button className="btn-ghost !py-1 !px-2" onClick={() => setProfile(m)}><Eye className="w-3.5 h-3.5"/></button>
                  <button className="btn-ghost !py-1 !px-2" onClick={() => open(m)}><Edit2 className="w-3.5 h-3.5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!profile} onClose={() => setProfile(null)} title={profile?.name ?? ""}>
        {profile && <div className="text-sm text-ink-soft space-y-2"><p>{profile.bio}</p><div><strong>Domains:</strong> {profile.domains.join(", ")}</div><div><strong>Sub-expertise:</strong> {profile.subExpertise.join(", ")}</div><div><strong>Availability:</strong> {profile.availabilityDays.join(", ")} · {profile.mode}</div></div>}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add mentor" : "Edit mentor"}>
        <div className="grid md:grid-cols-2 gap-3">
          {[["Full name","name"],["Designation","designation"],["Organization","organization"],["Domain tags (comma)","domains"],["Availability (comma)","availabilityDays"],["Sub-expertise (comma)","subExpertise"]].map(([l,k]) => (
            <div key={k}><label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">{l}</label>
              <input className="input-base" value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
          ))}
          <div><label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Track</label>
            <select className="input-base" value={form.track} onChange={e => setForm({ ...form, track: e.target.value as any })}><option>Minerva</option><option>Pangea</option><option>Both</option></select></div>
          <div><label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Mode</label>
            <select className="input-base" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value as any })}><option>Online</option><option>In-person</option><option>Hybrid</option></select></div>
          <div className="md:col-span-2"><label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Bio</label>
            <textarea className="input-base" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5"><button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></div>
      </Modal>
    </>
  );
}
