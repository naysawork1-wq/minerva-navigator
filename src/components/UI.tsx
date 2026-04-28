import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD3] mb-6">
      <div>
        {eyebrow && <div className="text-xs uppercase tracking-[0.2em] text-teal mb-2">{eyebrow}</div>}
        <h1 className="font-serif text-4xl md:text-5xl text-ink leading-none">{title}</h1>
        {description && <p className="text-ink-muted mt-2 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: string; accent?: "teal"|"violet"|"gold"|"sky"|"rose" }) {
  const colorMap = {
    teal: "var(--teal)", violet: "var(--violet)", gold: "var(--gold)", sky: "var(--sky)", rose: "var(--rose)",
  } as const;
  return (
    <div className="card-elev p-5" style={{ borderRadius: 4 }}>
      <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">{label}</div>
      <div className="font-serif text-4xl mt-2 leading-none" style={{ color: accent ? colorMap[accent] : "var(--ink)" }}>{value}</div>
      {hint && <div className="text-xs text-ink-muted mt-2">{hint}</div>}
    </div>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] font-medium", className)} style={{ borderRadius: 2 }}>{children}</span>;
}

export function TrackBadge({ track }: { track: string }) {
  const cls = track === "Minerva" ? "badge-track-minerva" : track === "Pangea" ? "badge-track-pangea" : "badge-track-unassigned";
  return <Badge className={cls}>{track}</Badge>;
}

export function Tag({ children, onClick, active }: { children: ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} type="button"
      className={cn("inline-flex items-center text-xs font-medium px-3 py-1.5 border transition-all",
        active ? "bg-navy text-white border-navy" : "bg-white text-ink-soft border-[#E4DFD3] hover:border-ink-muted hover:bg-cream")}
      style={{ borderRadius: 2 }}>
      {children}
    </button>
  );
}

export function Avatar({ initials, size = 40, color = "var(--navy)" }: { initials: string; size?: number; color?: string }) {
  return (
    <div className="flex items-center justify-center text-white font-medium" style={{ width: size, height: size, background: color, borderRadius: 2, fontSize: size * 0.36, letterSpacing: "0.02em" }}>
      {initials}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-16 border border-dashed border-[#E4DFD3] bg-cream-soft" style={{ borderRadius: 4 }}>
      <div className="font-serif text-2xl text-ink-soft">{title}</div>
      {hint && <div className="text-sm text-ink-muted mt-2">{hint}</div>}
    </div>
  );
}
