import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, StatCard, TrackBadge, Badge } from "@/components/UI";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: () => (<AuthGate allow={["admin"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const { scholars, mentors, projects, requests } = useStore(s => ({ scholars: s.scholars, mentors: s.mentors, projects: s.projects, requests: s.requests }));
  const accepted = projects.filter(p => p.status === "accepted").length;
  const pending = requests.filter(r => r.status === "pending").length;
  const tracks = ["Minerva","Pangea","Unassigned"].map(t => ({ t, n: scholars.filter(s => s.track === t).length }));
  const reqStats = ["accepted","pending","rejected","expired"].map(s => ({ s, n: requests.filter(r => r.status === s).length }));

  const recent = [...projects].sort((a,b) => (b.acceptedAt ?? 0) - (a.acceptedAt ?? 0)).slice(0,6);

  return (
    <>
      <PageHeader eyebrow="Admin" title="Operations dashboard" description="Live overview of the Minerva and Pangea pipeline." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Scholars" value={scholars.length} accent="teal" />
        <StatCard label="Mentors" value={mentors.length} accent="violet" />
        <StatCard label="Accepted projects" value={accepted} accent="sky" />
        <StatCard label="Pending requests" value={pending} accent="gold" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card-elev p-6" style={{ borderRadius: 4 }}>
          <h3 className="font-serif text-2xl text-ink mb-4">Track breakdown</h3>
          {tracks.map(t => (
            <div key={t.t} className="mb-3 last:mb-0">
              <div className="flex justify-between text-sm mb-1"><TrackBadge track={t.t} /><span className="text-ink-soft">{t.n}</span></div>
              <div className="h-2 bg-cream" style={{ borderRadius: 2 }}>
                <div className="h-full bg-teal" style={{ width: `${scholars.length ? (t.n/scholars.length)*100 : 0}%`, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card-elev p-6" style={{ borderRadius: 4 }}>
          <h3 className="font-serif text-2xl text-ink mb-4">Mentor request status</h3>
          {reqStats.map(r => (
            <div key={r.s} className="flex items-center justify-between py-2 border-b border-[#E4DFD3] last:border-0">
              <Badge className={`badge-status-${r.s}`}>{r.s}</Badge>
              <span className="text-sm text-ink-soft">{r.n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elev p-6" style={{ borderRadius: 4 }}>
        <h3 className="font-serif text-2xl text-ink mb-4">Recent activity</h3>
        {recent.length === 0 ? <p className="text-sm text-ink-muted">No activity yet.</p> : (
          <ul className="divide-y divide-[#E4DFD3]">
            {recent.map(p => (
              <li key={p.id} className="py-3 flex items-center justify-between text-sm">
                <div><strong className="text-ink">{p.name}</strong> <span className="text-ink-muted">· {p.scholarName}</span></div>
                <div className="text-xs text-ink-muted">{p.acceptedAt ? timeAgo(p.acceptedAt) : "—"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
