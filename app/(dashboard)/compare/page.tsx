'use client';
import Link from 'next/link';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile } from '@/lib/engine';
import { C, FONT_DISPLAY, FONT_MONO, FONT_BODY, Panel, Head } from '@/components/ui';
import { BookOpen, Plus } from '@/components/icons';

export default function Compare() {
  const { profile } = useProfile();
  const prof = computeProfile(profile);

  const gpsBoost = Math.round(55 / Math.max(1, prof.demand.length));

  const syllabus: Record<string, string[]> = (profile as { syllabus?: Record<string, string[]> }).syllabus ?? {};
  const syllabusSubjects: string[] = Object.values(syllabus).flat().filter(Boolean);
  const hasSyllabus = syllabusSubjects.length > 0;

  return (
    <div className="fade" style={{ padding: '36px 40px', maxWidth: 1200 }}>
      <Head
        kicker="YOUR SYLLABUS + WHAT TO ADD ON TOP"
        title="Your degree builds the base. Here's the rest."
        desc={`Your coursework gives you real foundations. We checked it against what ${prof.role} roles ask for, and mapped the extra skills to layer on top — so you graduate job-ready, not just exam-ready.`}
      />

      {!hasSyllabus && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          background: `${C.amber}0d`, border: `1px solid ${C.amber}44`,
          borderRadius: 14, padding: '16px 20px', marginBottom: 22,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `${C.amber}18`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <BookOpen size={16} color={C.amber} />
          </div>
          <div style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6 }}>
            <strong style={{ color: C.text }}>Add your syllabus to unlock this.</strong>{' '}
            Head to{' '}
            <Link href="/settings#syllabus" style={{ color: C.lime, textDecoration: 'underline' }}>Settings → Syllabus</Link>
            {' '}and add your subjects, year by year. Then we can credit exactly what your degree covers and show what to add.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Left: Your degree already builds */}
        <Panel accent={C.lime} style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <BookOpen size={18} color={C.lime} />
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.lime }}>Your degree already builds</div>
          </div>
          <div style={{ fontSize: 13, color: C.dim, marginBottom: 20 }}>
            Foundations your syllabus covers — keep these strong
          </div>
          {hasSyllabus ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {syllabusSubjects.map(s => (
                <div key={s} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  background: C.panel2, border: `1px solid ${C.line}`,
                  fontSize: 13.5, color: C.text,
                }}>
                  <span style={{ color: C.lime, fontSize: 13 }}>✓</span> {s}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 12,
              background: C.panel2, border: `1px solid ${C.line}`,
              fontSize: 13.5, color: C.faint,
            }}>
              <span style={{ color: C.lime }}>✓</span> Add your syllabus to see this
            </div>
          )}
        </Panel>

        {/* Right: Add on top */}
        <Panel accent={C.cyan} style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Plus size={18} color={C.cyan} />
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.cyan }}>Add on top to be job-ready</div>
          </div>
          <div style={{ fontSize: 13, color: C.dim, marginBottom: 20 }}>
            In demand for {prof.role}, beyond your coursework
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {prof.missing.map(s => (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 16px', borderRadius: 10,
                background: C.panel2, border: `1px solid ${C.line}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.cyan, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: C.text, fontFamily: FONT_BODY }}>{s}</span>
                </div>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: .5,
                  background: `${C.lime}14`, color: C.lime,
                  border: `1px solid ${C.lime}33`, borderRadius: 20, padding: '3px 9px',
                }}>GPS +{gpsBoost}%</span>
              </div>
            ))}
            {prof.missing.length === 0 && (
              <div style={{ fontSize: 13.5, color: C.lime, padding: '12px 16px' }}>
                ✓ You're covering all in-demand skills for {prof.role}!
              </div>
            )}
          </div>
        </Panel>

      </div>
    </div>
  );
}
