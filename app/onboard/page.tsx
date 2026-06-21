'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ALL_SKILLS, INTERESTS } from '@/lib/constants';
import { C, FONT_DISPLAY, FONT_BODY, FONT_MONO, inputStyle, selStyle, btnPrimary, btnGhost, Panel } from '@/components/ui';
import { Compass, ArrowRight, ChevronLeft, Check, Globe, Lock, BadgeCheck, Plus, Github, Shield, Sparkles } from '@/components/icons';

const DEGREES = [
  'B.Tech in Computer Science',
  'B.Tech in Information Technology',
  'B.Sc in Computer Science',
  'BCA',
  'B.E. in Electronics',
  'M.Tech in Computer Science',
  'Other',
];

const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

const SEMS_FOR_YEAR: Record<string, string[]> = {
  'Year 1': ['Semester 1', 'Semester 2'],
  'Year 2': ['Semester 3', 'Semester 4'],
  'Year 3': ['Semester 5', 'Semester 6'],
  'Year 4': ['Semester 7', 'Semester 8'],
};

const SUBJECT_SUGGESTIONS = [
  'Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks',
  'OOP', 'Web Technologies', 'Software Engineering', 'Machine Learning',
];

const SYLLABUS_YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

const VIS_OPTS = [
  { id: 'public' as const, label: 'Public profile', desc: 'Visible to everyone — students and verified recruiters.', Icon: Globe, color: C.lime },
  { id: 'recruiter' as const, label: 'Recruiter only', desc: 'Visible only to verified recruiters. Hidden from public.', Icon: BadgeCheck, color: C.cyan },
  { id: 'private' as const, label: 'Private', desc: "Visible only to you. You won't appear in recruiter search.", Icon: Lock, color: '#6b7280' },
];

const STEPS = ['You', 'Your goal', 'Syllabus', 'Skills', 'Certifications', 'Projects', 'Experience', 'Privacy'];
const STEP_LABELS = ['ABOUT YOU', 'YOUR GOAL', 'YOUR SYLLABUS', 'YOUR SKILLS', 'CERTIFICATIONS', 'YOUR PROJECTS', 'EXPERIENCE', 'PRIVACY CONTROLS'];
const STEP_TITLES = [
  'Where are you right now?',
  'What are you aiming for?',
  'What does your course cover?',
  'What can you already do?',
  'Earned any certifications?',
  'Built anything already?',
  'Any internships?',
  'Who can see your profile?',
];

