'use client';
import Link from 'next/link';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile } from '@/lib/engine';
import { useMarketData } from '@/lib/useMarketData';
import { gpsGain } from '@/lib/gpsGain';
import { C, FONT_DISPLAY, FONT_MONO, FONT_BODY, Panel, Head } from '@/components/ui';
import { BookOpen, Plus } from '@/components/icons';

export default function Compare() {
  const { profile } = useProfile();
  const prof = computeProfile(profile);
  const { data: market, loading: marketLoading } = useMarketData(prof.role);

  // Merge static missing with live gaps; prioritise live data when available
  const ownedSet = new Set(profile.skills ?? []);
  const liveGaps = (market?.topSkills ?? []).filter(s => !ownedSet.has(s));
  const displayGaps = liveGaps.length > 0
    ? Array.from(new Set([...liveGaps, ...prof.missing]))
    : prof.missing;
  const isLive = liveGaps.length > 0;


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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Plus size={18} color={C.cyan} />
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.cyan }}>Add on top to be job-ready</div>
            </div>
            {isLive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${C.cyan}14`, border: `1px solid ${C.cyan}33`, borderRadius: 20, padding: '4px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.cyan, letterSpacing: .5 }}>LIVE</span>
              </div>
            ) : marketLoading ? (
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.faint }}>loading…</span>
            ) : null}
          </div>
          <div style={{ fontSize: 13, color: C.dim, marginBottom: 20 }}>
            {isLive
              ? `From ${market!.count.toLocaleString()} live ${prof.role} postings`
              : `In demand for ${prof.role}, beyond your coursework`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayGaps.map(s => {
              const { gain, isLive: skillIsLive } = gpsGain(s, market);
              const fromLive = market?.topSkills.includes(s);
              return (
                <div key={s} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 16px', borderRadius: 10,
                  background: C.panel2, border: `1px solid ${fromLive ? C.cyan + '55' : C.line}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: fromLive ? C.cyan : C.faint, flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: C.text, fontFamily: FONT_BODY }}>{s}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {fromLive && (
                      <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.cyan, background: `${C.cyan}14`, border: `1px solid ${C.cyan}33`, borderRadius: 20, padding: '2px 7px' }}>LIVE</span>
                    )}
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: .5,
                      background: skillIsLive ? `${C.lime}14` : `${C.amber}0d`,
                      color: skillIsLive ? C.lime : C.amber,
                      border: `1px solid ${skillIsLive ? C.lime : C.amber}33`,
                      borderRadius: 20, padding: '3px 9px',
                    }}>GPS +{gain}%{!skillIsLive ? ' est.' : ''}</span>
                  </div>
                </div>
              );
            })}
            {displayGaps.length === 0 && (
              <div style={{ fontSize: 13.5, color: C.lime, padding: '12px 16px' }}>
                ✓ You&apos;re covering all in-demand skills for {prof.role}!
              </div>
            )}
          </div>
          {isLive && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontSize: 11.5, color: C.faint }}>
              Refreshes every 24 h · Falls back to static list if API is unreachable
            </div>
          )}
        </Panel>

      </div>
    </div>
  );
}
