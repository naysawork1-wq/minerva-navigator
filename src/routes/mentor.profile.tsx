import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Avatar, Tag } from "@/components/UI";
import { useStore, updateMentor } from "@/lib/store";
import { EXPERTISE_TAGS, WEEK_DAYS } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/mentor/profile")({
  component: () => (<AuthGate allow={["mentor"]}><AppShell><Page/></AppShell></AuthGate>),
});

function Page() {
  const user = useStore(s => s.user);
  const mentor = useStore(s => s.mentors.find(m => m.id === user?.linkedMentorId));
  const [domains, setDomains] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [maxScholars, setMaxScholars] = useState(3);
  const [mode, setMode] = useState<"Online"|"In-person"|"Hybrid">("Hybrid");
  const [bio, setBio] = useState("");
  const [subExpertise, setSubExpertise] = useState("");

  useEffect(() => {
    if (!mentor) return;
    setDomains(mentor.domains); setDays(mentor.availabilityDays);
    setMaxScholars(mentor.maxConcurrentScholars); setMode(mentor.mode);
    setBio(mentor.bio); setSubExpertise(mentor.subExpertise.join(", "));
  }, [mentor]);

  if (!mentor) return null;

  function toggleArr(arr: string[], v: string, set: (a: string[]) => void) {
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  }

  function save() {
    updateMentor(mentor!.id, {
      domains, availabilityDays: days, maxConcurrentScholars: maxScholars, mode, bio,
      subExpertise: subExpertise.split(",").map(s => s.trim()).filter(Boolean),
    });
    toast.success("Profile updated");
  }

  return (
    <>
      <PageHeader eyebrow="Mentor workspace" title="My profile" description="Update your domain expertise and availability." />
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="card-elev p-5 h-fit" style={{ borderRadius: 4 }}>
          <div className="flex items-center gap-3 mb-4">
            <Avatar initials={mentor.initials} size={56} color="var(--violet)" />
            <div>
              <div className="font-serif text-xl text-ink">{mentor.name}</div>
              <div className="text-xs text-ink-muted">{mentor.designation}</div>
              <div className="text-xs text-ink-muted">{mentor.organization}</div>
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Status</div>
          <div className="text-sm text-ink-soft capitalize">{mentor.status}</div>
        </div>

        <div className="card-elev p-6 space-y-5" style={{ borderRadius: 4 }}>
          <Section label="Domain expertise">
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_TAGS.map(t => <Tag key={t} active={domains.includes(t)} onClick={() => toggleArr(domains, t, setDomains)}>{t}</Tag>)}
            </div>
          </Section>
          <Section label="Sub-expertise (comma separated)">
            <input className="input-base" value={subExpertise} onChange={e => setSubExpertise(e.target.value)} />
          </Section>
          <Section label="Availability days">
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map(d => <Tag key={d} active={days.includes(d)} onClick={() => toggleArr(days, d, setDays)}>{d}</Tag>)}
            </div>
          </Section>
          <div className="grid md:grid-cols-2 gap-4">
            <Section label="Max concurrent scholars">
              <input type="number" min={1} max={10} className="input-base" value={maxScholars} onChange={e => setMaxScholars(parseInt(e.target.value)||1)} />
            </Section>
            <Section label="Session mode">
              <select className="input-base" value={mode} onChange={e => setMode(e.target.value as any)}>
                <option>Online</option><option>In-person</option><option>Hybrid</option>
              </select>
            </Section>
          </div>
          <Section label="Bio">
            <textarea className="input-base" rows={4} value={bio} onChange={e => setBio(e.target.value)} />
          </Section>
          <div className="flex justify-end"><button className="btn-primary" onClick={save}>Save changes</button></div>
        </div>
      </div>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-2">{label}</label>
      {children}
    </div>
  );
}