export default function Onboard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0 — You
  const [name, setName] = useState('');
  const [degree, setDegree] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [region, setRegion] = useState('');
  const [freeHours, setFreeHours] = useState('10');

  // Step 1 — Goal
  const [interest, setInterest] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  // Step 2 — Syllabus
  const [syllabus, setSyllabus] = useState<Record<string, string[]>>({});
  const [syllInput, setSyllInput] = useState('');
  const [activeSem, setActiveSem] = useState('Year 1');

  // Step 3 — Skills
  const [ghUsername, setGhUsername] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);

  // Step 4 — Certifications
  const [certifications, setCertifications] = useState<{ name: string; issuer: string }[]>([]);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');

  // Step 5 — Projects
  const [projects, setProjects] = useState<{ title: string; stack: string }[]>([]);
  const [projTitle, setProjTitle] = useState('');
  const [projStack, setProjStack] = useState('');

  // Step 6 — Experience
  const [internships, setInternships] = useState<{ company: string; role: string }[]>([]);
  const [internCompany, setInternCompany] = useState('');
  const [internRole, setInternRole] = useState('');

  // Step 7 — Privacy
  const [visibility, setVisibility] = useState<'public' | 'recruiter' | 'private'>('recruiter');

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.name) setName(data.user.user_metadata.name);
    });
  }, []);

  useEffect(() => {
    if (year) {
      const sems = SEMS_FOR_YEAR[year] ?? [];
      setSemester(sems[0] ?? '');
      setActiveSem(year);
    }
  }, [year]);

  const savedInterest = interest === 'other' ? customInterest.trim() : interest;
  const role = savedInterest ? (INTERESTS[savedInterest as keyof typeof INTERESTS]?.role ?? savedInterest) : '';
  const demandSkills = savedInterest ? (INTERESTS[savedInterest as keyof typeof INTERESTS]?.demand ?? []) : [];
  const semOptions = year ? (SEMS_FOR_YEAR[year] ?? []) : [];

  const toggleSkill = (s: string) => {
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    if (skills.includes(s)) setVerifiedSkills(prev => prev.filter(x => x !== s));
  };

  const toggleVerify = (s: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVerifiedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const addSubject = (sub: string) => {
    const v = sub.trim();
    if (!v) return;
    setSyllabus(prev => ({
      ...prev,
      [activeSem]: [...new Set([...(prev[activeSem] ?? []), v])],
    }));
    setSyllInput('');
  };

  const removeSubject = (sem: string, sub: string) =>
    setSyllabus(prev => ({ ...prev, [sem]: prev[sem].filter(x => x !== sub) }));

  const addCert = () => {
    if (!certName.trim()) return;
    setCertifications(prev => [...prev, { name: certName.trim(), issuer: certIssuer.trim() }]);
    setCertName(''); setCertIssuer('');
  };

  const addProject = () => {
    if (!projTitle.trim()) return;
    setProjects(prev => [...prev, { title: projTitle.trim(), stack: projStack.trim() }]);
    setProjTitle(''); setProjStack('');
  };

  const addInternship = () => {
    if (!internCompany.trim() && !internRole.trim()) return;
    setInternships(prev => [...prev, { company: internCompany.trim(), role: internRole.trim() }]);
    setInternCompany(''); setInternRole('');
  };

  const canNext = () => {
    if (step === 0) return !!(degree && year && semester && region.trim());
    if (step === 1) return interest === 'other' ? !!customInterest.trim() : !!interest;
    return true;
  };

  const finish = async () => {
    setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const base = {
      id: user.id, email: user.email ?? '', name: name.trim(),
      degree, year, region, interest: savedInterest,
      free_hours: parseInt(freeHours) || 10,
      gh_username: ghUsername.trim() || null,
      projects_done: projects.length,
      visibility, onboarded: true,
    };

    // Try with new columns first; fall back to base if columns don't exist yet
    const { error } = await sb.from('profiles').upsert(
      { ...base, semester, syllabus, certifications } as never,
      { onConflict: 'id' }
    );
    if (error) {
      const { error: err2 } = await sb.from('profiles').upsert(base, { onConflict: 'id' });
      if (err2) { setSaving(false); alert('Error saving profile: ' + err2.message); return; }
    }

    if (skills.length > 0) {
      const rows = skills.map(skill => ({ user_id: user.id, skill }));
      await sb.from('user_skills').upsert(rows, { onConflict: 'user_id,skill' });
    }

    if (projects.length > 0) {
      const rows = projects.map(p => ({
        user_id: user.id, title: p.title, shipped: true,
        stack: p.stack ? p.stack.split(',').map(s => s.trim()).filter(Boolean) : [],
      }));
      await sb.from('user_projects').upsert(rows, { onConflict: 'user_id,title' });
    }

    if (internships.length > 0) {
      const rows = internships.map(i => ({
        user_id: user.id, title: i.role || 'Intern',
        company: i.company, start: new Date().toISOString().split('T')[0],
      }));
      await sb.from('user_internships').insert(rows);
    }

    setSaving(false);
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'grid', placeItems: 'center', padding: '30px 16px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.lime, display: 'grid', placeItems: 'center' }}>
            <Compass size={19} color="#fff" />
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.text }}>Career Co-Pilot</div>
        </div>

        {/* Progress bars */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? C.lime : C.line,
              transition: 'background .3s',
            }} />
          ))}
        </div>

        {/* Step labels */}
        <div style={{ display: 'flex', marginBottom: 22 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{
              flex: 1, fontSize: 9.5, textAlign: 'center',
              color: i === step ? C.text : C.faint,
              fontWeight: i === step ? 600 : 400,
              overflow: 'hidden', whiteSpace: 'nowrap',
              fontFamily: FONT_BODY,
            }}>{s}</div>
          ))}
        </div>

        <Panel style={{ padding: '28px 28px 24px' }}>
          {/* Step label + title */}
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.lime, letterSpacing: 1.5, marginBottom: 8 }}>
            {STEP_LABELS[step]}
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, margin: '0 0 10px', color: C.text, lineHeight: 1.1 }}>
            {STEP_TITLES[step]}
          </h2>

          {/* === STEP 0: YOU === */}
          {step === 0 && <>
            <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 24px', lineHeight: 1.5 }}>
              This scopes everything — a second-year gets a second-year plan, not a final-year one.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 7 }}>Degree</div>
                <select value={degree} onChange={e => setDegree(e.target.value)} style={{ ...selStyle }}>
                  <option value="">Select degree</option>
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 10 }}>Academic year</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {YEARS.map(y => (
                    <button key={y} onClick={() => setYear(y)} style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                      fontFamily: FONT_BODY, fontSize: 13.5, background: 'transparent',
                      color: year === y ? C.lime : C.text,
                      border: year === y ? `1.5px solid ${C.lime}` : `1px solid ${C.line}`,
                      fontWeight: year === y ? 600 : 400, transition: 'all .15s',
                    }}>{y}</button>
                  ))}
                </div>
              </div>

              {semOptions.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, color: C.dim, marginBottom: 10 }}>
                    Current semester <span style={{ color: C.faint, fontWeight: 400 }}>— sharpens your roadmap &amp; project timing</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {semOptions.map(s => (
                      <button key={s} onClick={() => setSemester(s)} style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                        fontFamily: FONT_BODY, fontSize: 13.5,
                        background: semester === s ? `${C.lime}10` : 'transparent',
                        color: semester === s ? C.lime : C.text,
                        border: semester === s ? `1.5px solid ${C.lime}` : `1px solid ${C.line}`,
                        fontWeight: semester === s ? 600 : 400, transition: 'all .15s',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 13, color: C.dim, marginBottom: 7 }}>Region (for your cohort)</div>
                  <input value={region} onChange={e => setRegion(e.target.value)}
                    placeholder="e.g. Bengaluru, IN" style={{ ...inputStyle }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: C.dim, marginBottom: 7 }}>Free hours / week</div>
                  <input type="number" min={1} max={80} value={freeHours}
                    onChange={e => setFreeHours(e.target.value)} style={{ ...inputStyle }} />
                </div>
              </div>
            </div>
          </>}

          {/* === STEP 1: GOAL === */}
          {step === 1 && <>
            <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 22px', lineHeight: 1.5 }}>
              Pick the area you&apos;re most curious about. We&apos;ll map the live job market for that role to your skills.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              {Object.entries(INTERESTS).map(([key, val]) => {
                const sel = interest === key;
                return (
                  <div key={key} onClick={() => setInterest(key)} style={{
                    padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
                    background: sel ? `${C.lime}08` : C.panel2,
                    border: sel ? `1.5px solid ${C.lime}` : `1px solid ${C.line}`,
                    transition: 'all .15s',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: sel ? C.lime : C.text }}>{key}</div>
                    <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>→ {val.role}</div>
                  </div>
                );
              })}
            </div>
            {/* Other option */}
            <div onClick={() => setInterest('other')} style={{
              padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
              background: interest === 'other' ? `${C.lime}08` : C.panel2,
              border: interest === 'other' ? `1.5px solid ${C.lime}` : `1px solid ${C.line}`,
              transition: 'all .15s',
            }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: interest === 'other' ? C.lime : C.text }}>Something else</div>
              <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>→ Type your own career path</div>
            </div>
            {interest === 'other' && (
              <input
                autoFocus
                value={customInterest}
                onChange={e => setCustomInterest(e.target.value)}
                placeholder="e.g. Product Management, Game Development, UI/UX Design…"
                style={{ ...inputStyle, marginTop: 10 }}
              />
            )}
          </>}

          {/* === STEP 2: SYLLABUS === */}
          {step === 2 && <>
            <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 20px', lineHeight: 1.5 }}>
              Add subjects year by year. We use this to credit what your degree already covers, then show exactly what to learn on top to be job-ready. Leave future years blank — you can fill them in later.
            </p>

            {/* Year tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {SYLLABUS_YEARS.map(yr => {
                const isFuture = year && SYLLABUS_YEARS.indexOf(yr) > SYLLABUS_YEARS.indexOf(year);
                return (
                  <button key={yr} onClick={() => setActiveSem(yr)} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    fontFamily: FONT_BODY, textAlign: 'center',
                    background: activeSem === yr ? `${C.lime}10` : C.panel2,
                    color: activeSem === yr ? C.lime : isFuture ? C.faint : C.text,
                    border: activeSem === yr ? `1.5px solid ${C.lime}` : `1px solid ${C.line}`,
                    opacity: isFuture ? 0.6 : 1,
                  }}>{yr}</button>
                );
              })}
            </div>

            {/* Input row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input value={syllInput} onChange={e => setSyllInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubject(syllInput)}
                placeholder={`Add a subject from ${activeSem} (e.g. DBMS)`}
                style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => addSubject(syllInput)} style={{
                width: 42, height: 42, borderRadius: 10, background: C.lime,
                border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Plus size={18} color="#fff" />
              </button>
            </div>

            {/* Quick-add chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {SUBJECT_SUGGESTIONS
                .filter(s => !(syllabus[activeSem] ?? []).includes(s))
                .map(s => (
                  <button key={s} onClick={() => addSubject(s)} style={{
                    padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12.5,
                    background: C.panel2, border: `1px solid ${C.line}`, color: C.dim, fontFamily: FONT_BODY,
                  }}>+ {s}</button>
                ))}
            </div>

            {/* Added subjects */}
            {(syllabus[activeSem] ?? []).length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(syllabus[activeSem] ?? []).map(sub => (
                  <div key={sub} style={{
                    padding: '5px 11px', borderRadius: 20, fontSize: 12.5,
                    background: `${C.lime}12`, border: `1px solid ${C.lime}33`, color: C.lime,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {sub}
                    <button onClick={() => removeSubject(activeSem, sub)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: C.lime, fontSize: 15, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: C.faint, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>↑</span> No subjects yet — add a few, or skip and add them later in Settings.
              </div>
            )}
          </>}

          {/* === STEP 3: SKILLS === */}
          {step === 3 && <>
            <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 18px', lineHeight: 1.5 }}>
              Tap everything you&apos;re comfortable with. Skills the market wants for {role || 'your role'} are marked with a star. Verify a skill to earn a credibility badge recruiters trust.
            </p>

            {/* GitHub connect */}
            <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Github size={15} color={C.text} />
                <span style={{ fontSize: 13.5, fontWeight: 500, color: C.text }}>Connect GitHub — auto-build your portfolio</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={ghUsername} onChange={e => setGhUsername(e.target.value)}
                  placeholder="your-handle" style={{ ...inputStyle, flex: 1 }} />
                <button style={{
                  padding: '0 16px', height: 42, borderRadius: 10, background: `${C.lime}80`,
                  border: 'none', cursor: 'pointer', fontSize: 13, color: '#fff',
                  fontFamily: FONT_BODY, whiteSpace: 'nowrap', flexShrink: 0,
                }}>Analyze repos</button>
              </div>
            </div>

            {/* Skill chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, maxHeight: 260, overflowY: 'auto', paddingRight: 2 }}>
              {ALL_SKILLS.map(s => {
                const sel = skills.includes(s);
                const demanded = demandSkills.includes(s);
                const verified = verifiedSkills.includes(s);
                return (
                  <button key={s} onClick={() => toggleSkill(s)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '7px 11px', borderRadius: 20, cursor: 'pointer', fontSize: 12.5,
                    fontFamily: FONT_BODY, transition: 'all .13s',
                    background: sel ? (verified ? '#059669' : C.lime) : C.panel2,
                    color: sel ? '#fff' : C.text,
                    border: sel ? `1px solid ${verified ? '#059669' : C.lime}` : `1px solid ${C.line}`,
                  }}>
                    {sel
                      ? <Check size={11} />
                      : demanded
                        ? <span style={{ color: '#f59e0b', fontSize: 11, lineHeight: 1 }}>★</span>
                        : null
                    }
                    {s}
                    {sel && (
                      <span onClick={e => toggleVerify(s, e)} style={{
                        fontSize: 10, fontWeight: 600,
                        color: verified ? '#fff' : '#10b981',
                        background: verified ? 'rgba(255,255,255,0.25)' : '#d1fae5',
                        padding: '1px 6px', borderRadius: 10, marginLeft: 2, cursor: 'pointer',
                      }}>{verified ? '✓' : 'verify'}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: C.dim }}>
              {skills.length} skills selected · <span style={{ color: '#10b981' }}>{verifiedSkills.length} verified</span>
            </div>
          </>}

          {/* === STEP 4: CERTIFICATIONS === */}
          {step === 4 && <>
            <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 20px', lineHeight: 1.5 }}>
              Add any courses or certifications you&apos;ve completed. We rate how relevant each is to a {role || 'your role'} and fold it into your CareerGPS readiness. Optional — skip if you have none yet.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input value={certName} onChange={e => setCertName(e.target.value)}
                placeholder="Certification (e.g. AWS Cloud Practitioner)"
                onKeyDown={e => e.key === 'Enter' && addCert()}
                style={{ ...inputStyle, flex: 1 }} />
              <input value={certIssuer} onChange={e => setCertIssuer(e.target.value)}
                placeholder="Issuer (e.g. Amazon)"
                onKeyDown={e => e.key === 'Enter' && addCert()}
                style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addCert} style={{
                width: 42, height: 42, borderRadius: 10, background: C.lime,
                border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Plus size={18} color="#fff" />
              </button>
            </div>

            {certifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {certifications.map((c, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: 10, background: C.panel2,
                    border: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: C.text }}>{c.name}</div>
                      {c.issuer && <div style={{ fontSize: 12, color: C.faint }}>{c.issuer}</div>}
                    </div>
                    <button onClick={() => setCertifications(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.faint, fontSize: 18, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: C.lime, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎓</span> No certifications yet — totally fine. The roadmap will suggest high-value ones for {role || 'your role'}.
              </div>
            )}
          </>}

          {/* === STEP 5: PROJECTS === */}
          {step === 5 && <>
            <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 20px', lineHeight: 1.5 }}>
              Import projects you&apos;ve completed. They become verified portfolio entries and bump your readiness. Skip if you&apos;re starting fresh.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input value={projTitle} onChange={e => setProjTitle(e.target.value)}
                placeholder="Project name"
                onKeyDown={e => e.key === 'Enter' && addProject()}
                style={{ ...inputStyle, flex: 1 }} />
              <input value={projStack} onChange={e => setProjStack(e.target.value)}
                placeholder="Stack (comma sep)"
                onKeyDown={e => e.key === 'Enter' && addProject()}
                style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addProject} style={{
                width: 42, height: 42, borderRadius: 10, background: C.lime,
                border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Plus size={18} color="#fff" />
              </button>
            </div>

            {projects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {projects.map((p, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: 10, background: C.panel2,
                    border: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: C.text }}>{p.title}</div>
                      {p.stack && <div style={{ fontSize: 12, color: C.faint }}>{p.stack}</div>}
                    </div>
                    <button onClick={() => setProjects(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.faint, fontSize: 18, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: C.dim }}>
                No projects added yet — that&apos;s fine, we&apos;ll start your ladder at Month 1.
              </div>
            )}
          </>}

          {/* === STEP 6: EXPERIENCE === */}
          {step === 6 && <>
            <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 20px', lineHeight: 1.5 }}>
              Add past internships or roles. Optional — but they boost your interview-readiness and show up on your resume.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input value={internCompany} onChange={e => setInternCompany(e.target.value)}
                placeholder="Company"
                onKeyDown={e => e.key === 'Enter' && addInternship()}
                style={{ ...inputStyle, flex: 1 }} />
              <input value={internRole} onChange={e => setInternRole(e.target.value)}
                placeholder="Role (e.g. SDE Intern)"
                onKeyDown={e => e.key === 'Enter' && addInternship()}
                style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addInternship} style={{
                width: 42, height: 42, borderRadius: 10, background: C.lime,
                border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Plus size={18} color="#fff" />
              </button>
            </div>

            {internships.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {internships.map((intn, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: 10, background: C.panel2,
                    border: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: C.text }}>{intn.role}</div>
                      {intn.company && <div style={{ fontSize: 12, color: C.faint }}>{intn.company}</div>}
                    </div>
                    <button onClick={() => setInternships(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.faint, fontSize: 18, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: C.dim, marginBottom: 16 }}>
                No internships yet — totally normal for an early-year student.
              </div>
            )}

            <div style={{ background: `${C.lime}08`, border: `1px solid ${C.lime}22`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Sparkles size={15} color={C.lime} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: C.dim, lineHeight: 1.5 }}>One more step: choose who can see your profile. Then we compute your readiness and build your plan.</span>
            </div>
          </>}

          {/* === STEP 7: PRIVACY === */}
          {step === 7 && <>
            <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 20px', lineHeight: 1.5 }}>
              You&apos;re always in control of your exposure. Change anytime in Settings.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {VIS_OPTS.map(v => {
                const sel = visibility === v.id;
                return (
                  <div key={v.id} onClick={() => setVisibility(v.id)} style={{
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    background: sel ? `${v.color}08` : C.panel2,
                    border: sel ? `1.5px solid ${v.color}` : `1px solid ${C.line}`,
                    display: 'flex', alignItems: 'center', gap: 14, transition: 'all .15s',
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: sel ? `${v.color}15` : C.panel2,
                      border: sel ? `1px solid ${v.color}40` : `1px solid ${C.line}`,
                      display: 'grid', placeItems: 'center',
                    }}>
                      <v.Icon size={17} color={sel ? v.color : C.faint} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: sel ? v.color : C.text, fontSize: 14 }}>{v.label}</div>
                      <div style={{ fontSize: 12.5, color: C.faint, marginTop: 2 }}>{v.desc}</div>
                    </div>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${sel ? v.color : C.line}`,
                      display: 'grid', placeItems: 'center',
                    }}>
                      {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.faint }}>
              <Shield size={13} color={C.faint} />
              Recruiters are identity-verified before they can view any profile.
            </div>
          </>}

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{
              ...btnGhost, opacity: step === 0 ? 0 : 1,
            }}>
              <ChevronLeft size={15} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{
                ...btnPrimary, fontSize: 14, padding: '11px 20px',
                opacity: canNext() ? 1 : 0.45,
              }}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={finish} disabled={saving} style={{
                ...btnPrimary, fontSize: 14, padding: '11px 20px',
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Saving…' : <><span>Build my plan</span> <Sparkles size={14} /></>}
              </button>
            )}
          </div>
        </Panel>

        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12.5, color: C.faint }}>
          Step {step + 1} of {STEPS.length} · you can edit all of this later in Settings
        </p>
      </div>
    </div>
  );
}
