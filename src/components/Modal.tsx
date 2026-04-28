import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, subtitle, children, maxWidth = "max-w-2xl" }:
  { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; maxWidth?: string; }) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0A1628]/55 backdrop-blur-sm anim-fade-up" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white border border-[#E4DFD3] shadow-2xl anim-fade-up max-h-[90vh] overflow-hidden flex flex-col`} style={{ borderRadius: 4 }}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#E4DFD3]">
          <div>
            <h3 className="font-serif text-2xl text-ink leading-tight">{title}</h3>
            {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-cream rounded-sm" aria-label="Close">
            <X className="w-4 h-4 text-ink-soft" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
