import { SKILL_CATALOG, INTERESTS, PROJECT_TEMPLATES } from './constants';
import type { UserProfile, ComputedProfile } from './types';

export function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function computeProfile(user: UserProfile): ComputedProfile {
  const demand = (INTERESTS[user.interest] || {}).demand || [];
  const role = (INTERESTS[user.interest] || {}).role || 'Engineer';
  const owned = new Set(user.skills);

  const buckets: Record<string, number> = { Programming: 0, DSA: 0, Databases: 0, Projects: 0, 'Interview Skills': 0 };
  const bucketMax: Record<string, number> = { Programming: 0, DSA: 0, Databases: 0, Projects: 0, 'Interview Skills': 0 };

  Object.entries(SKILL_CATALOG).forEach(([, bs]) => bs.forEach(b => { bucketMax[b] = (bucketMax[b] || 0) + 1; }));
  user.skills.forEach(sk => (SKILL_CATALOG[sk] || []).forEach(b => { buckets[b] = (buckets[b] || 0) + 1; }));

  const shipped = user.projects_done || 0;

  const pct = {
    Programming: clampPct((buckets.Programming / Math.max(1, bucketMax.Programming)) * 130),
    DSA: clampPct((buckets.DSA / Math.max(1, bucketMax.DSA)) * 110 + (user.skills.includes('DSA') ? 18 : 0)),
    Databases: clampPct((buckets.Databases / Math.max(1, bucketMax.Databases)) * 150),
    Projects: clampPct(shipped * 16 + (buckets.Projects / Math.max(1, bucketMax.Projects)) * 40),
    'Interview Skills': clampPct(shipped * 6 + (user.skills.includes('DSA') ? 14 : 4) + ((user.internships?.length ?? 0) ? 18 : 0)),
  };

  const covered = demand.filter(d => owned.has(d)).length;
  const demandCov = demand.length ? covered / demand.length : 0;
  const compAvg = (pct.Programming + pct.DSA + pct.Databases + pct.Projects + pct['Interview Skills']) / 5;
  const readiness = clampPct(demandCov * 55 + compAvg * 0.45);

  const shortlistProb = clampPct(readiness * 0.42 + shipped * 1.5);
  const shortlistAfter = clampPct(shortlistProb + 19 + (demand.length - covered) * 1.5);

  const missing = demand.filter(d => !owned.has(d));
  const matched = demand.filter(d => owned.has(d));

  return { role, pct, readiness, shortlistProb, shortlistAfter, demand, missing, matched, shipped };
}

export function buildBuckets(user: UserProfile, prof: ComputedProfile) {
  const owned = new Set(user.skills);
  const gold = prof.demand.filter(d => owned.has(d)).slice(0, 5);
  const missing = prof.missing.slice(0, 6);
  const examOnly = ['Engineering Physics', 'Discrete Mathematics (theory)', 'Technical Writing', 'Engineering Economics'];
  return [
    { bucket: 'Career Gold — go deep', color: '#4f46e5', sub: "You have it AND it's in demand", items: gold.length ? gold : ['(add skills to populate)'] },
    { bucket: 'Exam-only — do enough', color: '#d97706', sub: "Pass the exam, don't over-invest", items: examOnly },
    { bucket: 'Missing from degree — learn on the side', color: '#e11d62', sub: "High demand, you don't have it yet", items: missing.length ? missing : ["You're covering the in-demand skills!"] },
  ];
}

function yearNum(year: string): number {
  const match = year.match(/(\d+)/);
  if (!match) return 1;
  const n = Number(match[1]);
  return Number.isNaN(n) ? 1 : n;
}

export function buildRoadmap(user: UserProfile, prof: ComputedProfile) {
  const owned = new Set(user.skills);
  const m = prof.missing;
  const completions = user.roadmap_completions || {};
  const yn = yearNum(user.year);

  const sem1 = [
    { t: 'Master core DSA: arrays, hashing, two-pointers', done: completions['dsa'] ?? owned.has('DSA') },
    { t: `Build a real project in ${prof.role.split(' ')[0]} stack`, done: completions['first_project'] ?? (user.projects_done || 0) > 0 },
    { t: 'Learn Git/GitHub workflow properly', done: completions['git'] ?? owned.has('Git') },
    { t: "Ship this month's project", done: completions['ship_month'] ?? false },
  ];
  const sem2 = m.slice(0, 3).map((sk, i) => ({ t: `Learn ${sk}`, done: completions[`gap_${i}`] ?? false }));
  if (sem2.length === 0) sem2.push({ t: 'Deepen system design fundamentals', done: completions['system_design'] ?? false });
  const y3 = [
    { t: 'Distributed systems / scale intro', done: completions['distributed'] ?? false },
    { t: 'Open-source contribution streak', done: completions['oss'] ?? false },
    { t: 'Mock interviews + behavioral prep', done: completions['mock_interviews'] ?? false },
  ];

  return [
    { sem: `This Semester (Y${yn} · S1)`, state: 'active', items: sem1 },
    { sem: `Next Semester (Y${yn} · S2)`, state: 'upcoming', items: sem2 },
    { sem: yn >= 4 ? 'Final Push' : `Year ${yn + 1}`, state: 'locked', items: y3 },
  ];
}

export function buildProjects(user: UserProfile, prof: ComputedProfile) {
  const tmpl = PROJECT_TEMPLATES[prof.role] || PROJECT_TEMPLATES['Backend Engineer'];
  const done = user.projects_done || 0;
  return tmpl.map((p, i) => ({
    ...p,
    m: `Month ${i + 1}`,
    status: (i < done ? 'done' : i === done ? 'active' : 'locked') as 'done' | 'active' | 'locked',
  }));
}

