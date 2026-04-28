import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join("").toUpperCase();
}

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff/1000);
  if (s < 60) return "just now";
  const m = Math.floor(s/60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h/24); return `${d}d ago`;
}
export function timeUntil(ts: number) {
  const diff = ts - Date.now();
  if (diff <= 0) return "expired";
  const h = Math.floor(diff / 3600000);
  if (h >= 24) return `${Math.floor(h/24)}d ${h%24}h left`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}
