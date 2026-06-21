'use client';
import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile } from '@/lib/engine';
import { C, FONT_DISPLAY, FONT_MONO, FONT_BODY, Panel, Pill, Head, btnPrimary, btnGhost } from '@/components/ui';
import { FileText, Download, Github, Linkedin, Mail, Globe, CheckCircle2, BadgeCheck } from '@/components/icons';

export default function Resume() {
  const { profile } = useProfile();
  const prof = computeProfile(profile);
  const [printing, setPrinting] = useState(false);

  const printResume = () => {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 100);
  };

  const shippedProjects = profile.project_list.filter(p => p.shipped);
  const internships = profile.internships ?? [];

  return (
    <div className="fade" style={{ padding: '32px 5vw', maxWidth: 1100 }}>
      <div className="no-print" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <Head kicker="RESUME BUILDER" title="Your ATS Resume" desc="Auto-built from your verified profile. Export as PDF." />
        <button onClick={printResume} disabled={printing} style={{ ...btnPrimary, alignSelf: 'center', gap: 8 }}>
          <Download size={16} /> {printing ? 'Opening print…' : 'Export PDF'}
        </button>
      </div>

      {/* Resume preview */}
      <Panel style={{ maxWidth: 760, margin: '0 auto', padding: '40px 46px', fontFamily: FONT_BODY }} id="resume-content">
        {/* Header */}
        <div style={{ borderBottom: `2px solid ${C.line}`, paddingBottom: 20, marginBottom: 20 }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, margin: '0 0 6px', color: C.text }}>{profile.name}</h1>
          <div style={{ fontSize: 14, color: C.dim, marginBottom: 10 }}>{prof.role} · {profile.year} · {profile.degree}</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: C.dim }}>
            <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}><Mail size={13} />{profile.email}</span>
            {profile.gh_username && <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}><Github size={13} />github.com/{profile.gh_username}</span>}
            <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}><Globe size={13} />{profile.region}</span>
            {profile.google_verified && (
              <span style={{ display: 'flex', gap: 5, alignItems: 'center', color: C.lime }}><BadgeCheck size={13} />Verified profile</span>
            )}
          </div>
        </div>

        {/* Summary */}
        <section style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: C.lime, marginBottom: 8 }}>SUMMARY</div>
          <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.65, margin: 0 }}>
            {profile.year} {profile.degree} student targeting a {prof.role} role with {profile.skills.length} technical skills,
            {shippedProjects.length} shipped projects, and a {prof.readiness}/100 job readiness score.
            Based in {profile.region}.
          </p>
        </section>

        {/* Skills */}
        <section style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: C.lime, marginBottom: 10 }}>TECHNICAL SKILLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {profile.skills.map(s => (
              <span key={s} style={{ fontSize: 12.5, padding: '4px 10px', background: C.panel2, borderRadius: 6, border: `1px solid ${C.line}`, color: C.text }}>{s}</span>
            ))}
          </div>
        </section>

        {/* Projects */}
        {shippedProjects.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: C.lime, marginBottom: 12 }}>PROJECTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {shippedProjects.map(p => (
                <div key={p.title}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{p.title}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {p.gh_url && <a href={p.gh_url} style={{ color: C.dim, fontSize: 12 }}>{p.gh_url}</a>}
                    </div>
                  </div>
                  {p.description && <div style={{ fontSize: 13, color: C.dim, marginTop: 3, lineHeight: 1.5 }}>{p.description}</div>}
                  {p.stack && (
                    <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>
                      Stack: {Array.isArray(p.stack) ? p.stack.join(', ') : p.stack}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {internships.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: C.lime, marginBottom: 12 }}>EXPERIENCE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {internships.map(i => (
                <div key={i.title + i.company}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{i.title}</div>
                      <div style={{ fontSize: 13, color: C.dim }}>{i.company}</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.faint, textAlign: 'right' }}>
                      {i.start} – {i.end ?? 'Present'}
                    </div>
                  </div>
                  {i.description && <div style={{ fontSize: 13, color: C.dim, marginTop: 4, lineHeight: 1.5 }}>{i.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        <section>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: C.lime, marginBottom: 12 }}>EDUCATION</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{profile.degree}</div>
              <div style={{ fontSize: 13, color: C.dim }}>{profile.year}</div>
            </div>
            <div style={{ fontSize: 12, color: C.faint }}>{profile.region}</div>
          </div>
        </section>
      </Panel>

      <style>{`@media print { .no-print { display: none !important; } body { background: white; } #resume-content { box-shadow: none; border: none; margin: 0; padding: 30px; } }`}</style>
    </div>
  );
}
