import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { login, useHydrate, useStore } from "@/lib/store";
import { roleHome } from "@/components/AuthGate";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

const DEMO = [
  { role: "Admin", email: "admin@athenaeducation.co.in", password: "admin2024" },
  { role: "Consultant", email: "consultant@athenaeducation.co.in", password: "minerva2024" },
  { role: "Mentor", email: "mentor@athenaeducation.co.in", password: "minerva2024" },
  { role: "Scholar", email: "scholar@athenaeducation.co.in", password: "minerva2024" },
];

function LoginPage() {
  useHydrate();
  const user = useStore(s => s.user);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: roleHome(user.role) as any }); }, [user, navigate]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const u = login(email, password);
      setLoading(false);
      if (!u) { toast.error("Invalid credentials"); return; }
      toast.success(`Welcome, ${u.name}`);
      navigate({ to: roleHome(u.role) as any });
    }, 350);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left */}
      <div className="bg-navy text-white relative overflow-hidden flex flex-col justify-between p-8 md:p-14 min-h-[40vh] lg:min-h-screen">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal flex items-center justify-center font-serif text-xl" style={{ borderRadius: 2 }}>A</div>
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">Athena Education</div>
            <div className="font-serif text-lg">Minerva · Pangea</div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg anim-fade-up">
          <div className="text-[11px] uppercase tracking-[0.24em] text-teal-bright mb-5">Internal ideation engine</div>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05]">The ideation engine for scholars.</h1>
          <p className="mt-5 text-white/70 leading-relaxed text-[15px] max-w-md">
            AI-powered project ideation, mentor allocation, and scholar tracking — all in one platform for the Minerva &amp; Pangea programs.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { v: "900+", l: "Admits in 2024" },
              { v: "70+", l: "Expert mentors" },
              { v: "21", l: "Countries" },
            ].map(s => (
              <div key={s.l}>
                <div className="font-serif text-4xl text-white">{s.v}</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/50 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-white/40 uppercase tracking-[0.18em]">© Athena Education · Internal use only</div>

        {/* Decorative */}
        <div className="absolute -right-24 -bottom-24 w-[360px] h-[360px] rounded-full" style={{ background: "radial-gradient(circle, rgba(13,168,130,0.18), transparent 70%)" }} />
        <div className="absolute right-12 top-32 w-[180px] h-[180px] rounded-full" style={{ background: "radial-gradient(circle, rgba(27,114,204,0.15), transparent 70%)" }} />
      </div>

      {/* Right */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-cream-soft">
        <div className="w-full max-w-md">
          <div className="card-elev p-8 md:p-10 anim-fade-up" style={{ borderRadius: 4 }}>
            <h2 className="font-serif text-3xl text-ink">Sign in</h2>
            <p className="text-ink-muted text-sm mt-1">Use a demo account to explore the platform.</p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Email</label>
                <input className="input-base" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@athenaeducation.co.in" required />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">Password</label>
                <input className="input-base" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-2 px-1">Demo accounts</div>
            <div className="space-y-1.5">
              {DEMO.map(d => (
                <button key={d.role} type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.password); }}
                  className="w-full flex items-center justify-between bg-white border border-[#E4DFD3] hover:border-teal hover:bg-cream px-4 py-3 transition-colors text-left"
                  style={{ borderRadius: 2 }}>
                  <div>
                    <div className="text-sm text-ink font-medium">{d.role}</div>
                    <div className="text-[11px] text-ink-muted font-mono">{d.email}</div>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-teal">Autofill →</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
