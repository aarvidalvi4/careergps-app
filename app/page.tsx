'use client';
import Link from 'next/link';
import { C, FONT_DISPLAY, FONT_BODY, FONT_MONO, Panel, Pill } from '@/components/ui';
import { Compass, GitCompareArrows, Hammer, Activity, Users, FileText, Check, ArrowRight, Briefcase, BadgeCheck, Shield } from '@/components/icons';

const feats = [
  { ic: Compass, t: 'Personal roadmap', d: 'Scoped to your exact year and goal — first-year tasks for a first-year, not a vague "become an engineer".' },
  { ic: GitCompareArrows, t: 'Syllabus vs jobs', d: 'We check your coursework against live postings and tell you what to go deep on and what to skip.' },
  { ic: Hammer, t: 'Monthly projects', d: 'One real build a month, only using what you\'ve learned — every one becomes portfolio material.' },
  { ic: Activity, t: 'Honest progress', d: 'Tracked against your real free hours, with a recoverable next step — never a wall of red.' },
  { ic: Users, t: 'Peer cohort', d: "Grouped with students at your year, path and region so you're never doing it alone." },
  { ic: FileText, t: 'Resume + recruiter pool', d: 'Auto-build a verified resume; recruiters filter the talent pool and find you by skill.' },
];

export default function Landing() {
  return (
    <div className="fade" style={{ background: C.bg, minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 6vw', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.lime, display: 'grid', placeItems: 'center' }}>
            <Compass size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, lineHeight: 1 }}>Co-Pilot</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.faint, letterSpacing: 1 }}>CAREER OS</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/auth/signup?type=recruiter" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: C.cyan, padding: '9px 14px', borderRadius: 10, fontSize: 12.5, cursor: 'pointer', textDecoration: 'none', border: `1px solid ${C.cyan}55` }}>
            <Briefcase size={14} /> For recruiters
          </Link>
          <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: C.text, padding: '9px 14px', borderRadius: 10, fontSize: 12.5, cursor: 'pointer', textDecoration: 'none', border: `1px solid ${C.line}` }}>
            Log in
          </Link>
          <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.lime, color: '#fff', padding: '9px 15px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', border: 'none' }}>
            Get started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 6vw 30px', position: 'relative' }}>
        <div style={{ maxWidth: 760 }}>
          <Pill color={C.lime}>FROM FIRST YEAR TO FIRST JOB</Pill>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(40px,6vw,68px)', fontWeight: 600, lineHeight: 1.02, margin: '20px 0 0' }}>
            Stop guessing whether<br />your degree is <span style={{ color: C.lime, fontStyle: 'italic' }}>enough.</span>
          </h1>
          <p style={{ color: C.dim, fontSize: 17, lineHeight: 1.6, maxWidth: 600, marginTop: 22 }}>
            A career co-pilot that knows your syllabus, your level and the real job market — and turns the confusion of a tech degree into a clear weekly plan, from day one.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
            <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.lime, color: '#fff', padding: '13px 22px', borderRadius: 10, fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
              Create your account <ArrowRight size={16} />
            </Link>
            <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: C.text, padding: '13px 22px', borderRadius: 10, fontSize: 15, textDecoration: 'none', border: `1px solid ${C.line}` }}>
              I already have one
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 22, marginTop: 26, fontSize: 12.5, color: C.faint, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Check size={14} color={C.lime} /> Starts in first year</span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Check size={14} color={C.lime} /> Level-scoped projects</span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Check size={14} color={C.lime} /> Verified resume + recruiter search</span>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '6vw', top: 70, width: 240, height: 240, background: `radial-gradient(circle,${C.lime}22,transparent 70%)`, borderRadius: '50%', filter: 'blur(8px)', animation: 'floatY 6s ease-in-out infinite', pointerEvents: 'none' }} />
      </header>

      {/* Feature grid */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '30px 6vw 70px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {feats.map(f => (
            <Panel key={f.t} style={{ transition: 'transform .2s,border-color .2s' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: C.panel2, display: 'grid', placeItems: 'center', marginBottom: 14 }}>
                <f.ic size={20} color={C.lime} />
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, margin: '0 0 8px' }}>{f.t}</h3>
              <p style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{f.d}</p>
            </Panel>
          ))}
        </div>

        {/* Recruiter band */}
        <div style={{ marginTop: 60, background: `linear-gradient(135deg, ${C.panel}, ${C.panel2})`, border: `1px solid ${C.cyan}33`, borderRadius: 20, padding: '36px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 30, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 560 }}>
            <Pill color={C.cyan}>FOR RECRUITERS</Pill>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(26px,3vw,34px)', margin: '14px 0 10px', lineHeight: 1.1 }}>
              Hire from a pool of <span style={{ color: C.cyan }}>verified, job-ready</span> students.
            </h2>
            <p style={{ color: C.dim, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
              Filter by role, skills, readiness and availability. Every profile is backed by verified projects and a live readiness score — no inflated resumes.
            </p>
            <div style={{ display: 'flex', gap: 18, marginTop: 18, fontSize: 12.5, color: C.faint, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><BadgeCheck size={14} color={C.cyan} /> Multi-layer recruiter verification</span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Shield size={14} color={C.cyan} /> Student-controlled privacy</span>
            </div>
          </div>
          <Link href="/auth/signup?type=recruiter" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.cyan, color: '#ffffff', padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Apply for recruiter access <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
