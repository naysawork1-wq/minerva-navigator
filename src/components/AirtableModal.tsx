import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { setAirtable, useStore } from "@/lib/store";
import { toast } from "sonner";

export function AirtableModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cfg = useStore(s => s.airtable);
  const [apiKey, setApiKey] = useState("");
  const [baseId, setBaseId] = useState("");
  const [tableName, setTableName] = useState("Scholars");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (open) {
      setApiKey(cfg?.apiKey ?? "");
      setBaseId(cfg?.baseId ?? "");
      setTableName(cfg?.tableName ?? "Scholars");
    }
  }, [open, cfg]);

  function save() {
    if (!apiKey || !baseId) { toast.error("API key and Base ID are required"); return; }
    setTesting(true);
    setTimeout(() => {
      setAirtable({ apiKey, baseId, tableName });
      setTesting(false);
      toast.success("Airtable connection saved (mock)");
      onClose();
    }, 700);
  }

  return (
    <Modal open={open} onClose={onClose} title="Sync Airtable" subtitle="Pull scholars from your existing Airtable base.">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">API Key</label>
          <input className="input-base" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="key…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Base ID</label>
            <input className="input-base" value={baseId} onChange={e => setBaseId(e.target.value)} placeholder="appXXXXXXXXXXXXXX" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Table Name</label>
            <input className="input-base" value={tableName} onChange={e => setTableName(e.target.value)} />
          </div>
        </div>
        <div className="bg-cream border border-[#E4DFD3] p-4" style={{ borderRadius: 2 }}>
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-2">Expected columns</div>
          <div className="text-xs text-ink-soft leading-relaxed">
            Name · Grade · School · Major · Interests · Past Projects · College Targets · Track
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={testing}>
            {testing ? "Testing…" : "Save & test connection"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
