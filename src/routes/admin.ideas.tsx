import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Empty, Tag, Badge } from "@/components/UI";
import { Modal } from "@/components/Modal";
import { useStore, addIdea, updateIdea, deleteIdea } from "@/lib/store";
import { IDEA_CATEGORIES, type Idea, type IdeaCategory } from "@/lib/types";
import { Plus, Search, ExternalLink, Pencil, Trash2, Lightbulb, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ideas")({
  component: () => (<AuthGate allow={["admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const ideas = useStore(s => s.ideas);
  const user = useStore(s => s.user);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<IdeaCategory | "All">("All");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Idea | null>(null);
  const [deleting, setDeleting] = useState<Idea | null>(null);

  const filtered = useMemo(() => {
    return ideas.filter(i => {
      if (filter !== "All" && i.category !== filter) return false;
      if (!q.trim()) return true;
      const t = q.toLowerCase();
      return i.title.toLowerCase().includes(t) || i.description.toLowerCase().includes(t) || (i.customCategory ?? "").toLowerCase().includes(t);
    });
  }, [ideas, q, filter]);

  function handleSave(values: IdeaFormValues) {
    if (editing) {
      updateIdea(editing.id, values);
      toast.success("Idea updated");
      setEditing(null);
    } else {
      addIdea({ ...values, createdBy: user?.name ?? "Admin" });
      toast.success("Idea added", { description: values.title });
      setAdding(false);
    }
  }
  function handleDelete() {
    if (!deleting) return;
    deleteIdea(deleting.id);
    toast.success("Idea deleted");
    setDeleting(null);
  }

  const counts = IDEA_CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c] = ideas.filter(i => i.category === c).length; return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Idea bank"
        title="Project ideas"
        description="Curate the canonical list of project ideas the consultants pull from during ideation."
        actions={<button className="btn-teal" onClick={() => setAdding(true)}><Plus className="w-4 h-4"/> Add idea</button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total ideas" value={ideas.length} />
        <Stat label="Robotics" value={counts["Robotics"] ?? 0} />
        <Stat label="ML" value={counts["ML"] ?? 0} />
        <Stat label="Research" value={(counts["Research"] ?? 0) + (counts["Tech Research"] ?? 0)} />
      </div>

      <div className="card-elev p-4 md:p-5 mb-4" style={{ borderRadius: 4 }}>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"/>
            <input className="input-base pl-9" placeholder="Search title or description…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Tag active={filter === "All"} onClick={() => setFilter("All")}>All ({ideas.length})</Tag>
          {IDEA_CATEGORIES.map(c => (
            <Tag key={c} active={filter === c} onClick={() => setFilter(c)}>{c} ({counts[c] ?? 0})</Tag>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty title="No ideas yet" hint="Click 'Add idea' to start building the bank." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card-elev overflow-hidden" style={{ borderRadius: 4 }}>
            <table className="w-full text-sm">
              <thead className="bg-cream text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                <tr>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Source</th>
                  <th className="text-left px-4 py-3">Added</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DFD3]">
                {filtered.map(i => (
                  <tr key={i.id} className="hover:bg-cream-soft">
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-ink">{i.title}</div>
                      <div className="text-xs text-ink-muted line-clamp-2 mt-0.5 max-w-md">{i.description}</div>
                    </td>
                    <td className="px-4 py-3 align-top"><CategoryBadge idea={i} /></td>
                    <td className="px-4 py-3 align-top">
                      {i.sourceLinks.length === 0 ? <span className="text-xs text-ink-muted">—</span> : (
                        <div className="space-y-0.5">
                          {i.sourceLinks.slice(0,2).map((l,idx) => (
                            <a key={idx} href={l} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-teal hover:underline truncate max-w-[180px]">
                              <ExternalLink className="w-3 h-3 shrink-0"/> {shortUrl(l)}
                            </a>
                          ))}
                          {i.sourceLinks.length > 2 && <div className="text-[10px] text-ink-muted">+{i.sourceLinks.length - 2} more</div>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-ink-muted">{new Date(i.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="inline-flex gap-1">
                        <button className="p-1.5 hover:bg-cream" style={{ borderRadius: 2 }} onClick={() => setEditing(i)} title="Edit"><Pencil className="w-3.5 h-3.5 text-ink-soft"/></button>
                        <button className="p-1.5 hover:bg-cream" style={{ borderRadius: 2 }} onClick={() => setDeleting(i)} title="Delete"><Trash2 className="w-3.5 h-3.5 text-[#B23838]"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(i => (
              <div key={i.id} className="card-elev p-4" style={{ borderRadius: 4 }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <Lightbulb className="w-4 h-4 text-teal shrink-0 mt-0.5"/>
                    <div className="font-medium text-ink leading-snug">{i.title}</div>
                  </div>
                  <CategoryBadge idea={i} />
                </div>
                <p className="text-xs text-ink-soft mb-2">{i.description}</p>
                {i.sourceLinks.length > 0 && (
                  <div className="space-y-0.5 mb-2">
                    {i.sourceLinks.map((l, idx) => (
                      <a key={idx} href={l} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-teal hover:underline">
                        <ExternalLink className="w-3 h-3 shrink-0"/> {shortUrl(l)}
                      </a>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[#E4DFD3]">
                  <span className="text-[10px] text-ink-muted">{new Date(i.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-cream" style={{ borderRadius: 2 }} onClick={() => setEditing(i)}><Pencil className="w-3.5 h-3.5 text-ink-soft"/></button>
                    <button className="p-1.5 hover:bg-cream" style={{ borderRadius: 2 }} onClick={() => setDeleting(i)}><Trash2 className="w-3.5 h-3.5 text-[#B23838]"/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <IdeaModal open={adding} onClose={() => setAdding(false)} onSave={handleSave} mode="add" />
      <IdeaModal open={!!editing} onClose={() => setEditing(null)} onSave={handleSave} initial={editing} mode="edit" />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete idea" subtitle="This action cannot be undone." maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">Delete <strong className="text-ink">"{deleting?.title}"</strong>?</p>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
            <button className="btn-primary" style={{ background: "#B23838" }} onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function shortUrl(u: string) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } }

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-elev p-4" style={{ borderRadius: 4 }}>
      <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">{label}</div>
      <div className="font-serif text-3xl mt-1 text-ink">{value}</div>
    </div>
  );
}

function CategoryBadge({ idea }: { idea: Idea }) {
  const label = idea.category === "Other" && idea.customCategory ? idea.customCategory : idea.category;
  return <Badge className="bg-cream border border-[#E4DFD3] text-ink-soft">{label}</Badge>;
}

interface IdeaFormValues {
  title: string;
  description: string;
  sourceLinks: string[];
  category: IdeaCategory;
  customCategory?: string;
  createdBy?: string;
}

function IdeaModal({ open, onClose, onSave, initial, mode }: {
  open: boolean; onClose: () => void; onSave: (v: IdeaFormValues) => void; initial?: Idea | null; mode: "add" | "edit";
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("ML");
  const [customCategory, setCustomCategory] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [links, setLinks] = useState<string[]>([]);

  // reset on open
  useEffect(() => {
    if (open) {
      if (initial) {
        setTitle(initial.title); setDescription(initial.description);
        setCategory(initial.category); setCustomCategory(initial.customCategory ?? "");
        setLinks(initial.sourceLinks); setLinkInput("");
      } else {
        setTitle(""); setDescription(""); setCategory("ML"); setCustomCategory(""); setLinks([]); setLinkInput("");
      }
    }
  }, [open, initial]);

  function addLink() {
    const v = linkInput.trim(); if (!v) return;
    setLinks(l => [...l, v]); setLinkInput("");
  }
  function removeLink(idx: number) { setLinks(l => l.filter((_,i) => i !== idx)); }

  function submit() {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (category === "Other" && !customCategory.trim()) { toast.error("Enter a custom category"); return; }
    onSave({
      title: title.trim(), description: description.trim(), sourceLinks: links,
      category, customCategory: category === "Other" ? customCategory.trim() : undefined,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "add" ? "Add new idea" : "Edit idea"} subtitle="Project ideas feed the consultant ideation flow." maxWidth="max-w-xl">
      <div className="space-y-4">
        <Field label="Title">
          <input className="input-base" placeholder="e.g. Smart helmet for two-wheeler safety" value={title} onChange={e => setTitle(e.target.value)} />
        </Field>
        <Field label="Description">
          <textarea className="input-base" rows={4} placeholder="What is the idea, the target outcome, and why it matters…" value={description} onChange={e => setDescription(e.target.value)} />
        </Field>
        <Field label="Category">
          <select className="input-base" value={category} onChange={e => setCategory(e.target.value as IdeaCategory)}>
            {IDEA_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        {category === "Other" && (
          <Field label="Custom category">
            <input className="input-base" placeholder="e.g. Bioinformatics" value={customCategory} onChange={e => setCustomCategory(e.target.value)} />
          </Field>
        )}
        <Field label="Source links (optional)">
          <div className="flex gap-2">
            <input className="input-base flex-1" placeholder="https://…" value={linkInput} onChange={e => setLinkInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }} />
            <button type="button" className="btn-ghost" onClick={addLink}>Add</button>
          </div>
          {links.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {links.map((l, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft bg-cream border border-[#E4DFD3] px-2 py-1" style={{ borderRadius: 2 }}>
                  <ExternalLink className="w-3 h-3"/> {shortUrl(l)}
                  <button onClick={() => removeLink(idx)} className="ml-1 hover:text-[#B23838]"><X className="w-3 h-3"/></button>
                </span>
              ))}
            </div>
          )}
        </Field>
        <div className="flex justify-end gap-2 pt-2 border-t border-[#E4DFD3]">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-teal" onClick={submit}>{mode === "add" ? "Add idea" : "Save changes"}</button>
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
