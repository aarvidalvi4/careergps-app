'use client';
import { useState, FormEvent } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { ALL_SKILLS, INTERESTS } from '@/lib/constants';
import { C, FONT_MONO, FONT_BODY, inputStyle, selStyle, btnPrimary, btnGhost, Panel, Head, VIS_OPTIONS } from '@/components/ui';
import { Check, Globe, BadgeCheck, Lock, Plus, Trash } from '@/components/icons';
import type { InternshipItem } from '@/lib/types';

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', 'Graduate'];
const REGIONS = ['North America', 'Europe', 'South Asia', 'Southeast Asia', 'East Asia', 'Middle East', 'Africa', 'Latin America', 'Oceania'];
const TRACKS = Object.keys(INTERESTS);
const SYLLABUS_YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

const VIS_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = { Globe, BadgeCheck, Lock };

export default function Settings() {
  const { profile, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [name, setName] = useState(profile.name);
  const [degree, setDegree] = useState(profile.degree);
  const [year, setYear] = useState(profile.year);
  const [region, setRegion] = useState(profile.region);
  const [interest, setInterest] = useState(profile.interest);
  const [freeHours, setFreeHours] = useState(String(profile.free_hours));
  const [ghUsername, setGhUsername] = useState(profile.gh_username ?? '');
  const [visibility, setVisibility] = useState(profile.visibility);
  const [skills, setSkills] = useState<string[]>(profile.skills);

  // Syllabus
  const [syllabus, setSyllabus] = useState<Record<string, string[]>>(profile.syllabus ?? {});
  const [activeSyllYear, setActiveSyllYear] = useState('Year 1');
  const [syllInput, setSyllInput] = useState('');

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
  const addInternship = () => setInternships(prev => [...prev, { title: '', company: '', start: '', end: '', description: '' }]);
  const updateInternship = (i: number, field: keyof InternshipItem, val: string) => {
    setInternships(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };
  const removeInternship = (i: number) => setInternships(prev => prev.filter((_, idx) => idx !== i));

  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

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
                <input value={ghUsername} onChange={e => setGhUsername(e.target.value)} placeholder="optional" style={{ ...inputStyle }} />
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
          {/* Year tabs */}
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
          {/* Input */}
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
          {/* Subject chips */}
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
                <input value={item.title} onChange={e => updateInternship(i, 'title', e.target.value)} placeholder="Job title" style={{ ...inputStyle, fontSize: 13 }} />
                <input value={item.company} onChange={e => updateInternship(i, 'company', e.target.value)} placeholder="Company" style={{ ...inputStyle, fontSize: 13 }} />
                <input value={item.start} onChange={e => updateInternship(i, 'start', e.target.value)} placeholder="Start (e.g. Jun 2024)" style={{ ...inputStyle, fontSize: 13 }} />
                <input value={item.end ?? ''} onChange={e => updateInternship(i, 'end', e.target.value)} placeholder="End (blank = present)" style={{ ...inputStyle, fontSize: 13 }} />
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