export function buildProgress(user: UserProfile, prof: ComputedProfile) {
  const skills = Math.round((prof.pct.Programming + prof.pct.DSA + prof.pct.Databases) / 3);
  const totalProjects = (PROJECT_TEMPLATES[prof.role] || []).length || 6;
  const projects = clampPct(((user.projects_done || 0) / totalProjects) * 100);
  const experience = clampPct((user.internships?.length || 0) * 35 + (user.projects_done || 0) * 4);
  const networking = clampPct((user.gh_username ? 30 : 0) + ((user.internships?.length || 0) ? 25 : 0) + 35);
  const overall = clampPct(skills * 0.4 + projects * 0.25 + experience * 0.2 + networking * 0.15);
  return {
    overall,
    pillars: [
      { k: 'Skills', v: skills, c: '#4f46e5' },
      { k: 'Projects', v: projects, c: '#0d9488' },
      { k: 'Experience', v: experience, c: '#7c3aed' },
      { k: 'Networking', v: networking, c: '#d97706' },
    ],
  };
}

export function timeToGoal(user: UserProfile, prof: ComputedProfile): string {
  const projLeft = Math.max(0, ((PROJECT_TEMPLATES[prof.role] || []).length || 6) - (user.projects_done || 0));
  const hrsNeeded = prof.missing.length * 35 + projLeft * 25;
  const weeks = Math.max(4, Math.round(hrsNeeded / Math.max(3, user.free_hours)));
  const months = Math.round(weeks / 4.3);
  const yrs = Math.floor(months / 12), rem = months % 12;
  if (months <= 0) return 'Ready now';
  if (yrs === 0) return `${rem} month${rem !== 1 ? 's' : ''}`;
  return `${yrs} year${yrs !== 1 ? 's' : ''}${rem ? ` ${rem} month${rem !== 1 ? 's' : ''}` : ''}`;
}

export function nextAction(user: UserProfile, prof: ComputedProfile): string {
  if (prof.missing.length) return `Learn ${prof.missing[0]}`;
  const proj = buildProjects(user, prof).find(p => p.status === 'active');
  if (proj) return `Ship ${proj.title}`;
  if (!(user.internships?.length)) return 'Apply for an internship';
  return 'Start mock interviews';
}

export function careerDNA(user: UserProfile, prof: ComputedProfile) {
  const owned = new Set(user.skills);
  const shipped = user.projects_done || 0;
  const interns = user.internships?.length || 0;
  const buildSkills = ['Node.js', 'React', 'Docker', 'REST APIs', 'Express', 'Kubernetes', 'CI/CD', 'HTML/CSS'].filter(s => owned.has(s)).length;
  const analySkills = ['DSA', 'Algorithms', 'System Design', 'PostgreSQL', 'MySQL', 'MongoDB', 'Pandas', 'Machine Learning'].filter(s => owned.has(s)).length;
  const innoSkills = ['Machine Learning', 'TensorFlow', 'System Design', 'GraphQL', 'Go'].filter(s => owned.has(s)).length;

  const Builder = clampPct(shipped * 11 + buildSkills * 7 + 22);
  const Analyst = clampPct(analySkills * 9 + prof.pct.DSA * 0.3 + 18);
  const Innovator = clampPct(innoSkills * 10 + shipped * 4 + 30);
  const Collaborator = clampPct(interns * 18 + (user.gh_username ? 20 : 0) + 34);
  const Leader = clampPct(interns * 14 + shipped * 5 + 28);

  const traits = [
    { k: 'Builder', v: Builder }, { k: 'Analyst', v: Analyst }, { k: 'Innovator', v: Innovator },
    { k: 'Collaborator', v: Collaborator }, { k: 'Leader', v: Leader },
  ].sort((a, b) => b.v - a.v);

  const top = traits[0].k;
  const rolePools: Record<string, string[]> = {
    Builder: [prof.role, 'Full-Stack Engineer', 'Platform Engineer'],
    Analyst: [prof.role, 'Data / ML Engineer', 'Backend Engineer'],
    Innovator: ['AI Engineer', prof.role, 'Startup Founder'],
    Collaborator: [prof.role, 'Product Engineer', 'Solutions Engineer'],
    Leader: ['Tech Lead', 'Product Engineer', 'Startup Founder'],
  };
  const roles = Array.from(new Set(rolePools[top])).slice(0, 3);
  return { traits, roles, top };
}

export function buildRoute(user: UserProfile, prof: ComputedProfile) {
  const owned = new Set(user.skills);
  const steps: Array<{ label: string; status: string }> = [
    { label: `Year ${user.year} ${user.degree.replace('B.Tech ', '').replace('B.Sc ', '')}`, status: 'start' },
  ];
  const founds = ['Python', 'Git', 'DSA'].filter(s => owned.has(s)).slice(0, 2);
  founds.forEach(s => steps.push({ label: s, status: 'done' }));
  const miss = prof.missing.slice(0, 3);
  if (miss[0]) steps.push({ label: miss[0], status: 'active' });
  if (miss[1]) steps.push({ label: miss[1], status: 'upcoming' });
  steps.push({ label: 'Build portfolio project', status: (user.projects_done || 0) >= 4 ? 'done' : 'upcoming' });
  steps.push({ label: 'Internship', status: (user.internships?.length || 0) ? 'done' : 'upcoming' });
  steps.push({ label: prof.role, status: 'goal' });
  return steps;
}
