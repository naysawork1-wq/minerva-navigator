// localStorage-backed store. Structured so it can later swap to Supabase.
import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  DEMO_USERS, SEED_SCHOLARS, SEED_MENTORS, SEED_PROJECTS, SEED_REQUESTS, DEFAULT_MILESTONES,
  SEED_WORK_LOGS, SEED_WORK_LOG_COMMENTS, SEED_IDEAS,
} from "./mockData";
import type { Scholar, Mentor, Project, MentorRequest, User, Milestone, Track, WorkLog, WorkLogComment, Idea } from "./types";

const KEY = "minerva-store-v1";

interface State {
  user: User | null;
  scholars: Scholar[];
  mentors: Mentor[];
  projects: Project[];
  requests: MentorRequest[];
  milestonesByScholar: Record<string, Milestone[]>;
  workLogs: WorkLog[];
  workLogComments: WorkLogComment[];
  ideas: Idea[];
  airtable: { apiKey: string; baseId: string; tableName: string } | null;
  settings: {
    aiModel: string;
    maxProjectsPerGen: number;
    requestExpiryHours: number;
    notifyConsultantOnReject: boolean;
  };
}

const defaultState = (): State => ({
  user: null,
  scholars: SEED_SCHOLARS,
  mentors: SEED_MENTORS,
  projects: SEED_PROJECTS,
  requests: SEED_REQUESTS,
  milestonesByScholar: {},
  workLogs: SEED_WORK_LOGS,
  workLogComments: SEED_WORK_LOG_COMMENTS,
  ideas: SEED_IDEAS,
  airtable: null,
  settings: {
    aiModel: "gpt-4o-mini",
    maxProjectsPerGen: 3,
    requestExpiryHours: 48,
    notifyConsultantOnReject: true,
  },
});

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch { return defaultState(); }
}
function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function emit() { persist(); listeners.forEach(l => l()); }

export const store = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  set: (patch: Partial<State>) => { state = { ...state, ...patch }; emit(); },
  reset: () => { state = defaultState(); emit(); },
};

function shallowEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
    return true;
  }
  const ak = Object.keys(a), bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (!Object.is(a[k], b[k])) return false;
  return true;
}

export function useStore<T>(selector: (s: State) => T): T {
  const lastRef = useRef<{ has: boolean; value: T }>({ has: false, value: undefined as any });
  const getSnapshot = () => {
    const next = selector(store.get());
    if (lastRef.current.has && shallowEqual(lastRef.current.value, next)) {
      return lastRef.current.value;
    }
    lastRef.current = { has: true, value: next };
    return next;
  };
  return useSyncExternalStore(store.subscribe, getSnapshot, () => selector(defaultState()));
}

// --- Auth ---
export function login(email: string, password: string): User | null {
  const u = DEMO_USERS.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!u) return null;
  const { password: _p, ...user } = u;
  store.set({ user });
  return user;
}
export function logout() { store.set({ user: null }); }

// --- Scholars ---
export function addScholar(s: Omit<Scholar, "id">) {
  const sc: Scholar = { ...s, id: `s-${Date.now()}` };
  store.set({ scholars: [...state.scholars, sc] });
  return sc;
}
export function updateScholar(id: string, patch: Partial<Scholar>) {
  store.set({ scholars: state.scholars.map(s => s.id === id ? { ...s, ...patch } : s) });
}

