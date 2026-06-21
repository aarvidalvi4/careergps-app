'use client';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile, buildRoadmap } from '@/lib/engine';
import { C, FONT_DISPLAY, FONT_MONO, FONT_BODY, Panel, Pill, Head } from '@/components/ui';
import { CheckCircle2, Circle } from '@/components/icons';

type SemItem = { t: string; done: boolean };
type Sem = { sem: string; state: string; items: SemItem[] };

const STATE_COLOR: Record<string, string> = {
  active: C.lime,
  upcoming: C.cyan,
  locked: C.faint,
};

export default function Roadmap() {
  const { profile, updateProfile } = useProfile();
  const prof = computeProfile(profile);
  const sems: Sem[] = buildRoadmap(profile, prof);

  const totalItems = sems.reduce((n, s) => n + s.items.length, 0);
  const totalDone = sems.reduce((n, s) => n + s.items.filter(i => i.done).length, 0);

  const toggle = async (si: number, ii: number) => {
    const key = `sem${si}_item${ii}`;
    const next = { ...(profile.roadmap_completions ?? {}), [key]: !profile.roadmap_completions?.[key] };
    await updateProfile({ roadmap_completions: next });
  };

  return (
    <div className="fade" style={{ padding: '32px 5vw', maxWidth: 1100 }}>
      <Head
        kicker="SEMESTER ROADMAP"
        title="Your Learning Plan"
        desc={`${totalDone} of ${totalItems} items completed — scoped to your ${profile.interest} track.`}
      />

      <Panel style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.lime, letterSpacing: .5 }}>OVERALL PROGRESS</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.dim }}>{totalDone}/{totalItems}</span>
        </div>
        <div style={{ background: C.line, borderRadius: 20, height: 10, overflow: 'hidden' }}>
          <div style={{
            width: `${totalItems ? (totalDone / totalItems) * 100 : 0}%`,
            height: '100%',
            background: `linear-gradient(90deg,${C.lime},${C.cyan})`,
            borderRadius: 20,
            transition: 'width 1.1s cubic-bezier(.2,.8,.2,1)',
          }} />
        </div>
      </Panel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sems.map((sem: Sem, si: number) => {
          const color = STATE_COLOR[sem.state] ?? C.faint;
          const doneCnt = sem.items.filter((i: SemItem) => i.done).length;
          return (
            <Panel key={sem.sem}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18 }}>{sem.sem}</span>
                </div>
                <Pill color={color}>{doneCnt}/{sem.items.length} done</Pill>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {sem.items.map((item: SemItem, ii: number) => {
                  const isDone = profile.roadmap_completions?.[`sem${si}_item${ii}`] ?? item.done;
                  return (
                    <div key={ii} onClick={() => toggle(si, ii)} style={{
                      display: 'flex', alignItems: 'center', gap: 13,
                      padding: '11px 14px', borderRadius: 11, cursor: 'pointer',
                      background: isDone ? `${C.lime}0d` : C.panel2,
                      border: `1px solid ${isDone ? C.lime + '44' : C.line}`,
                      transition: 'all .15s',
                    }}>
                      <div style={{ flexShrink: 0 }}>
                        {isDone
                          ? <CheckCircle2 size={18} color={C.lime} />
                          : <Circle size={18} color={C.faint} />}
                      </div>
                      <div style={{ flex: 1, fontSize: 14, color: isDone ? C.faint : C.text, fontFamily: FONT_BODY, textDecoration: isDone ? 'line-through' : 'none' }}>
                        {item.t}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
