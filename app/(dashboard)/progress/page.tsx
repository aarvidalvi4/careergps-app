'use client';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile, buildProgress, timeToGoal } from '@/lib/engine';
import { C, FONT_DISPLAY, FONT_MONO, FONT_BODY, Panel, Bar, Head } from '@/components/ui';
import { TrendingUp, Clock, Flame, CheckCircle2 } from '@/components/icons';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Progress() {
  const { profile } = useProfile();
  const prof = computeProfile(profile);
  // buildProgress returns { overall: number, pillars: { k: string; v: number; c: string }[] }
  const { overall, pillars } = buildProgress(profile, prof);

  return (
    <div className="fade" style={{ padding: '32px 5vw', maxWidth: 1100 }}>
      <Head
        kicker="WEEKLY PROGRESS"
        title="Your Momentum"
        desc={`Tracking against ${profile.free_hours}h/week. Estimated time to 80% readiness: ${timeToGoal(profile, prof)}.`}
      />

      {/* Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
        {pillars.map(p => (
          <Panel key={p.k} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 12.5, color: C.dim }}>{p.k}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: p.v >= 60 ? C.lime : C.amber }}>{p.v}%</div>
            </div>
            <Bar pct={p.v} color={p.v >= 60 ? C.lime : C.amber} h={8} />
          </Panel>
        ))}
      </div>

      {/* Weekly heatmap */}
      <Panel style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: C.lime, marginBottom: 16 }}>THIS WEEK</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {WEEK_DAYS.map((d, i) => {
            const done = i < 4;
            return (
              <div key={d} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: 44, borderRadius: 9, display: 'grid', placeItems: 'center',
                  background: done ? `${C.lime}22` : C.panel2,
                  border: `1px solid ${done ? C.lime + '44' : C.line}`,
                  marginBottom: 6,
                }}>
                  {done
                    ? <CheckCircle2 size={16} color={C.lime} />
                    : <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.line }} />}
                </div>
                <div style={{ fontSize: 11, color: C.faint, fontFamily: FONT_MONO }}>{d}</div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
        {[
          { icon: Flame, label: 'Current streak', value: '5 days', color: C.lime },
          { icon: Clock, label: 'Hours this week', value: `${profile.free_hours}h plan`, color: C.cyan },
          { icon: TrendingUp, label: 'Overall progress', value: `${overall}%`, color: C.violet },
        ].map(s => (
          <Panel key={s.label} accent={s.color}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}18`, display: 'grid', placeItems: 'center' }}>
                <s.icon size={22} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.faint }}>{s.label}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: s.color }}>{s.value}</div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
