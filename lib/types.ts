export interface ProjectItem {
  id?: string;
  title: string;
  stack?: string[];
  shipped?: boolean;
  gh_url?: string;
  live_url?: string;
  description?: string;
  level?: string;
  stretch?: string;
  status?: 'done' | 'active' | 'locked';
}

export interface InternshipItem {
  id?: string;
  title: string;
  company: string;
  start: string;
  end?: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  account_type: 'student' | 'recruiter';
  degree: string;
  year: string;
  region: string;
  interest: string;
  free_hours: number;
  gh_username?: string | null;
  projects_done: number;
  visibility: 'public' | 'recruiter' | 'private';
  roadmap_completions: Record<string, boolean>;
  syllabus: Record<string, string[]>;
  google_verified: boolean;
  onboarded: boolean;
  // Recruiter
  company?: string;
  title?: string;
  linkedin?: string;
  verified?: boolean;
  verification_checks?: { email: boolean; linkedin: boolean; google: boolean };
  // Joined from related tables
  skills: string[];
  project_list: ProjectItem[];
  internships: InternshipItem[];
}

export interface ComputedProfile {
  role: string;
  pct: {
    Programming: number;
    DSA: number;
    Databases: number;
    Projects: number;
    'Interview Skills': number;
  };
  readiness: number;
  shortlistProb: number;
  shortlistAfter: number;
  demand: string[];
  missing: string[];
  matched: string[];
  shipped: number;
}

export interface SeedPeer {
  name: string;
  year: number;
  region: string;
  role: string;
  skills: string[];
  projects: number;
  gh?: string;
  readiness: number;
  degree?: string;
  availability?: string;
  email?: string;
  visibility?: 'public' | 'recruiter' | 'private';
  isMe?: boolean;
}
