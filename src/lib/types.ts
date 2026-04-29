export type Role = "consultant" | "mentor" | "scholar" | "admin";
export type Track = "Minerva" | "Pangea" | "Unassigned";
export type Feasibility = "High" | "Medium" | "Low";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  linkedScholarId?: string;
  linkedMentorId?: string;
}

export interface Scholar {
  id: string;
  name: string;
  grade: string;
  school: string;
  intendedMajor: string;
  interests: string[];
  pastProjects: string[];
  collegeTargets: string[];
  track: Track;
  linkedUserId?: string;
}

export interface Mentor {
  id: string;
  name: string;
  designation: string;
  organization: string;
  domains: string[];
  subExpertise: string[];
  track: Track | "Both";
  availabilityDays: string[];
  maxConcurrentScholars: number;
  mode: "Online" | "In-person" | "Hybrid";
  status: "active" | "on leave" | "inactive";
  bio: string;
  initials: string;
  linkedUserId?: string;
}

export interface Project {
  id: string;
  name: string;
  scholarId: string;
  scholarName: string;
  topic: string;
  track: Track;
  feasibility: Feasibility;
  description: string;
  timeline: string;
  gradeFit: string;
  impact: string;
  techStack: string[];
  learningOutcomes: string[];
  weekPath: { week: string; focus: string }[];
  status: "accepted" | "rejected";
  acceptedAt?: number;
  assignedMentorId?: string;
}

export interface MentorRequest {
  id: string;
  projectId: string;
  projectName: string;
  scholarId: string;
  scholarName: string;
  mentorId: string;
  sentDate: number;
  expiryDate: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "expired";
  rejectionReason?: string;
  acceptedBy?: string;
}

export interface Milestone {
  id: string;
  text: string;
  done: boolean;
}

export type WorkLogTag = "Research" | "Build" | "Testing" | "Writing" | "Mentor Session";
export type WorkLogStatus = "Completed" | "In Progress";

export interface WorkLogAttachment {
  id: string;
  name: string;
  size?: string;
}

export interface WorkLogComment {
  id: string;
  logId: string;
  userId: string;
  userName: string;
  role: "mentor" | "consultant";
  comment: string;
  timestamp: number;
}

export const IDEA_CATEGORIES = ["ML","IoT","Robotics","App","Website","Tech Research","Research","Other"] as const;
export type IdeaCategory = typeof IDEA_CATEGORIES[number];

export interface Idea {
  id: string;
  title: string;
  description: string;
  sourceLinks: string[];
  category: IdeaCategory;
  customCategory?: string;
  createdAt: number;
  createdBy: string;
}

export interface WorkLog {
  id: string;
  scholarId: string;
  projectId: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  description: string;
  hoursSpent: number;
  tags: WorkLogTag[];
  status: WorkLogStatus;
  attachments: WorkLogAttachment[];
  createdAt: number;
}
