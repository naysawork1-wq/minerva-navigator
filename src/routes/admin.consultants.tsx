import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Avatar, Badge } from "@/components/UI";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/consultants")({
  component: () => (<AuthGate allow={["admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

// Demo consultants (mock — only one demo login exists)
const CONSULTANTS = [
  { id: "c1", name: "Riya Mehta", email: "consultant@athenaeducation.co.in", active: true, scholars: 4 },
  { id: "c2", name: "Karan Desai", email: "karan@athenaeducation.co.in", active: true, scholars: 6 },
  { id: "c3", name: "Tara Nair", email: "tara@athenaeducation.co.in", active: false, scholars: 0 },
];

function Page() {
  return (
    <>
      <PageHeader eyebrow="Admin" title="Consultants" description="Athena consultants managing scholar pipelines." />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONSULTANTS.map(c => (
          <div key={c.id} className="card-elev p-5" style={{ borderRadius: 4 }}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar initials={c.name.split(" ").map(p=>p[0]).join("")} color="var(--sky)" />
              <div className="flex-1">
                <div className="font-serif text-lg text-ink leading-tight">{c.name}</div>
                <div className="text-xs text-ink-muted">{c.email}</div>
              </div>
              <Badge className={c.active ? "badge-status-accepted" : "badge-status-expired"}>{c.active ? "active" : "inactive"}</Badge>
            </div>
            <div className="text-xs text-ink-muted mb-4">{c.scholars} assigned scholar{c.scholars===1?"":"s"}</div>
            <div className="flex gap-2 pt-3 border-t border-[#E4DFD3]">
              <button className="btn-ghost flex-1" onClick={() => toast.message("Reassign flow (mock)")}>Reassign scholars</button>
              <button className="btn-ghost" onClick={() => toast.success(c.active ? "Deactivated" : "Activated")}>{c.active ? "Deactivate" : "Activate"}</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
