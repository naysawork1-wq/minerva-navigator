import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/UI";
import { useStore, setSettings, store } from "@/lib/store";
import { AirtableModal } from "@/components/AirtableModal";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: () => (<AuthGate allow={["admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const settings = useStore(s => s.settings);
  const airtable = useStore(s => s.airtable);
  const [airtableOpen, setAirtableOpen] = useState(false);

  function exportData(kind: "projects" | "requests") {
    const data = kind === "projects" ? store.get().projects : store.get().requests;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `minerva-${kind}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${kind}`);
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Settings" description="Platform configuration." />

      <div className="space-y-6">
        <Section title="Airtable integration" description={airtable ? `Connected to base ${airtable.baseId}` : "Not connected"}>
          <button className="btn-primary" onClick={() => setAirtableOpen(true)}>Configure Airtable</button>
        </Section>

        <Section title="AI ideation engine">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Model"><select className="input-base" value={settings.aiModel} onChange={e => setSettings({ aiModel: e.target.value })}><option value="gpt-4o-mini">gpt-4o-mini</option><option value="gpt-4o">gpt-4o</option><option value="claude-sonnet-4">claude-sonnet-4</option><option value="gemini-2.5-pro">gemini-2.5-pro</option></select></Field>
            <Field label="Max projects per generation"><input type="number" min={1} max={6} className="input-base" value={settings.maxProjectsPerGen} onChange={e => setSettings({ maxProjectsPerGen: parseInt(e.target.value) || 3 })} /></Field>
          </div>
        </Section>

        <Section title="Mentor request settings">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Request expiry (hours)"><input type="number" min={1} className="input-base" value={settings.requestExpiryHours} onChange={e => setSettings({ requestExpiryHours: parseInt(e.target.value) || 48 })} /></Field>
            <Field label="Notify consultant on rejection">
              <label className="flex items-center gap-2 text-sm pt-2"><input type="checkbox" checked={settings.notifyConsultantOnReject} onChange={e => setSettings({ notifyConsultantOnReject: e.target.checked })} /> Enabled</label>
            </Field>
          </div>
        </Section>

        <Section title="Data management">
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => exportData("projects")}>Export project data</button>
            <button className="btn-ghost" onClick={() => exportData("requests")}>Export request log</button>
            <button className="btn-danger" onClick={() => { if (confirm("Clear all demo data? This cannot be undone.")) { store.reset(); toast.success("Demo data cleared"); location.reload(); } }}>Clear demo data</button>
          </div>
        </Section>
      </div>

      <AirtableModal open={airtableOpen} onClose={() => setAirtableOpen(false)} />
    </>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="card-elev p-6" style={{ borderRadius: 4 }}>
      <div className="mb-4"><h3 className="font-serif text-2xl text-ink">{title}</h3>{description && <p className="text-xs text-ink-muted mt-1">{description}</p>}</div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">{label}</label>{children}</div>;
}