// --- Mentors ---
export function addMentor(m: Omit<Mentor, "id" | "initials">) {
  const initials = m.name.split(" ").map(p => p[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
  const mn: Mentor = { ...m, id: `m-${Date.now()}`, initials };
  store.set({ mentors: [...state.mentors, mn] });
  return mn;
}
export function updateMentor(id: string, patch: Partial<Mentor>) {
  store.set({ mentors: state.mentors.map(m => m.id === id ? { ...m, ...patch } : m) });
}

// --- Projects ---
export function acceptProject(p: Omit<Project, "id" | "status" | "acceptedAt">) {
  const exists = state.projects.find(x => x.scholarId === p.scholarId && x.name === p.name && x.status === "accepted");
  if (exists) return exists;
  const proj: Project = { ...p, id: `p-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, status: "accepted", acceptedAt: Date.now() };
  store.set({ projects: [...state.projects, proj] });
  return proj;
}
export function rejectProjects(ps: Omit<Project, "id" | "status" | "acceptedAt">[]) {
  const rejected: Project[] = ps.map(p => ({ ...p, id: `p-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, status: "rejected" as const }));
  store.set({ projects: [...state.projects, ...rejected] });
}
export function updateProject(id: string, patch: Partial<Project>) {
  store.set({ projects: state.projects.map(p => p.id === id ? { ...p, ...patch } : p) });
}

// --- Mentor requests ---
export function sendMentorRequest(projectId: string, mentorId: string) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return null;
  const expiryHours = state.settings.requestExpiryHours;
  const req: MentorRequest = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    projectId, projectName: project.name,
    scholarId: project.scholarId, scholarName: project.scholarName,
    mentorId, sentDate: Date.now(),
    expiryDate: Date.now() + expiryHours * 3600 * 1000,
    status: "pending",
  };
  store.set({ requests: [...state.requests, req] });
  return req;
}
export function acceptRequest(id: string, mentorName: string) {
  const r = state.requests.find(x => x.id === id);
  if (!r) return;
  const updated = state.requests.map(x => {
    if (x.id === id) return { ...x, status: "accepted" as const, acceptedBy: mentorName };
    if (x.projectId === r.projectId && x.status === "pending") return { ...x, status: "withdrawn" as const };
    return x;
  });
  store.set({ requests: updated });
  updateProject(r.projectId, { assignedMentorId: r.mentorId });
}
export function rejectRequest(id: string, reason?: string) {
  store.set({
    requests: state.requests.map(x => x.id === id ? { ...x, status: "rejected", rejectionReason: reason } : x),
  });
}

// --- Milestones ---
export function getMilestones(scholarId: string): Milestone[] {
  return state.milestonesByScholar[scholarId] ?? DEFAULT_MILESTONES;
}
export function toggleMilestone(scholarId: string, milestoneId: string) {
  const cur = state.milestonesByScholar[scholarId] ?? DEFAULT_MILESTONES;
  const next = cur.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m);
  store.set({ milestonesByScholar: { ...state.milestonesByScholar, [scholarId]: next } });
}

// --- Work logs ---
export function addWorkLog(log: Omit<WorkLog, "id" | "createdAt">) {
  const w: WorkLog = { ...log, id: `wl-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, createdAt: Date.now() };
  store.set({ workLogs: [...state.workLogs, w] });
  return w;
}
export function updateWorkLog(id: string, patch: Partial<WorkLog>) {
  store.set({ workLogs: state.workLogs.map(w => w.id === id ? { ...w, ...patch } : w) });
}
export function deleteWorkLog(id: string) {
  store.set({
    workLogs: state.workLogs.filter(w => w.id !== id),
    workLogComments: state.workLogComments.filter(c => c.logId !== id),
  });
}
export function addWorkLogComment(c: Omit<WorkLogComment, "id" | "timestamp">) {
  const cm: WorkLogComment = { ...c, id: `wlc-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, timestamp: Date.now() };
  store.set({ workLogComments: [...state.workLogComments, cm] });
  return cm;
}
export function projectProgressFromLogs(projectId: string): number {
  const total = state.workLogs.filter(w => w.projectId === projectId).length;
  return Math.min(100, Math.round((total / 20) * 100));
}

// --- Settings / airtable ---
export function setAirtable(cfg: State["airtable"]) { store.set({ airtable: cfg }); }
export function setSettings(patch: Partial<State["settings"]>) {
  store.set({ settings: { ...state.settings, ...patch } });
}

export function setScholarTrack(id: string, track: Track) { updateScholar(id, { track }); }

// hydrate trigger (keeps SSR safe)
export function useHydrate() {
  useEffect(() => { state = load(); listeners.forEach(l => l()); }, []);
}
