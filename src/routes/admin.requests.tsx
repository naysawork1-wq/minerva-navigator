import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatCard, Badge, Empty } from "@/components/UI";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/requests")({
  component: () => (<AuthGate allow={["admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const requests = useStore(s => s.requests);
  const mentors = useStore(s => s.mentors);
  const counts = ["pending","accepted","rejected","expired","withdrawn"].map(s => ({ s, n: requests.filter(r => r.status === s).length }));

  return (
    <>
      <PageHeader eyebrow="Admin" title="Mentor request log" description="Audit log of all consultant → mentor allocation requests." />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {counts.map(c => <StatCard key={c.s} label={c.s} value={c.n} />)}
      </div>
      {requests.length === 0 ? <Empty title="No requests yet" /> : (
        <div className="card-elev overflow-x-auto" style={{ borderRadius: 4 }}>
          <table className="w-full text-sm">
            <thead className="bg-cream text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              <tr><th className="text-left px-4 py-3">Project</th><th className="text-left px-4 py-3">Scholar</th><th className="text-left px-4 py-3">Mentor</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Sent</th></tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const m = mentors.find(x => x.id === r.mentorId);
                return (
                  <tr key={r.id} className="border-t border-[#E4DFD3]">
                    <td className="px-4 py-3 text-ink">{r.projectName}</td>
                    <td className="px-4 py-3 text-ink-soft">{r.scholarName}</td>
                    <td className="px-4 py-3 text-ink-soft">{m?.name ?? "—"}</td>
                    <td className="px-4 py-3"><Badge className={`badge-status-${r.status}`}>{r.status}</Badge></td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{timeAgo(r.sentDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
