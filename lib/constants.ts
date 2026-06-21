import type { SeedPeer } from './types';

export const SKILL_CATALOG: Record<string, string[]> = {
  'Python': ['Programming'], 'JavaScript': ['Programming'], 'Java': ['Programming'], 'C++': ['Programming'],
  'Go': ['Programming'], 'TypeScript': ['Programming'],
  'Node.js': ['Programming', 'Projects'], 'React': ['Programming', 'Projects'], 'Express': ['Projects'],
  'DSA': ['DSA'], 'Algorithms': ['DSA'],
  'PostgreSQL': ['Databases'], 'MySQL': ['Databases'], 'MongoDB': ['Databases'], 'SQLite': ['Databases'], 'Redis': ['Databases'],
  'REST APIs': ['Projects'], 'GraphQL': ['Projects'], 'Docker': ['Projects'], 'Kubernetes': ['Projects'],
  'AWS': ['Projects'], 'GCP': ['Projects'], 'CI/CD': ['Projects'], 'Git': ['Projects'],
  'System Design': ['DSA', 'Projects'], 'JWT Auth': ['Projects'],
  'Machine Learning': ['Programming', 'Projects'], 'Pandas': ['Programming'], 'TensorFlow': ['Projects'],
  'HTML/CSS': ['Programming'], 'Figma': ['Projects'], 'Linux': ['Projects'],
};

export const ALL_SKILLS = Object.keys(SKILL_CATALOG);

