import { NextRequest, NextResponse } from 'next/server';

// Map role names → Himalayas search query
const ROLE_QUERIES: Record<string, string> = {
  'Backend Engineer':    'backend engineer',
  'Frontend Engineer':   'frontend developer',
  'Full-Stack Engineer': 'full stack developer',
  'Data / ML Engineer':  'data engineer',
  'DevOps Engineer':     'devops engineer',
  'Security Engineer':   'security engineer',
};

// Keyword → canonical skill name (must match constants.ts)
const SKILL_MAP: Record<string, string> = {
  'python':           'Python',
  'javascript':       'JavaScript',
  'typescript':       'TypeScript',
  'java':             'Java',
  'c++':              'C++',
  'go ':              'Go',
  'golang':           'Go',
  'node.js':          'Node.js',
  'nodejs':           'Node.js',
  'react':            'React',
  'react.js':         'React',
  'postgresql':       'PostgreSQL',
  'postgres':         'PostgreSQL',
  'mysql':            'MySQL',
  'mongodb':          'MongoDB',
  'redis':            'Redis',
  'sqlite':           'SQLite',
  'docker':           'Docker',
  'kubernetes':       'Kubernetes',
  ' k8s':             'Kubernetes',
  'aws':              'AWS',
  'gcp':              'GCP',
  'google cloud':     'GCP',
  'ci/cd':            'CI/CD',
  'github actions':   'CI/CD',
  'git':              'Git',
  'graphql':          'GraphQL',
  'rest api':         'REST APIs',
  'rest apis':        'REST APIs',
  'system design':    'System Design',
  'dsa':              'DSA',
  'data structures':  'DSA',
  'algorithms':       'DSA',
  'machine learning': 'Machine Learning',
  'tensorflow':       'TensorFlow',
  'pandas':           'Pandas',
  'linux':            'Linux',
  'html/css':         'HTML/CSS',
  'html & css':       'HTML/CSS',
  'html ':            'HTML/CSS',
  'css ':             'HTML/CSS',
  'express':          'Express',
  'figma':            'Figma',
  'jwt':              'JWT Auth',
};

function extractSkills(text: string): string[] {
  const lower = ' ' + text.toLowerCase() + ' ';
  const found = new Set<string>();
  for (const [kw, skill] of Object.entries(SKILL_MAP)) {
    if (lower.includes(kw)) found.add(skill);
  }
  return Array.from(found);
}

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') ?? 'Backend Engineer';
  const query = ROLE_QUERIES[role] ?? 'software engineer';

  try {
    const url = `https://himalayas.app/jobs/api?q=${encodeURIComponent(query)}&limit=50`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },       // server-side cache: re-fetch at most once per hour
      headers: { 'Accept': 'application/json', 'User-Agent': 'CareerCoPilot/1.0' },
      signal: AbortSignal.timeout(8000), // don't hang the client for more than 8s
    });

    if (!res.ok) throw new Error(`Himalayas ${res.status}`);

    const data = await res.json();
    const jobs: Array<Record<string, unknown>> = data.jobs ?? [];

    // Tally skill occurrences across all postings
    const counts: Record<string, number> = {};
    for (const job of jobs) {
      const skillTags = (job.skills as Array<{ title?: string }> | undefined)
        ?.map(s => s.title ?? '')
        .join(' ') ?? '';
      const text = [
        String(job.title ?? ''),
        String(job.description ?? ''),
        skillTags,
      ].join(' ');

      for (const skill of extractSkills(text)) {
        counts[skill] = (counts[skill] ?? 0) + 1;
      }
    }

    const topSkills = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([s]) => s);

    return NextResponse.json({
      count:      data.total ?? jobs.length,
      topSkills,
      role,
      fetchedAt:  Date.now(),
    });
  } catch {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
  }
}
