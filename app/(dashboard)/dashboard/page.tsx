'use client';
import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile, nextAction, timeToGoal, careerDNA, buildRoute, buildProgress } from '@/lib/engine';
import { OPPORTUNITIES } from '@/lib/constants';
import { C, FONT_DISPLAY, FONT_BODY, FONT_MONO, Panel, Pill, Ring, Bar } from '@/components/ui';
import { Zap, Briefcase, CheckCircle2, Navigation, Award, Github, TrendingUp as TrendUp } from '@/components/icons';

const TABS = ['Overview', 'Insights', 'Opportunities'];

const STEP_COLOR: Record<string, string> = {
  start: C.violet,
  done: C.lime,
  active: C.cyan,
  upcoming: C.faint,
  goal: C.amber,
};

export default function Dashboard() {
  const { profile } = useProfile();
  const prof = computeProfile(profile);
  const dna = careerDNA(profile, prof);
  const route = buildRoute(profile, prof);
  const opp = OPPORTUNITIES[prof.role as keyof typeof OPPORTUNITIES] ?? [];
  const [tab, setTab] = useState(0);

  const matchedCount: number = prof.matched.length;
  const missingCount: number = prof.missing.length;
  const progress = buildProgress(profile, prof);

  const OPP_ICON: Record<string, typeof Briefcase> = {
    Internship: Briefcase, Certification: Award, Hackathon: Zap,
    'Open Source': Github, Competition: TrendUp,
  };
  const OPP_COLOR: Record<string, string> = {
    Internship: C.cyan, Certification: C.violet, Hackathon: C.amber,
    'Open Source': C.lime, Competition: C.coral,
  };

  const yearNum = profile.year?.replace('Year ', '') ?? '';

  return (
    <div className="fade" style={{ padding: '36px 40px', maxWidth: 1280 }}>

      {/* Header card */}
      <Panel accent={C.lime} style={{ marginBottom: 24, padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.lime, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Navigation size={26} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.lime, letterSpacing: 1.5, marginBottom: 4 }}>CAREERGPS</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, color: C.text, lineHeight: 1.1, marginBottom: 10 }}>
                {profile.name} → {prof.role}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {yearNum && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 20, padding: '4px 11px', fontSize: 12.5, color: C.dim }}>
                    🎓 Year {yearNum}
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 20, padding: '4px 11px', fontSize: 12.5, color: C.dim }}>
                  ⏱ {timeToGoal(profile, prof)} to goal
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${C.amber}14`, border: `1px solid ${C.amber}33`, borderRadius: 20, padding: '4px 11px', fontSize: 12.5, color: C.amber }}>
                  🔥 {prof.readiness}/100 ready
                </span>
              </div>
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 88, height: 88 }}>
              <svg width={88} height={88} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={44} cy={44} r={36} fill="none" stroke={C.line} strokeWidth={8} />
                <circle cx={44} cy={44} r={36} fill="none" stroke={C.lime} strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={2 * Math.PI * 36 * (1 - prof.readiness / 100)} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.text, lineHeight: 1 }}>{prof.readiness}%</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.faint, marginTop: 3 }}>overall</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 22, borderBottom: `1px solid ${C.line}` }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: 13.5, color: tab === i ? C.lime : C.dim,
            borderBottom: tab === i ? `2px solid ${C.lime}` : '2px solid transparent',
            fontWeight: tab === i ? 500 : 400, transition: 'all .15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Career Route */}
          <Panel>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: C.lime, marginBottom: 18 }}>YOUR CAREER ROUTE</div>
            <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 8 }}>
              {route.map((step, i) => {
                const color = STEP_COLOR[step.status] ?? C.faint;
                const isLast = i === route.length - 1;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: step.status === 'goal' ? 52 : 44,
                        height: step.status === 'goal' ? 52 : 44,
                        borderRadius: '50%',
                        background: step.status === 'done' ? C.lime : step.status === 'active' ? `${C.cyan}22` : `${color}14`,
                        border: `2px solid ${step.status === 'upcoming' ? C.line : color}`,
                        display: 'grid', placeItems: 'center', flexShrink: 0,
                        boxShadow: step.status === 'active' ? `0 0 0 5px ${C.cyan}18` : 'none',
                        transition: 'all .2s',
                      }}>
                        {step.status === 'done'
                          ? <CheckCircle2 size={18} color="#fff" />
                          : step.status === 'goal'
                            ? <Navigation size={22} color={C.amber} />
                            : step.status === 'start'
                              ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                              : step.status === 'active'
                                ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.cyan }} />
                                : <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                        }
                      </div>
                      <div style={{
                        fontFamily: step.status === 'goal' ? FONT_DISPLAY : FONT_BODY,
                        fontSize: 11, color: step.status === 'upcoming' ? C.faint : color,
                        textAlign: 'center', maxWidth: 76, lineHeight: 1.3,
                        fontWeight: step.status === 'goal' || step.status === 'active' ? 600 : 400,
                      }}>{step.label}</div>
                    </div>
                    {!isLast && (
                      <div style={{
                        width: 32, height: 2, flexShrink: 0, margin: '0 2px',
                        background: i < route.findIndex(s => s.status === 'active') ? C.lime : C.line,
                        marginBottom: 22,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Focus This Week */}
          <Panel accent={C.lime} style={{ padding: '20px 24px' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1, color: C.lime, marginBottom: 10 }}>FOCUS THIS WEEK</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${C.lime}18`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Zap size={22} color={C.lime} />
                </div>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.text, lineHeight: 1.1 }}>{nextAction(profile, prof)}</div>
                  {missingCount > 0 && (
                    <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>
                      Closing this moves your readiness the most right now.
                    </div>
                  )}
                </div>
              </div>
              <button style={{
                padding: '10px 20px', borderRadius: 10, background: C.lime,
                border: 'none', cursor: 'pointer', color: '#fff',
                fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                whiteSpace: 'nowrap',
              }}>
                Start now →
              </button>
            </div>
          </Panel>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {([
              { icon: '🔨', v: `${prof.shipped}/6`, l: 'Projects' },
              { icon: '🎯', v: `${matchedCount}/${matchedCount + missingCount}`, l: 'Skills matched' },
              { icon: '⏱', v: String(profile.free_hours ?? 0), l: 'Hrs / week' },
              { icon: '💼', v: String(profile.internships?.length ?? 0), l: 'Internships' },
            ]).map(s => (
              <Panel key={s.l} style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: C.panel2, display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.text, lineHeight: 1 }}>{s.v}</div>
                    <div style={{ fontSize: 11.5, color: C.dim, marginTop: 3 }}>{s.l}</div>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {tab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Row 1: Skill Readiness + Career Progress */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
            <Panel accent={C.lime} style={{ padding: '22px 26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1, color: C.dim, marginBottom: 6 }}>SKILL READINESS</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.text }}>{prof.role}</div>
                </div>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1, padding: '5px 11px', borderRadius: 20,
                  background: prof.readiness < 40 ? '#fee2e2' : '#dcfce7',
                  color: prof.readiness < 40 ? '#dc2626' : '#15803d',
                }}>{prof.readiness < 40 ? 'NEEDS WORK' : 'ON TRACK'}</span>
              </div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <Ring pct={prof.readiness} size={110} stroke={10} color={C.lime} sub="ready" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(prof.pct).map(([k, v]) => (
                    <div key={k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: C.dim, marginBottom: 4 }}>
                        <span>{k}</span>
                        <span style={{ fontFamily: FONT_MONO }}>{v}%</span>
                      </div>
                      <Bar pct={v} h={6} color={v < 20 ? C.coral : v < 50 ? C.amber : C.lime} />
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel accent={C.cyan} style={{ padding: '22px 26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.text }}>Career Progress</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: C.cyan, lineHeight: 1 }}>{prof.readiness}%</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {progress.pillars.map(p => {
                  const isLowest = p.v === Math.min(...progress.pillars.map(x => x.v));
                  return (
                    <div key={p.k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: C.dim }}>{p.k}</span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: p.v === 0 && isLowest ? C.amber : C.dim }}>
                          {p.v}%{p.v === 0 && isLowest ? ' · focus here' : ''}
                        </span>
                      </div>
                      <Bar pct={p.v} h={6} color={p.c} />
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* Career DNA */}
          <Panel style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>🚀</span>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.text }}>Career DNA</div>
              </div>
              <Pill color={C.violet}>{dna.top}-led</Pill>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {dna.traits.map(t => (
                  <div key={t.k}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: C.dim, marginBottom: 6 }}>
                      <span>{t.k}</span>
                      <span style={{ fontFamily: FONT_MONO }}>{t.v}%</span>
                    </div>
                    <Bar pct={t.v} h={8} color={C.violet} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1.2, color: C.faint, marginBottom: 14 }}>BEST-MATCHED ROLES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {dna.roles.map(r => <Pill key={r} color={C.violet}>{r}</Pill>)}
                </div>
                <p style={{ fontSize: 13, color: C.faint, lineHeight: 1.65, margin: 0 }}>
                  Derived from your skills, projects, internships & cohort activity — not a personality quiz.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* Opportunities */}
      {tab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Opportunity Radar */}
          <Panel style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.text }}>Opportunity Radar</div>
            </div>
            <div style={{ fontSize: 13.5, color: C.dim, marginBottom: 22 }}>
              Recommended for your <span style={{ color: C.lime, fontWeight: 500 }}>{prof.role}</span> path
            </div>
            {opp.length === 0 ? (
              <div style={{ color: C.dim }}>Set your career track in Settings to see opportunities.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {opp.map((o: { t: string; type: string; ic: string }) => {
                  const OIcon = OPP_ICON[o.type] ?? Briefcase;
                  const oc = OPP_COLOR[o.type] ?? C.lime;
                  return (
                    <div key={o.t} style={{ background: C.panel2, borderRadius: 14, padding: '18px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${oc}18`, display: 'grid', placeItems: 'center' }}>
                          <OIcon size={20} color={oc} />
                        </div>
                        <Pill color={oc}>{o.type}</Pill>
                      </div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, lineHeight: 1.35, color: C.text }}>{o.t}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Shortlist Probability */}
          <Panel accent={C.cyan} style={{ padding: '22px 26px' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1, color: C.dim, marginBottom: 4 }}>SHORTLIST PROBABILITY</div>
            <div style={{ fontSize: 13.5, color: C.dim, marginBottom: 18 }}>
              For a <span style={{ color: C.text, fontWeight: 500 }}>{prof.role}</span> internship, based on live postings
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 22 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 54, color: C.cyan, lineHeight: 1 }}>{prof.shortlistProb}%</div>
              <div style={{ fontSize: 15, color: C.lime }}>↗ rises to {prof.shortlistAfter}%</div>
            </div>
            {missingCount > 0 && (
              <div style={{ background: C.panel2, borderRadius: 14, padding: '18px 22px' }}>
                <div style={{ fontSize: 13.5, color: C.dim, marginBottom: 14 }}>If you close these gaps:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {prof.missing.slice(0, 5).map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: C.text }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${C.amber}`, flexShrink: 0 }} />
                      {s}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                  <span style={{ fontSize: 13.5, color: C.dim }}>Probability rises to</span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: C.lime }}>{prof.shortlistAfter}%</span>
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
