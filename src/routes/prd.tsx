import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Empty } from "@/components/UI";
import { useStore } from "@/lib/store";
import { FileText, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/prd")({
  component: () => (<AuthGate allow={["consultant","admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

const DOC_TYPES = [
  { key: "mentor", title: "Mentor PRD", who: "Assigned mentor", items: ["Project brief","Scholar context","Tech stack","14-week timeline","Mentor responsibilities","Lab requirements"], color: "var(--teal)" },
  { key: "scholar", title: "Scholar PRD", who: "Scholar / student", items: ["Project overview","Week-by-week learning path","Tools to learn","Skill milestones","Academy workshop tags"], color: "var(--violet)" },
  { key: "consultant", title: "Consultant PRD", who: "Consultant", items: ["Full project brief","Mentor handoff note","Escalation checklist","Application integration strategy"], color: "var(--sky)" },
  { key: "parent", title: "Parent PRD", who: "Parent / Guardian", items: ["Non-technical project summary","Mentor credentials","Milestone timeline","Parent support guide","FAQs"], color: "var(--gold)" },
];

function Page() {
  const projects = useStore(s => s.projects.filter(p => p.status === "accepted"));
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [selected, setSelected] = useState<string[]>([]);
  const [generated, setGenerated] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const project = projects.find(p => p.id === projectId);

  function toggle(k: string) { setSelected(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]); }
  function generate() {
    if (!project || !selected.length) { toast.error("Select a project and at least one document"); return; }
    setLoading(true);
    setTimeout(() => { setGenerated(selected); setLoading(false); toast.success(`${selected.length} document(s) generated`); }, 1200);
  }

  return (
    <>
      <PageHeader eyebrow="Consultant workspace" title="Generate PRD" description="Produce role-specific briefs for any accepted project." />
      {projects.length === 0 ? <Empty title="No accepted projects yet" hint="Accept a project in the Ideation engine first." /> : (
        <>
          <div className="card-elev p-5 mb-6" style={{ borderRadius: 4 }}>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Select accepted project</label>
            <select className="input-base" value={projectId} onChange={e => { setProjectId(e.target.value); setGenerated([]); }}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} — {p.scholarName}</option>)}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {DOC_TYPES.map(d => {
              const sel = selected.includes(d.key);
              return (
                <button key={d.key} onClick={() => toggle(d.key)}
                  className={`text-left p-5 border transition-all ${sel ? "border-2" : "hover:border-ink-muted"}`}
                  style={{ borderRadius: 4, borderColor: sel ? d.color : "var(--border)", background: sel ? "rgba(13,168,130,0.04)" : "#fff" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" style={{ color: d.color }} />
                      <h3 className="font-serif text-xl text-ink">{d.title}</h3>
                    </div>
                    <div className={`w-5 h-5 border ${sel ? "bg-teal border-teal" : "border-[#E4DFD3]"}`} style={{ borderRadius: 2 }}>
                      {sel && <svg viewBox="0 0 16 16" className="w-full h-full text-white"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none"/></svg>}
                    </div>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-2">For: {d.who}</div>
                  <ul className="text-xs text-ink-soft space-y-1">{d.items.map(i => <li key={i}>· {i}</li>)}</ul>
                </button>
              );
            })}
          </div>

          <button className="btn-teal" onClick={generate} disabled={loading}><Sparkles className="w-4 h-4"/> {loading ? "Generating…" : "Generate documents"}</button>

          {generated.length > 0 && (
            <div className="mt-6 card-elev p-5" style={{ borderRadius: 4 }}>
              <h3 className="font-serif text-xl text-ink mb-3">Generated documents</h3>
              <div className="space-y-2">
                {generated.map(g => {
                  const d = DOC_TYPES.find(x => x.key === g)!;
                  return (
                    <div key={g} className="flex items-center justify-between border border-[#E4DFD3] p-3" style={{ borderRadius: 2 }}>
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4" style={{ color: d.color }} />
                        <div>
                          <div className="text-sm text-ink font-medium">{d.title}</div>
                          <div className="text-xs text-ink-muted">{project!.name}.docx</div>
                        </div>
                      </div>
                      <button className="btn-ghost" onClick={() => toast.success("Download started (mock)")}><Download className="w-4 h-4"/> Download</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
