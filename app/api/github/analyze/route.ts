import { NextRequest, NextResponse } from 'next/server';

// GitHub primary language → our canonical skill name
const LANG_TO_SKILL: Record<string, string> = {
  'JavaScript':       'JavaScript',
  'TypeScript':       'TypeScript',
  'Python':           'Python',
  'Java':             'Java',
  'C++':              'C++',
  'C':                'C++',
  'Go':               'Go',
  'HTML':             'HTML/CSS',
  'CSS':              'HTML/CSS',
  'Shell':            'Linux',
  'Dockerfile':       'Docker',
  'Jupyter Notebook': 'Python',
};

export interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stars: number;
  fork: boolean;
  pushed_at: string;
}

export interface GithubAnalysis {
  handle: string;
  avatar: string;
  bio: string | null;
  public_repos: number;
  detected_skills: string[];   // canonical skill names found across repos
  repos: GithubRepo[];         // non-fork repos, most-recently-pushed first
  fetched_at: number;
}

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get('handle')?.trim();
  if (!handle || handle.length < 1) {
    return NextResponse.json({ error: 'Missing handle' }, { status: 400 });
  }
  // Block obviously bad input
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(handle)) {
    return NextResponse.json({ error: 'Invalid GitHub username format.' }, { status: 400 });
  }

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'CareerCoPilot/1.0',
  };

  try {
    // ── 1. Verify user exists ──────────────────────────────────────────────
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
      headers,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (userRes.status === 404) {
      return NextResponse.json({ error: `GitHub user "${handle}" not found.` }, { status: 404 });
    }
    if (userRes.status === 403 || userRes.status === 429) {
      return NextResponse.json({ error: 'GitHub rate limit reached — wait a minute and try again.' }, { status: 429 });
    }
    if (!userRes.ok) {
      return NextResponse.json({ error: 'GitHub API unavailable — try again shortly.' }, { status: 502 });
    }

    const remaining = Number(userRes.headers.get('X-RateLimit-Remaining') ?? 99);
    const user = await userRes.json();

    // ── 2. Fetch repos (language included in list response — no extra calls) ─
    if (remaining < 2) {
      return NextResponse.json({ error: 'GitHub rate limit nearly exhausted — try again in an hour.' }, { status: 429 });
    }

    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(handle)}/repos?sort=pushed&per_page=50&type=owner`,
      { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
    );

    if (!reposRes.ok) {
      return NextResponse.json({ error: 'Could not fetch repos — try again shortly.' }, { status: 502 });
    }

    const rawRepos: Array<{
      name: string; description: string | null; html_url: string;
      language: string | null; stargazers_count: number;
      fork: boolean; pushed_at: string;
    }> = await reposRes.json();

    // ── 3. Extract skills and build clean repo list ────────────────────────
    const skillSet = new Set<string>();
    const repos: GithubRepo[] = rawRepos
      .filter(r => !r.fork)   // skip forks — only original work
      .slice(0, 20)            // cap at 20 most-recent own repos
      .map(r => {
        if (r.language && LANG_TO_SKILL[r.language]) {
          skillSet.add(LANG_TO_SKILL[r.language]);
        }
        return {
          name:        r.name,
          description: r.description,
          html_url:    r.html_url,
          language:    r.language,
          stars:       r.stargazers_count,
          fork:        r.fork,
          pushed_at:   r.pushed_at,
        };
      });

    const analysis: GithubAnalysis = {
      handle,
      avatar:           user.avatar_url,
      bio:              user.bio ?? null,
      public_repos:     user.public_repos,
      detected_skills:  Array.from(skillSet),
      repos,
      fetched_at:       Date.now(),
    };

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: 'Could not reach GitHub — check your connection and try again.' }, { status: 502 });
  }
}