export const INTERESTS: Record<string, { role: string; demand: string[] }> = {
  'Backend Engineering': {
    role: 'Backend Engineer',
    demand: ['DSA', 'PostgreSQL', 'Node.js', 'REST APIs', 'Docker', 'System Design', 'Redis', 'AWS', 'Git'],
  },
  'Frontend Engineering': {
    role: 'Frontend Engineer',
    demand: ['JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'REST APIs', 'Git', 'System Design'],
  },
  'Full-Stack': {
    role: 'Full-Stack Engineer',
    demand: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Docker', 'Git', 'System Design'],
  },
  'Data / ML': {
    role: 'Data / ML Engineer',
    demand: ['Python', 'Pandas', 'Machine Learning', 'TensorFlow', 'PostgreSQL', 'DSA', 'AWS'],
  },
  'DevOps / Cloud': {
    role: 'DevOps Engineer',
    demand: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Git', 'System Design'],
  },
  'Cybersecurity': {
    role: 'Security Engineer',
    demand: ['Linux', 'Python', 'System Design', 'Git', 'DSA'],
  },
};

export const PROJECT_TEMPLATES: Record<string, Array<{
  title: string; level: string; stack: string[]; stretch: string;
}>> = {
  'Backend Engineer': [
    { title: 'CLI To-Do Manager', level: 'Foundations', stack: ['Python', 'File I/O'], stretch: 'JSON persistence' },
    { title: 'Personal Finance Tracker', level: 'Foundations+', stack: ['Python', 'SQLite'], stretch: 'Basic charts' },
    { title: 'Weather Dashboard (API)', level: 'Intermediate', stack: ['JS', 'REST APIs'], stretch: 'Caching layer' },
    { title: 'Auth Microservice', level: 'Intermediate', stack: ['Node.js', 'PostgreSQL', 'JWT Auth'], stretch: 'Rate limiting' },
    { title: 'URL Shortener at Scale', level: 'Intermediate+', stack: ['Node.js', 'Redis'], stretch: 'Analytics' },
    { title: 'Job Queue + Worker Pool', level: 'Advanced', stack: ['Node.js', 'Redis', 'Docker'], stretch: 'Retries & DLQ' },
  ],
  'Frontend Engineer': [
    { title: 'Responsive Portfolio Site', level: 'Foundations', stack: ['HTML/CSS', 'JavaScript'], stretch: 'Dark mode' },
    { title: 'Weather Widget (API)', level: 'Foundations+', stack: ['JavaScript', 'REST APIs'], stretch: 'Geolocation' },
    { title: 'Todo App with State', level: 'Intermediate', stack: ['React'], stretch: 'Local persistence' },
    { title: 'Movie Search w/ Pagination', level: 'Intermediate', stack: ['React', 'REST APIs'], stretch: 'Infinite scroll' },
    { title: 'Kanban Board (DnD)', level: 'Intermediate+', stack: ['React', 'TypeScript'], stretch: 'Multi-user' },
    { title: 'Design-System Component Lib', level: 'Advanced', stack: ['React', 'TypeScript'], stretch: 'Storybook' },
  ],
  'Full-Stack Engineer': [
    { title: 'CLI Notes App', level: 'Foundations', stack: ['Python', 'File I/O'], stretch: 'Tags' },
    { title: 'Blog with REST API', level: 'Foundations+', stack: ['Node.js', 'SQLite'], stretch: 'Comments' },
    { title: 'React + API Dashboard', level: 'Intermediate', stack: ['React', 'REST APIs'], stretch: 'Charts' },
    { title: 'Auth + CRUD App', level: 'Intermediate', stack: ['Node.js', 'PostgreSQL', 'React'], stretch: 'Roles' },
    { title: 'Realtime Chat', level: 'Intermediate+', stack: ['Node.js', 'React', 'Redis'], stretch: 'Typing indicator' },
    { title: 'Multi-tenant SaaS Starter', level: 'Advanced', stack: ['Node.js', 'PostgreSQL', 'Docker'], stretch: 'Billing' },
  ],
  'Data / ML Engineer': [
    { title: 'CSV Data Cleaner', level: 'Foundations', stack: ['Python', 'Pandas'], stretch: 'CLI flags' },
    { title: 'EDA Notebook', level: 'Foundations+', stack: ['Python', 'Pandas'], stretch: 'Plots' },
    { title: 'Linear Regression from Scratch', level: 'Intermediate', stack: ['Python'], stretch: 'Gradient descent' },
    { title: 'Spam Classifier', level: 'Intermediate', stack: ['Python', 'Machine Learning'], stretch: 'Cross-val' },
    { title: 'Image Classifier (CNN)', level: 'Intermediate+', stack: ['Python', 'TensorFlow'], stretch: 'Augmentation' },
    { title: 'ML Model API', level: 'Advanced', stack: ['Python', 'REST APIs', 'Docker'], stretch: 'Monitoring' },
  ],
  'DevOps Engineer': [
    { title: 'Bash Backup Script', level: 'Foundations', stack: ['Linux'], stretch: 'Cron schedule' },
    { title: 'Dockerize a Web App', level: 'Foundations+', stack: ['Docker'], stretch: 'Multi-stage' },
    { title: 'CI Pipeline (GitHub Actions)', level: 'Intermediate', stack: ['CI/CD', 'Git'], stretch: 'Test gates' },
    { title: 'Compose Multi-service Stack', level: 'Intermediate', stack: ['Docker', 'PostgreSQL'], stretch: 'Healthchecks' },
    { title: 'Deploy to Cloud (IaC)', level: 'Intermediate+', stack: ['AWS', 'Docker'], stretch: 'Terraform' },
    { title: 'K8s Cluster + Autoscale', level: 'Advanced', stack: ['Kubernetes', 'AWS'], stretch: 'Helm charts' },
  ],
  'Security Engineer': [
    { title: 'Password Strength Checker', level: 'Foundations', stack: ['Python'], stretch: 'Entropy score' },
    { title: 'Port Scanner', level: 'Foundations+', stack: ['Python', 'Linux'], stretch: 'Service detect' },
    { title: 'JWT Auth + Hardening', level: 'Intermediate', stack: ['System Design', 'Git'], stretch: 'Refresh tokens' },
    { title: 'Vulnerability Scanner (basic)', level: 'Intermediate', stack: ['Python', 'Linux'], stretch: 'Report export' },
    { title: 'Rate-Limited API Gateway', level: 'Intermediate+', stack: ['System Design'], stretch: 'WAF rules' },
    { title: 'Threat-Modeling Toolkit', level: 'Advanced', stack: ['System Design', 'Python'], stretch: 'STRIDE map' },
  ],
};

export const SEED_PEERS: SeedPeer[] = [
  { name: 'Priya Sharma', year: 2, region: 'Bengaluru', role: 'Backend Engineer', skills: ['Node.js', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs', 'System Design'], projects: 5, gh: 'priya-codes', readiness: 58, degree: 'B.Tech CSE', availability: 'Summer intern', email: 'priya.sharma@nita.ac.in', visibility: 'recruiter' },
  { name: 'Rohan Iyer', year: 3, region: 'Pune', role: 'Full-Stack Engineer', skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'DSA'], projects: 8, gh: 'rohan-dev', readiness: 71, degree: 'B.Tech IT', availability: 'Open to offers', email: 'rohan.iyer@coep.ac.in', visibility: 'public' },
  { name: 'Sneha Gupta', year: 4, region: 'Hyderabad', role: 'Backend Engineer', skills: ['Python', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'System Design', 'DSA'], projects: 11, gh: 'snehag', readiness: 80, degree: 'B.Tech CSE', availability: 'Full-time \'26', email: 'sneha.g@iiith.ac.in', visibility: 'public' },
  { name: 'Karan Verma', year: 2, region: 'Delhi', role: 'Data / ML Engineer', skills: ['Python', 'Pandas', 'Machine Learning', 'PostgreSQL'], projects: 4, gh: 'karanv', readiness: 44, degree: 'B.Sc CS', availability: 'Summer intern', email: 'karan.verma@du.ac.in', visibility: 'recruiter' },
  { name: 'Meera Nair', year: 3, region: 'Bengaluru', role: 'Backend Engineer', skills: ['Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'Redis'], projects: 7, gh: 'meera-n', readiness: 66, degree: 'B.Tech CSE', availability: 'Open to offers', email: 'meera.nair@pesu.edu', visibility: 'public' },
  { name: 'Aditya Rao', year: 2, region: 'Bengaluru', role: 'Frontend Engineer', skills: ['React', 'JavaScript', 'HTML/CSS', 'TypeScript'], projects: 5, gh: 'aditya-r', readiness: 52, degree: 'BCA', availability: 'Summer intern', email: 'aditya.rao@christuniversity.in', visibility: 'recruiter' },
  { name: 'Fatima Khan', year: 3, region: 'Mumbai', role: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'], projects: 9, gh: 'fatima-k', readiness: 74, degree: 'B.Tech IT', availability: 'Open to offers', email: 'fatima.k@vjti.ac.in', visibility: 'public' },
  { name: 'Arjun Menon', year: 4, region: 'Chennai', role: 'Backend Engineer', skills: ['Python', 'PostgreSQL', 'Redis', 'System Design', 'Docker', 'DSA', 'AWS'], projects: 10, gh: 'arjun-m', readiness: 77, degree: 'B.Tech CSE', availability: 'Full-time \'26', email: 'arjun.menon@ssn.edu.in', visibility: 'public' },
  { name: 'Ishaan Bose', year: 2, region: 'Pune', role: 'Data / ML Engineer', skills: ['Python', 'Pandas', 'Machine Learning', 'TensorFlow', 'PostgreSQL'], projects: 6, gh: 'ishaan-b', readiness: 61, degree: 'B.Tech CSE', availability: 'Summer intern', email: 'ishaan.bose@mitwpu.edu.in', visibility: 'private' },
];

export const OPPORTUNITIES: Record<string, Array<{ t: string; type: string; ic: string }>> = {
  'Backend Engineer': [
    { t: 'Backend Engineering Internship', type: 'Internship', ic: 'Briefcase' },
    { t: 'PostgreSQL / System Design cert', type: 'Certification', ic: 'Award' },
    { t: 'Backend Scalability Hackathon', type: 'Hackathon', ic: 'Zap' },
    { t: 'Contribute to an open-source API', type: 'Open Source', ic: 'Github' },
  ],
  'Frontend Engineer': [
    { t: 'Frontend Developer Internship', type: 'Internship', ic: 'Briefcase' },
    { t: 'Advanced React certification', type: 'Certification', ic: 'Award' },
    { t: 'UI/UX Design Hackathon', type: 'Hackathon', ic: 'Zap' },
    { t: 'Open-source component library', type: 'Open Source', ic: 'Github' },
  ],
  'Full-Stack Engineer': [
    { t: 'Full-Stack Internship', type: 'Internship', ic: 'Briefcase' },
    { t: 'Cloud fundamentals certification', type: 'Certification', ic: 'Award' },
    { t: 'Build-a-SaaS Hackathon', type: 'Hackathon', ic: 'Zap' },
    { t: 'Open-source full-stack starter', type: 'Open Source', ic: 'Github' },
  ],
  'Data / ML Engineer': [
    { t: 'AI/ML Internship Opportunity', type: 'Internship', ic: 'Briefcase' },
    { t: 'Machine Learning certification', type: 'Certification', ic: 'Award' },
    { t: 'Machine Learning Hackathon', type: 'Hackathon', ic: 'Zap' },
    { t: 'Kaggle Beginner Competition', type: 'Competition', ic: 'TrendingUp' },
  ],
  'DevOps Engineer': [
    { t: 'DevOps / SRE Internship', type: 'Internship', ic: 'Briefcase' },
    { t: 'AWS / Kubernetes certification', type: 'Certification', ic: 'Award' },
    { t: 'Cloud Infra Hackathon', type: 'Hackathon', ic: 'Zap' },
    { t: 'Contribute to a CNCF project', type: 'Open Source', ic: 'Github' },
  ],
  'Security Engineer': [
    { t: 'Security Analyst Internship', type: 'Internship', ic: 'Briefcase' },
    { t: 'Security+ certification', type: 'Certification', ic: 'Award' },
    { t: 'Capture The Flag (CTF) event', type: 'Competition', ic: 'TrendingUp' },
    { t: 'Audit an open-source project', type: 'Open Source', ic: 'Github' },
  ],
};

