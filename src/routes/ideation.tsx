import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, TrackBadge, Tag, Avatar } from "@/components/UI";
import { useStore, acceptProject, rejectProjects } from "@/lib/store";
import { MINERVA_TOPICS, PANGEA_TOPICS, TOPIC_SCOPE, DEFAULT_SCOPE } from "@/lib/mockData";
import type { Project, Track, Feasibility, Scholar } from "@/lib/types";
import { Check, ChevronRight, Sparkles, Edit2, Eye, RefreshCw } from "lucide-react";
import { initialsOf } from "@/lib/utils";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";

export const Route = createFileRoute("/ideation")({
  validateSearch: (search: Record<string, unknown>) => ({ scholarId: (search.scholarId as string) || "" }),
  component: () => (<AuthGate allow={["consultant","admin"]}><AppShell><Wizard/></AppShell></AuthGate>),
});

const STEPS = ["Scholar","Track","Topic","Scope","Generate","Review"];

type GenIdea = Omit<Project, "id" | "status" | "acceptedAt"> & { _accepted?: boolean };

function Wizard() {
  const { scholarId } = Route.useSearch();
  const navigate = useNavigate();
  const scholars = useStore(s => s.scholars);
  const projects = useStore(s => s.projects);
  const [pickedId, setPickedId] = useState(scholarId);
  const scholar = useMemo(() => scholars.find(s => s.id === pickedId) ?? scholars[0], [pickedId, scholars]);
  const [step, setStep] = useState(scholarId ? 1 : 0);
  const [track, setTrack] = useState<Track | null>(scholar?.track !== "Unassigned" ? (scholar?.track as Track) : null);
  const [topic, setTopic] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [ideas, setIdeas] = useState<GenIdea[]>([]);
  const [feasOpen, setFeasOpen] = useState<GenIdea | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  if (!scholar) return <div>No scholars available.</div>;

  const topics = track === "Pangea" ? PANGEA_TOPICS : MINERVA_TOPICS;
  const scope = (topic && TOPIC_SCOPE[topic]) || DEFAULT_SCOPE;

  function jump(i: number) { setStep(i); }

  function generate() {
    setGenerating(true);
    setTimeout(() => {
      const list: GenIdea[] = buildIdeas(scholar!, track!, topic, scope);
      setIdeas(list);
      setGenerating(false);
      setStep(5);
    }, 1200);
  }

  function regenerate() {
    if (ideas.length) {
      const unaccepted = ideas.filter(i => !i._accepted);
      if (unaccepted.length) {
        rejectProjects(unaccepted.map(({ _accepted: _a, ...rest }) => rest));
        toast.message("Rejected ideas saved", { description: `${unaccepted.length} idea(s) moved to the Rejected database.` });
      }
    }
    generate();
  }

  function accept(idx: number) {
    const idea = ideas[idx];
    const dupe = projects.find(p => p.scholarId === idea.scholarId && p.name === idea.name && p.status === "accepted");
    if (dupe) { toast.error("This project is already accepted for this scholar."); return; }
    const { _accepted: _a, ...rest } = idea;
    acceptProject(rest);
    setIdeas(prev => prev.map((it, i) => i === idx ? { ...it, _accepted: true } : it));
    toast.success("Project accepted", { description: "Saved to your project database." });
  }

  return (
    <>
      <PageHeader eyebrow="Ideation engine" title="Generate a capstone" description="Six-step guided flow from scholar profile to accepted project." />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-10">
        {/* Stepper */}
        <aside>
          <ol className="space-y-1">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={label}>
                  <button onClick={() => i <= step && jump(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors
                      ${active ? "bg-navy text-white" : done ? "text-ink hover:bg-cream" : "text-ink-muted"}`}
                    style={{ borderRadius: 2 }}>
                    <span className={`w-6 h-6 flex items-center justify-center text-[11px] border ${active ? "border-white/40 bg-white/10" : done ? "border-teal bg-teal text-white" : "border-[#E4DFD3]"}`} style={{ borderRadius: 2 }}>
                      {done ? <Check className="w-3 h-3"/> : i+1}
                    </span>
                    <span className="font-medium">{label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {/* Progress */}
          <div className="h-1 bg-cream mb-6 overflow-hidden" style={{ borderRadius: 2 }}>
            <div className="h-full bg-teal transition-all" style={{ width: `${((step)/(STEPS.length-1))*100}%` }} />
          </div>

          {step === 0 && <PickScholar scholars={scholars} value={pickedId} onChange={setPickedId} onNext={() => setStep(1)} />}

          {step === 1 && (
            <div className="anim-fade-up">
              <SectionTitle>Confirm scholar profile</SectionTitle>
              <ScholarCard scholar={scholar} />
              <NextRow onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Confirm & select track" />
            </div>
          )}

          {step === 2 && (
            <div className="anim-fade-up">
              <SectionTitle>Select project track</SectionTitle>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <TrackChoice
                  selected={track === "Minerva"} onSelect={() => setTrack("Minerva")}
                  title="Minerva — Tech Capstone" subtitle="Hardware or software product"
                  body="Build a hardware or software product. Scholar learns by doing — prototype, test, deploy."
                  accent="var(--teal)" />
                <TrackChoice
                  selected={track === "Pangea"} onSelect={() => setTrack("Pangea")}
                  title="Pangea — Research Paper" subtitle="Published academic study"
                  body="Produce a published academic study. Scholar learns to research, analyse, and write."
                  accent="var(--violet)" />
              </div>
              <NextRow onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Next: choose topic" disabled={!track} />
            </div>
          )}

          {step === 3 && (
            <div className="anim-fade-up">
              <SectionTitle>Connected topics</SectionTitle>
              <p className="text-xs text-ink-muted mb-4">Ranked by: major alignment · past project continuity · Ivy + ISEF relevance · grade feasibility</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {topics.map(t => <Tag key={t} active={topic === t} onClick={() => setTopic(t)}>{t}</Tag>)}
              </div>
              <NextRow onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Next: scope" disabled={!topic} />
            </div>
          )}

          {step === 4 && (
            <div className="anim-fade-up">
              <SectionTitle>Project scope</SectionTitle>
              <div className="grid md:grid-cols-2 gap-3 mb-6">
                <ScopeCard label="Tech stack" value={scope.stack} />
                <ScopeCard label="Expected outcome" value={scope.outcome} />
                <ScopeCard label="Complexity" value={scope.complexity} />
                <ScopeCard label="Duration" value={scope.duration} />
                <ScopeCard label="Track" value={track ?? "—"} />
                <ScopeCard label="Grade fit" value={`Grade ${scholar.grade} appropriate`} />
              </div>
              <NextRow onBack={() => setStep(3)} onNext={() => setStep(4.5 as any)} nextLabel="Open ideation engine" />
              <div className="hidden">{step}</div>
              {/* fall through to step 4.5 button */}
            </div>
          )}

          {(step === (4.5 as any)) && (
            <div className="anim-fade-up">
              <SectionTitle>Ideation engine</SectionTitle>
              <div className="bg-navy-deep text-white p-5 font-mono text-xs leading-relaxed mb-4 overflow-x-auto" style={{ borderRadius: 4 }}>
                <div className="text-teal-bright">// prompt context</div>
                <div>scholar    : {scholar.name}, Grade {scholar.grade}, {scholar.school}</div>
                <div>major      : {scholar.intendedMajor}</div>
                <div>interests  : {scholar.interests.join(", ")}</div>
                <div>past_proj  : {scholar.pastProjects.join(" · ")}</div>
                <div>targets    : {scholar.collegeTargets.join(", ")}</div>
                <div>track      : {track}</div>
                <div>topic      : {topic}</div>
                <div>constraints: Feasible · NGO impact preferred · ISEF-ready · Grade-appropriate</div>
              </div>
              <button className="btn-teal" disabled={generating} onClick={generate}>
                <Sparkles className="w-4 h-4" /> {generating ? "Generating ideas…" : "Generate project ideas"}
              </button>
              {generating && (
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {[1,2,3].map(i => <div key={i} className="skeleton h-48" style={{ borderRadius: 4 }} />)}
                </div>
              )}
              <div className="mt-6"><NextRow onBack={() => setStep(4)} hideNext /></div>
            </div>
          )}

          {step === 5 && (
            <div className="anim-fade-up">
              <SectionTitle>Generated projects</SectionTitle>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-ink-muted">Review, edit, or accept ideas. Regenerate to discard the unaccepted ones.</p>
                <button className="btn-ghost" onClick={regenerate}><RefreshCw className="w-4 h-4"/> Regenerate</button>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                {ideas.map((idea, idx) => (
                  <IdeaCard key={idx} idea={idea} editing={editingIdx === idx}
                    onEdit={() => setEditingIdx(idx)} onCancelEdit={() => setEditingIdx(null)}
                    onSaveEdit={(name, description) => { setIdeas(prev => prev.map((it,i) => i===idx ? { ...it, name, description } : it)); setEditingIdx(null); }}
                    onAccept={() => accept(idx)} onFeas={() => setFeasOpen(idea)} />
                ))}
              </div>
              <NextRow onBack={() => setStep(4.5 as any)} onNext={() => navigate({ to: "/projects" as any })} nextLabel="Go to project database" />
            </div>
          )}
        </div>
      </div>

      <FeasibilityModal idea={feasOpen} onClose={() => setFeasOpen(null)} onAccept={() => {
        if (!feasOpen) return;
        const idx = ideas.findIndex(i => i.name === feasOpen.name);
        if (idx >= 0) accept(idx);
        setFeasOpen(null);
      }} />
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-3xl text-ink mb-4">{children}</h2>;
}

function NextRow({ onBack, onNext, nextLabel, disabled, hideNext }: { onBack?: () => void; onNext?: () => void; nextLabel?: string; disabled?: boolean; hideNext?: boolean }) {
  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-[#E4DFD3]">
      <button className="btn-ghost" onClick={onBack} disabled={!onBack}>Back</button>
      {!hideNext && <button className="btn-primary" onClick={onNext} disabled={disabled}>{nextLabel ?? "Next"} <ChevronRight className="w-4 h-4"/></button>}
    </div>
  );
}

function PickScholar({ scholars, value, onChange, onNext }: { scholars: Scholar[]; value: string; onChange: (id: string)=>void; onNext: ()=>void }) {
  return (
    <div className="anim-fade-up">
      <SectionTitle>Pick a scholar</SectionTitle>
      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {scholars.map(s => (
          <button key={s.id} onClick={() => onChange(s.id)}
            className={`text-left p-4 border transition-all ${value === s.id ? "border-teal bg-cream-soft" : "border-[#E4DFD3] hover:border-ink-muted"}`}
            style={{ borderRadius: 2, background: value === s.id ? "rgba(13,168,130,0.04)" : "#fff" }}>
            <div className="flex items-center gap-3">
              <Avatar initials={initialsOf(s.name)} />
              <div>
                <div className="font-medium text-ink">{s.name}</div>
                <div className="text-xs text-ink-muted">Grade {s.grade} · {s.intendedMajor}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <NextRow onNext={onNext} disabled={!value} nextLabel="Confirm scholar" />
    </div>
  );
}

function ScholarCard({ scholar }: { scholar: Scholar }) {
  return (
    <div className="card-elev p-6" style={{ borderRadius: 4 }}>
      <div className="flex items-start gap-4 pb-5 border-b border-[#E4DFD3]">
        <Avatar initials={initialsOf(scholar.name)} size={56} />
        <div className="flex-1">
          <div className="font-serif text-2xl text-ink">{scholar.name}</div>
          <div className="text-sm text-ink-muted">Grade {scholar.grade} · {scholar.school}</div>
        </div>
        <TrackBadge track={scholar.track} />
      </div>
      <div className="grid md:grid-cols-2 gap-5 mt-5">
        <Field label="Intended major" value={scholar.intendedMajor} />
        <Field label="College targets" value={scholar.collegeTargets.join(" · ")} />
        <Field label="Core interests" value={scholar.interests.join(" · ")} />
        <Field label="Past projects" value={scholar.pastProjects.join(" · ")} />
      </div>
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-1">{label}</div>
      <div className="text-sm text-ink-soft">{value}</div>
    </div>
  );
}

function TrackChoice({ selected, onSelect, title, subtitle, body, accent }:
  { selected: boolean; onSelect: () => void; title: string; subtitle: string; body: string; accent: string }) {
  return (
    <button onClick={onSelect} className={`text-left p-6 border transition-all ${selected ? "border-2" : "border hover:border-ink-muted"}`}
      style={{ borderRadius: 4, borderColor: selected ? accent : undefined, background: selected ? "rgba(13,168,130,0.04)" : "#fff" }}>
      <div className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: accent }}>{subtitle}</div>
      <div className="font-serif text-2xl text-ink mb-2">{title}</div>
      <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
    </button>
  );
}

function ScopeCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-elev p-4" style={{ borderRadius: 4 }}>
      <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-1">{label}</div>
      <div className="text-sm text-ink-soft">{value}</div>
    </div>
  );
}

function IdeaCard({ idea, editing, onEdit, onCancelEdit, onSaveEdit, onAccept, onFeas }:
  { idea: GenIdea; editing: boolean; onEdit: () => void; onCancelEdit: () => void; onSaveEdit: (name: string, description: string)=>void; onAccept: () => void; onFeas: () => void }) {
  const [name, setName] = useState(idea.name);
  const [description, setDescription] = useState(idea.description);
  const [pathOpen, setPathOpen] = useState(false);
  const feasCls = idea.feasibility === "High" ? "feas-high" : idea.feasibility === "Medium" ? "feas-med" : "feas-low";
  return (
    <div className="card-elev p-5 anim-fade-up" style={{ borderRadius: 4 }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        {editing ? (
          <input className="input-base flex-1" value={name} onChange={e => setName(e.target.value)} />
        ) : (
          <h3 className="font-serif text-xl text-ink leading-tight">{idea.name}</h3>
        )}
        <span className={`text-[10px] uppercase tracking-[0.14em] px-2 py-1 ${feasCls}`} style={{ borderRadius: 2 }}>{idea.feasibility}</span>
      </div>
      {editing ? (
        <textarea className="input-base mb-3" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
      ) : (
        <p className="text-sm text-ink-soft mb-3 leading-relaxed">{idea.description}</p>
      )}
      <div className="grid grid-cols-3 gap-2 text-[11px] text-ink-muted mb-3">
        <div><div className="uppercase tracking-[0.14em]">Timeline</div><div className="text-ink-soft">{idea.timeline}</div></div>
        <div><div className="uppercase tracking-[0.14em]">Grade fit</div><div className="text-ink-soft">{idea.gradeFit}</div></div>
        <div><div className="uppercase tracking-[0.14em]">Impact</div><div className="text-ink-soft">{idea.impact}</div></div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {idea.techStack.map(t => <span key={t} className="text-[10px] bg-cream border border-[#E4DFD3] px-2 py-0.5" style={{ borderRadius: 2 }}>{t}</span>)}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {idea.learningOutcomes.map(t => <span key={t} className="text-[10px] px-2 py-0.5" style={{ borderRadius: 2, background: "rgba(13,168,130,0.10)", color: "#0DA882" }}>{t}</span>)}
      </div>
      <button className="text-xs text-teal font-medium mb-3" onClick={() => setPathOpen(o => !o)}>{pathOpen ? "Hide" : "Show"} scholar learning path</button>
      {pathOpen && (
        <ol className="text-xs text-ink-soft border-l-2 border-teal pl-3 space-y-1.5 mb-3">
          {idea.weekPath.map(w => (
            <li key={w.week}><span className="font-medium text-ink">{w.week}:</span> {w.focus}</li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-[#E4DFD3]">
        {idea._accepted ? (
          <span className="badge-status-accepted px-3 py-1.5 text-[11px] uppercase tracking-[0.14em]" style={{ borderRadius: 2 }}>✓ Accepted</span>
        ) : editing ? (
          <>
            <button className="btn-primary" onClick={() => onSaveEdit(name, description)}>Save</button>
            <button className="btn-ghost" onClick={onCancelEdit}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn-teal" onClick={onAccept}><Check className="w-4 h-4"/> Accept</button>
            <button className="btn-ghost" onClick={onEdit}><Edit2 className="w-4 h-4"/> Edit</button>
            <button className="btn-ghost" onClick={onFeas}><Eye className="w-4 h-4"/> Feasibility check</button>
          </>
        )}
      </div>
    </div>
  );
}

function FeasibilityModal({ idea, onClose, onAccept }: { idea: GenIdea | null; onClose: () => void; onAccept: () => void }) {
  const [loading, setLoading] = useState(true);
  const [score] = useState(() => 72 + Math.floor(Math.random() * 18));
  const bars = [
    { label: "Grade-level fit", v: 78 },
    { label: "Tech complexity", v: 64 },
    { label: "Timeline realism", v: 82 },
    { label: "Mentor availability", v: 70 },
    { label: "Lab resource fit", v: 66 },
    { label: "Ivy impact value", v: 88 },
  ];
  if (idea && loading) setTimeout(() => setLoading(false), 700);
  if (!idea) return null;
  return (
    <Modal open={!!idea} onClose={() => { setLoading(true); onClose(); }} title="Feasibility check" subtitle={idea.name}>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-6" style={{ borderRadius: 2 }} />)}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="font-serif text-5xl text-teal">{score}%</div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Verdict</div>
              <div className="font-medium text-ink">{score >= 70 ? "Feasible — proceed" : "Review scope"}</div>
            </div>
          </div>
          <div className="space-y-3 mb-5">
            {bars.map(b => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1"><span className="text-ink-soft">{b.label}</span><span className="text-ink-muted">{b.v}%</span></div>
                <div className="h-2 bg-cream" style={{ borderRadius: 2 }}>
                  <div className="h-full bg-teal" style={{ width: `${b.v}%`, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-cream p-4 mb-5 text-sm text-ink-soft" style={{ borderRadius: 2 }}>
            <strong className="text-ink">Recommendation:</strong> Pair this scholar with a mentor who has hands-on prototyping experience. Consider an NGO clinic pilot in week 9–10 to strengthen impact.
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={onClose}>Close</button>
            <button className="btn-teal" onClick={onAccept}>Accept this project</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ---- Mock idea generator ----
function buildIdeas(scholar: Scholar, track: Track, topic: string, scope: { stack: string; outcome: string; complexity: string; duration: string }): GenIdea[] {
  const fb: Feasibility[] = ["High","Medium","High"];
  const namesByTopic: Record<string, string[]> = {
    "Rehabilitation tech": [
      "Wearable EMG glove for stroke rehab tracking",
      "Smart rehabilitation insole for gait recovery",
      "Low-cost finger flexion trainer for cerebral palsy",
    ],
    "AI in healthcare": [
      "Edge-AI tuberculosis chest X-ray screener",
      "Diabetic retinopathy screening on Raspberry Pi",
      "Voice-based early Parkinson's detection",
    ],
    "Environmental monitoring": [
      "Mumbai air quality citizen sensor mesh",
      "Lake water quality IoT buoy network",
      "Construction-site dust monitoring badge",
    ],
  };
  const fallback = [
    `${topic}: Prototype-led capstone for ${scholar.intendedMajor}`,
    `${topic}: Field study tied to NGO partnership`,
    `${topic}: Hardware + data study with publication target`,
  ];
  const names = namesByTopic[topic] ?? fallback;
  const desc = (i: number) => {
    const angles = [
      `A ${scope.duration.toLowerCase()} build pairing ${scope.stack.split(",")[0]} with ${scholar.interests[0] ?? "applied research"} — designed to culminate in ${scope.outcome.split("→")[0].trim()}.`,
      `Combines ${scholar.intendedMajor} fundamentals with hands-on prototyping. Mentor-friendly scope with clear weekly deliverables.`,
      `High-impact, Ivy-relevant capstone with a documented field pilot and a clear research artefact suitable for ISEF or IEEE submission.`,
    ];
    return angles[i % angles.length];
  };
  const learning = ["Hardware prototyping","Data analysis","Field research","Technical writing","CAD design","Embedded firmware"];
  const week = (n: number) => Array.from({ length: n }, (_, i) => ({
    week: `Week ${i+1}`,
    focus: [
      "Background reading + project scoping",
      "Sensor selection + bench tests",
      "CAD design and 3D print iteration",
      "Firmware integration",
      "Initial data collection",
      "NGO partner outreach",
      "Pilot run #1 + iteration",
      "Pilot run #2",
      "Statistical analysis",
      "Draft research write-up",
      "Internal review with mentor",
      "ISEF abstract draft",
    ][i] || "Iteration & polish",
  }));

  return names.slice(0, 3).map((name, i) => ({
    name,
    scholarId: scholar.id, scholarName: scholar.name,
    topic, track,
    feasibility: fb[i] ?? "High",
    description: desc(i),
    timeline: scope.duration,
    gradeFit: `Grade ${scholar.grade}+`,
    impact: track === "Pangea" ? "Publication-ready" : "NGO pilot + ISEF",
    techStack: scope.stack.split(",").map(s => s.trim()).slice(0, 6),
    learningOutcomes: learning.slice(0, 4 + (i % 2)),
    weekPath: week(12),
  }));
}
