'use client';
import { useState, FormEvent } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { ALL_SKILLS, INTERESTS } from '@/lib/constants';
import { C, FONT_MONO, FONT_BODY, inputStyle, selStyle, btnPrimary, btnGhost, Panel, Head, VIS_OPTIONS } from '@/components/ui';
import { Check, Globe, BadgeCheck, Lock, Plus, Trash } from '@/components/icons';
import type { InternshipItem, ProjectItem } from '@/lib/types';

const YEARS   = ['1st year', '2nd year', '3rd year', '4th year', 'Graduate'];
const REGIONS = ['North America', 'Europe', 'South Asia', 'Southeast Asia', 'East Asia', 'Middle East', 'Africa', 'Latin America', 'Oceania'];
const TRACKS  = Object.keys(INTERESTS);
const SYLLABUS_YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

const VIS_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = { Globe, BadgeCheck, Lock };

interface GithubRepo {
  name: string; description: string | null; html_url: string;
  language: string | null; stars: number; fork: boolean; pushed_at: string;
}
interface GithubAnalysis {
  handle: string; avatar: string; bio: string | null; public_repos: number;
  detected_skills: string[]; repos: GithubRepo[]; fetched_at: number;
}

const GH_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export default function Settings() {
  const { profile, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // Profile state
  const [name,       setName]       = useState(profile.name);
  const [degree,     setDegree]     = useState(profile.degree);
  const [year,       setYear]       = useState(profile.year);
  const [region,     setRegion]     = useState(profile.region);
  const [interest,   setInterest]   = useState(profile.interest);
  const [freeHours,  setFreeHours]  = useState(String(profile.free_hours));
  const [ghUsername, setGhUsername] = useState(profile.gh_username ?? '');
  const [visibility, setVisibility] = useState(profile.visibility);
  const [skills,     setSkills]     = useState<string[]>(profile.skills);

  // Syllabus
  const [syllabus,       setSyllabus]       = useState<Record<string, string[]>>(profile.syllabus ?? {});
  const [activeSyllYear, setActiveSyllYear] = useState('Year 1');
  const [syllInput,      setSyllInput]      = useState('');

  const addSubject = () => {
    const s = syllInput.trim();
    if (!s) return;
    setSyllabus(prev => ({ ...prev, [activeSyllYear]: [...(prev[activeSyllYear] ?? []), s] }));
    setSyllInput('');
  };
  const removeSubject = (yr: string, subj: string) =>
    setSyllabus(prev => ({ ...prev, [yr]: (prev[yr] ?? []).filter(x => x !== subj) }));

  // Internships
  const [internships, setInternships] = useState<InternshipItem[]>(profile.internships ?? []);
  const addInternship    = () => setInternships(prev => [...prev, { title: '', company: '', start: '', end: '', description: '' }]);
  const updateInternship = (i: number, field: keyof InternshipItem, val: string) =>
    setInternships(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  const removeInternship = (i: number) => setInternships(prev => prev.filter((_, idx) => idx !== i));

  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // GitHub analyzer
  const [ghLoading,  setGhLoading]  = useState(false);
  const [ghError,    setGhError]    = useState<string | null>(null);
  const [ghResult,   setGhResult]   = useState<GithubAnalysis | null>(null);
  const [importing,  setImporting]  = useState(false);
  const [importDone, setImportDone] = useState(false);

  const analyzeGitHub = async () => {
    const handle = ghUsername.trim();
    if (!handle) return;
    setGhError(null);
    setGhResult(null);
    setImportDone(false);

    // Check localStorage cache first (1h TTL)
    try {
      const raw = localStorage.getItem(`ccp_gh_${handle.toLowerCase()}`);
      if (raw) {
        const parsed: GithubAnalysis = JSON.parse(raw);
        if (Date.now() - parsed.fetched_at < GH_CACHE_TTL) {
          setGhResult(parsed);
          return;
        }
      }
    } catch { /* ignore cache errors */ }

    setGhLoading(true);
    try {
      const res  = await fetch(`/api/github/analyze?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();
      if (!res.ok) {
        setGhError(data.error ?? 'Could not analyze GitHub profile — try again.');
      } else {
        setGhResult(data as GithubAnalysis);
        try { localStorage.setItem(`ccp_gh_${handle.toLowerCase()}`, JSON.stringify(data)); } catch { /* ignore */ }
      }
    } catch {
      setGhError('Could not reach GitHub — check your connection and try again.');
    } finally {
      setGhLoading(false);
    }
  };

  const importGithubData = async () => {
    if (!ghResult) return;
    setImporting(true);

    // Merge skills — only add skills not already selected
    const newSkills    = ghResult.detected_skills.filter(s => !skills.includes(s));
    const mergedSkills = [...skills, ...newSkills];

    // Merge projects — skip repos already in the list (by title, case-insensitive)
    const existingTitles = new Set(profile.project_list.map(p => p.title.toLowerCase()));
    const newProjects: ProjectItem[] = ghResult.repos
      .filter(r => !existingTitles.has(r.name.toLowerCase()))
      .map(r => ({
        title:       r.name,
        description: r.description ?? '',
        gh_url:      r.html_url,
        shipped:     true,
        stack:       r.language ? [r.language] : [],
        level:       'GitHub Verified',
      }));

    setSkills(mergedSkills);
    await updateProfile({ skills: mergedSkills, project_list: [...profile.project_list, ...newProjects] });
    setImportDone(true);
    setImporting(false);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      name, degree, year, region, interest,
      free_hours: parseInt(freeHours),
      gh_username: ghUsername || null,
      visibility,
      skills,
      internships,
      syllabus,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Derived values for the GitHub panel
  const ownedSet       = new Set(skills);
  const newSkillCount  = ghResult ? ghResult.detected_skills.filter(s => !ownedSet.has(s)).length : 0;
  const alreadyOwned   = ghResult ? ghResult.detected_skills.filter(s =>  ownedSet.has(s))        : [];
  const existingTitles = new Set(profile.project_list.map(p => p.title.toLowerCase()));
  const newRepoCount   = ghResult ? ghResult.repos.filter(r => !existingTitles.has(r.name.toLowerCase())).length : 0;

  return (
    <div className="fade" style={{ padding: '32px 5vw', maxWidth: 800 }}>
      <Head kicker="SETTINGS" title="Edit Profile" desc="Changes recompute your CareerGPS readiness score immediately." />

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Basic */}
        <Panel>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: C.lime, marginBottom: 16 }}>BASIC INFO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Full name</div>
                <input value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle }} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>GitHub username</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={ghUsername}
                    onChange={e => { setGhUsername(e.target.value); setGhResult(null); setGhError(null); setImportDone(false); }}
                    placeholder="optional"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  {ghUsername.trim() && (
                    <button
                      type="button"
                      onClick={analyzeGitHub}
                      disabled={ghLoading}
                      style={{ ...btnGhost, whiteSpace: 'nowrap', fontSize: 12, padding: '8px 13px', opacity: ghLoading ? 0.6 : 1 }}
                    >
                      {ghLoading ? 'Scanning…' : 'Scan'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Degree / Program</div>
              <input value={degree} onChange={e => setDegree(e.target.value)} style={{ ...inputStyle }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Year</div>
                <select value={year} onChange={e => setYear(e.target.value)} style={{ ...selStyle }}>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Region</div>
                <select value={region} onChange={e => setRegion(e.target.value)} style={{ ...selStyle }}>
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Career track</div>
                <select value={interest} onChange={e => setInterest(e.target.value)} style={{ ...selStyle }}>
                  {TRACKS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Free hours / week</div>
                <input type="number" min={1} max={60} value={freeHours} onChange={e => setFreeHours(e.target.value)} style={{ ...inputStyle }} />
              </div>
            </div>
          </div>
        </Panel>

        {/* GitHub Analyzer — appears after Scan is clicked */}
        {(ghError || ghResult || ghLoading) && (
          <Panel>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: C.lime }}>GITHUB VERIFIED</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${C.lime}14`, border: `1px solid ${C.lime}33`, borderRadius: 20, padding: '3px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ghLoading ? C.faint : C.lime }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: ghLoading ? C.faint : C.lime, letterSpacing: .5 }}>
                  {ghLoading ? 'SCANNING…' : 'LIVE DATA'}
                </span>
              </div>
            </div>

            {ghError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#dc2626' }}>
                {ghError}
              </div>
            )}

            {ghResult && !importDone && (
              <>
                {/* User card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, padding: '12px 14px', background: C.panel2, borderRadius: 12, border: `1px solid ${C.line}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ghResult.avatar} alt={ghResult.handle} width={44} height={44} style={{ borderRadius: '50%', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>@{ghResult.handle}</div>
                    {ghResult.bio && <div style={{ fontSize: 12.5, color: C.dim, marginTop: 2 }}>{ghResult.bio}</div>}
                    <div style={{ fontSize: 11.5, color: C.faint, marginTop: 3 }}>
                      {ghResult.public_repos} public repos · {ghResult.repos.length} own repos scanned
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 10, fontWeight: 500 }}>Skills detected from your repos</div>
                  {ghResult.detected_skills.length === 0 ? (
                    <div style={{ fontSize: 13, color: C.faint }}>No skills matched our list in your public repos.</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {ghResult.detected_skills.map(s => {
                        const owned = ownedSet.has(s);
                        return (
                          <span key={s} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '5px 11px', borderRadius: 20, fontSize: 12.5,
                            background: owned ? `${C.lime}14` : `${C.cyan}14`,
                            color:      owned ? C.lime : C.cyan,
                            border:     `1px solid ${owned ? C.lime : C.cyan}33`,
                          }}>
                            <span style={{ fontSize: 11 }}>{owned ? '✓' : '+'}</span>
                            {s}
                            <span style={{ fontFamily: FONT_MONO, fontSize: 9, opacity: 0.7 }}>
                              {owned ? 'owned' : 'new'}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {alreadyOwned.length > 0 && (
                    <div style={{ fontSize: 11.5, color: C.faint, marginTop: 8 }}>
                      {alreadyOwned.length} skill{alreadyOwned.length > 1 ? 's' : ''} already in your profile
                    </div>
                  )}
                </div>

                {/* Repos */}
                {ghResult.repos.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 10, fontWeight: 500 }}>
                      Repos to import as projects
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 220, overflowY: 'auto' }}>
                      {ghResult.repos.map(r => {
                        const alreadyIn = existingTitles.has(r.name.toLowerCase());
                        return (
                          <div key={r.name} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '9px 13px', borderRadius: 10, background: C.panel2,
                            border: `1px solid ${alreadyIn ? C.line : C.lime + '33'}`,
                            opacity: alreadyIn ? 0.5 : 1,
                          }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{r.name}</div>
                              {r.description && (
                                <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
                                  {r.description}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, marginLeft: 10 }}>
                              {r.language && (
                                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.faint, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: '2px 7px' }}>
                                  {r.language}
                                </span>
                              )}
                              <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: alreadyIn ? C.faint : C.lime }}>
                                {alreadyIn ? 'already added' : 'GitHub Verified'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Import action */}
                {(newSkillCount > 0 || newRepoCount > 0) ? (
                  <button
                    type="button"
                    onClick={importGithubData}
                    disabled={importing}
                    style={{ ...btnGhost, fontSize: 13.5, padding: '11px 18px', color: C.lime, borderColor: C.lime, opacity: importing ? 0.6 : 1 }}
                  >
                    {importing ? 'Importing…' : [
                      newSkillCount > 0 ? `${newSkillCount} skill${newSkillCount > 1 ? 's' : ''}` : '',
                      newRepoCount  > 0 ? `${newRepoCount} repo${newRepoCount > 1 ? 's' : ''}`   : '',
                    ].filter(Boolean).join(' + ') + ' → Import'}
                  </button>
                ) : (
                  <div style={{ fontSize: 13, color: C.faint }}>Nothing new to import — everything is already in your profile.</div>
                )}
              </>
            )}

            {importDone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', background: `${C.lime}0d`, border: `1px solid ${C.lime}33`, borderRadius: 10 }}>
                <Check size={15} color={C.lime} />
                <span style={{ fontSize: 13, color: C.lime }}>
                  Imported! Hit <strong>Save changes</strong> below to persist everything.
                </span>
              </div>
            )}
          </Panel>
        )}

        {/* Skills */}
        <Panel>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: C.lime, marginBottom: 14 }}>SKILLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, maxHeight: 260, overflowY: 'auto' }}>
            {ALL_SKILLS.map(s => {
              const sel = skills.includes(s);
              return (
                <button key={s} type="button" onClick={() => toggleSkill(s)} style={{
                  padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12.5,
                  fontFamily: FONT_BODY, background: sel ? C.lime : C.panel2,
                  color: sel ? '#fff' : C.text, border: sel ? `1px solid ${C.lime}` : `1px solid ${C.line}`,
                  transition: 'all .13s',
                }}>{s}</button>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: C.faint }}>{skills.length} selected</div>
        </Panel>

        {/* Syllabus */}
        <Panel id="syllabus">
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: C.lime, marginBottom: 6 }}>SYLLABUS</div>
          <div style={{ fontSize: 13, color: C.faint, marginBottom: 16 }}>
            Add subjects year by year — used in Skill Gap Analysis to credit what your degree already covers.
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {SYLLABUS_YEARS.map(yr => (
              <button key={yr} type="button" onClick={() => setActiveSyllYear(yr)} style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 13, fontFamily: FONT_BODY,
                background: activeSyllYear === yr ? C.lime : C.panel2,
                color: activeSyllYear === yr ? '#fff' : C.dim,
              }}>{yr}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              value={syllInput}
              onChange={e => setSyllInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
              placeholder="e.g. Data Structures, DBMS, Operating Systems"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={addSubject} style={{ ...btnGhost, padding: '10px 16px', whiteSpace: 'nowrap' }}>
              <Plus size={13} /> Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(syllabus[activeSyllYear] ?? []).length === 0
              ? <div style={{ fontSize: 13, color: C.faint }}>No subjects added for {activeSyllYear} yet.</div>
              : (syllabus[activeSyllYear] ?? []).map(s => (
                <span key={s} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: `${C.lime}14`, border: `1px solid ${C.lime}33`,
                  borderRadius: 20, padding: '5px 12px', fontSize: 12.5, color: C.lime,
                }}>
                  {s}
                  <button type="button" onClick={() => removeSubject(activeSyllYear, s)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: C.faint, padding: 0, fontSize: 14, lineHeight: 1,
                  }}>×</button>
                </span>
              ))
            }
          </div>
        </Panel>

        {/* Internships */}
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: C.lime }}>INTERNSHIPS & EXPERIENCE</div>
            <button type="button" onClick={addInternship} style={{ ...btnGhost, fontSize: 12, padding: '6px 11px' }}>
              <Plus size={13} /> Add
            </button>
          </div>
          {internships.length === 0 && <div style={{ fontSize: 13, color: C.faint }}>No experience added yet.</div>}
          {internships.map((item, i) => (
            <div key={i} style={{ background: C.panel2, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input value={item.title}     onChange={e => updateInternship(i, 'title',       e.target.value)} placeholder="Job title"              style={{ ...inputStyle, fontSize: 13 }} />
                <input value={item.company}   onChange={e => updateInternship(i, 'company',     e.target.value)} placeholder="Company"                 style={{ ...inputStyle, fontSize: 13 }} />
                <input value={item.start}     onChange={e => updateInternship(i, 'start',       e.target.value)} placeholder="Start (e.g. Jun 2024)"   style={{ ...inputStyle, fontSize: 13 }} />
                <input value={item.end ?? ''} onChange={e => updateInternship(i, 'end',         e.target.value)} placeholder="End (blank = present)"   style={{ ...inputStyle, fontSize: 13 }} />
              </div>
              <textarea value={item.description ?? ''} onChange={e => updateInternship(i, 'description', e.target.value)} placeholder="What you built or achieved…" rows={2} style={{ ...inputStyle, resize: 'vertical', fontSize: 13 }} />
              <button type="button" onClick={() => removeInternship(i)} style={{ marginTop: 8, ...btnGhost, fontSize: 12, color: '#dc2626', borderColor: '#fecaca', padding: '5px 10px' }}>
                <Trash size={12} /> Remove
              </button>
            </div>
          ))}
        </Panel>

        {/* Visibility */}
        <Panel>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: C.lime, marginBottom: 14 }}>PROFILE VISIBILITY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {VIS_OPTIONS.map(v => {
              const sel = visibility === v.id;
              const IconComp = VIS_ICONS[v.icon] ?? Globe;
              return (
                <div key={v.id} onClick={() => setVisibility(v.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px',
                  borderRadius: 11, cursor: 'pointer',
                  background: sel ? `${v.color}14` : C.panel2,
                  border: sel ? `1.5px solid ${v.color}` : `1px solid ${C.line}`,
                  transition: 'all .15s',
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: sel ? `${v.color}22` : C.line, display: 'grid', placeItems: 'center' }}>
                    <IconComp size={16} color={sel ? v.color : C.faint} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: sel ? v.color : C.text }}>{v.label}</div>
                    <div style={{ fontSize: 12, color: C.faint }}>{v.desc}</div>
                  </div>
                  {sel && <Check size={15} color={v.color} />}
                </div>
              );
            })}
          </div>
        </Panel>

        <button type="submit" disabled={saving} style={{ ...btnPrimary, padding: '14px 20px', fontSize: 15, justifyContent: 'center', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : saved ? <><Check size={15} /> Saved!</> : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
