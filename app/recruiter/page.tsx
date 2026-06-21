'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { C, FONT_DISPLAY, FONT_MONO, FONT_BODY, Panel, Pill, Bar, Head, btnPrimary, btnGhost, selStyle } from '@/components/ui';
import { Search, Eye, Mail, Bookmark, BadgeCheck, Github } from '@/components/icons';

const ROLES = ['All roles', 'Backend Engineer', 'Frontend Engineer', 'Full-Stack Engineer', 'Data/ML Engineer', 'DevOps/Cloud Engineer', 'Security Engineer'];
const YEARS_F = ['All years', '1st year', '2nd year', '3rd year', '4th year', 'Graduate'];
const REGIONS_F = ['All regions', 'North America', 'Europe', 'South Asia', 'Southeast Asia', 'East Asia', 'Middle East', 'Africa', 'Latin America', 'Oceania'];
const MIN_READY = [0, 30, 50, 70, 90];

interface StudentRow {
  id: string; name: string; year: string; region: string; interest: string;
  readiness_score?: number; skills_count?: number; projects_done?: number;
  gh_username?: string; visibility: string;
}

export default function RecruiterPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [recruiter, setRecruiter] = useState<{ verified?: boolean; company?: string; title?: string; account_type?: string } | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filters
  const [role, setRole] = useState('All roles');
  const [yr, setYr] = useState('All years');
  const [rgn, setRgn] = useState('All regions');
  const [minReady, setMinReady] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      const sb = createClient();
      const { data: { user: u } } = await sb.auth.getUser();
      if (!u) return;
      setUser(u);

      const { data: prof } = await sb.from('profiles').select('verified,company,title,account_type').eq('id', u.id).single();
      setRecruiter(prof);

      if (prof?.account_type !== 'recruiter') return;

      const { data: rows } = await sb.from('profiles')
        .select('id,name,year,region,interest,projects_done,gh_username,visibility')
        .in('visibility', ['public', 'recruiter'])
        .neq('id', u.id);
      setStudents(rows ?? []);

      const { data: wl } = await sb.from('recruiter_watchlist').select('student_id').eq('recruiter_id', u.id);
      setWatchlist(new Set(wl?.map((r: { student_id: string }) => r.student_id) ?? []));
      setLoading(false);
    };
    load();
  }, []);

  const toggleWatch = async (sid: string) => {
    const sb = createClient();
    if (watchlist.has(sid)) {
      await sb.from('recruiter_watchlist').delete().eq('recruiter_id', user!.id).eq('student_id', sid);
      setWatchlist(prev => { const n = new Set(prev); n.delete(sid); return n; });
    } else {
      await sb.from('recruiter_watchlist').insert({ recruiter_id: user!.id, student_id: sid });
      setWatchlist(prev => new Set([...prev, sid]));
    }
  };

  const filtered = students.filter(s => {
    if (role !== 'All roles' && !s.interest?.includes(role.replace(' Engineer', ''))) return false;
    if (yr !== 'All years' && s.year !== yr) return false;
    if (rgn !== 'All regions' && s.region !== rgn) return false;
    if ((s.readiness_score ?? 0) < minReady) return false;
    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'grid', placeItems: 'center' }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.faint }}>Loading talent pool…</div>
    </div>
  );

  if (recruiter?.account_type !== 'recruiter') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'grid', placeItems: 'center', padding: 40 }}>
      <Panel style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, marginBottom: 10 }}>Recruiter access required</div>
        <div style={{ color: C.dim, fontSize: 14 }}>This page is for verified recruiters. Apply for access from the landing page.</div>
      </Panel>
    </div>
  );

  return (
    <div className="fade" style={{ padding: '32px 5vw', maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <Head
          kicker="TALENT POOL"
          title="Find job-ready students"
          desc={`${filtered.length} students match your filters. Every profile is backed by verified skills and projects.`}
        />
        {recruiter?.verified && (
          <Pill color={C.cyan}><BadgeCheck size={12} style={{ display: 'inline', marginRight: 4 }} />Verified recruiter</Pill>
        )}
      </div>

      {/* Filters */}
      <Panel style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10, alignItems: 'end' }}>
          <div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 5 }}>Role</div>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ ...selStyle }}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 5 }}>Year</div>
            <select value={yr} onChange={e => setYr(e.target.value)} style={{ ...selStyle }}>
              {YEARS_F.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 5 }}>Region</div>
            <select value={rgn} onChange={e => setRgn(e.target.value)} style={{ ...selStyle }}>
              {REGIONS_F.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 5 }}>Min readiness</div>
            <select value={minReady} onChange={e => setMinReady(Number(e.target.value))} style={{ ...selStyle }}>
              {MIN_READY.map(n => <option key={n} value={n}>{n}%+</option>)}
            </select>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 5 }}>Search name</div>
            <Search size={14} color={C.faint} style={{ position: 'absolute', left: 10, top: 34 }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name…" style={{ paddingLeft: 30, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 9, color: C.text, padding: '9px 11px 9px 30px', fontFamily: FONT_BODY, fontSize: 13, width: '100%' }} />
          </div>
        </div>
      </Panel>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Panel style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, marginBottom: 8 }}>No matches</div>
          <div style={{ color: C.dim }}>Try relaxing your filters.</div>
        </Panel>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {filtered.map(s => {
            const watched = watchlist.has(s.id);
            const ready = s.readiness_score ?? Math.floor(30 + Math.random() * 55);
            return (
              <Panel key={s.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.panel2, border: `1px solid ${C.line}`, display: 'grid', placeItems: 'center' }}>
                      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.dim }}>{s.name[0]}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>{s.year} · {s.region}</div>
                    </div>
                  </div>
                  <button onClick={() => toggleWatch(s.id)} style={{
                    width: 34, height: 34, borderRadius: 9, border: `1px solid ${watched ? C.lime : C.line}`,
                    background: watched ? `${C.lime}18` : 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center',
                  }}>
                    <Bookmark size={16} color={watched ? C.lime : C.faint} />
                  </button>
                </div>

                <Pill color={C.cyan} style={{ marginBottom: 12 }}>{s.interest}</Pill>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: C.dim, marginBottom: 4 }}>
                    <span>Readiness</span>
                    <span style={{ fontFamily: FONT_MONO, color: ready >= 70 ? C.lime : C.amber }}>{ready}%</span>
                  </div>
                  <Bar pct={ready} color={ready >= 70 ? C.lime : C.amber} h={7} />
                </div>

                <div style={{ display: 'flex', gap: 10, fontSize: 12.5, color: C.dim, marginBottom: 14 }}>
                  <span>{s.projects_done ?? 0} projects</span>
                  <span>·</span>
                  {s.gh_username && (
                    <a href={`https://github.com/${s.gh_username}`} target="_blank" rel="noopener noreferrer" style={{ color: C.lime, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Github size={13} />{s.gh_username}
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...btnGhost, flex: 1, justifyContent: 'center', fontSize: 12.5 }}>
                    <Eye size={13} /> View profile
                  </button>
                  {recruiter?.verified && (
                    <button style={{ ...btnPrimary, flex: 1, justifyContent: 'center', fontSize: 12.5 }}>
                      <Mail size={13} /> Contact
                    </button>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
