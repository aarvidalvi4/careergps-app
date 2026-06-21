'use client';
import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile, buildProjects } from '@/lib/engine';
import { C, FONT_DISPLAY, FONT_MONO, Panel, Pill, Head, btnPrimary, btnGhost } from '@/components/ui';
import { Hammer, CheckCircle2, Lock, Github, ExternalLink, Star } from '@/components/icons';
import type { ProjectItem } from '@/lib/types';

export default function Projects() {
  const { profile, updateProfile } = useProfile();
  const prof = computeProfile(profile);
  const projects = buildProjects(profile, prof);
  const [shipping, setShipping] = useState<string | null>(null);

  const markShipped = async (title: string) => {
    setShipping(title);
    const next = profile.projects_done + 1;
    await updateProfile({ projects_done: next });
    setShipping(null);
  };

  const storedProject = (title: string): ProjectItem | undefined =>
    profile.project_list.find(p => p.title === title);

  const statusColor = (s: string) =>
    s === 'done' ? C.lime : s === 'active' ? C.cyan : C.faint;

  return (
    <div className="fade" style={{ padding: '32px 5vw', maxWidth: 1100 }}>
      <Head
        kicker="PROJECT LADDER"
        title="Build your portfolio"
        desc="One real project per month — scoped to what you actually know. Each one ships or counts as in-progress."
      />

      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { l: 'Shipped', v: projects.filter(p => p.status === 'done').length, c: C.lime },
          { l: 'In progress', v: projects.filter(p => p.status === 'active').length, c: C.cyan },
          { l: 'Upcoming', v: projects.filter(p => p.status === 'locked').length, c: C.faint },
        ].map(s => (
          <div key={s.l} style={{ padding: '12px 18px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.faint }}>{s.l}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {projects.map(proj => {
          const color = statusColor(proj.status);
          const stored = storedProject(proj.title);
          return (
            <Panel key={proj.title} accent={color} style={{ opacity: proj.status === 'locked' ? 0.55 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {proj.status === 'done' ? <CheckCircle2 size={22} color={C.lime} /> :
                     proj.status === 'active' ? <Hammer size={22} color={C.cyan} /> :
                     <Lock size={22} color={C.faint} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17 }}>{proj.title}</div>
                      <Pill color={color}>{proj.status === 'done' ? 'Shipped' : proj.status === 'active' ? 'Active' : 'Locked'}</Pill>
                      {proj.level && <Pill color={C.violet}>{proj.level}</Pill>}
                    </div>
                    {proj.stack && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {proj.stack.map((s: string) => <Pill key={s} color={C.cyan}>{s}</Pill>)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  {stored?.gh_url && (
                    <a href={stored.gh_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, background: C.panel2, border: `1px solid ${C.line}`, color: C.text, textDecoration: 'none', fontSize: 12.5 }}>
                      <Github size={14} /> GitHub
                    </a>
                  )}
                  {proj.status === 'active' && (
                    <button onClick={() => markShipped(proj.title)} disabled={shipping === proj.title} style={{ ...btnPrimary, fontSize: 12.5, padding: '8px 14px', opacity: shipping === proj.title ? 0.6 : 1 }}>
                      {shipping === proj.title ? 'Saving…' : <><Star size={13} /> Mark shipped</>}
                    </button>
                  )}
                </div>
              </div>

              {proj.stretch && (
                <div style={{ marginTop: 12, padding: '9px 13px', background: `${C.violet}0d`, borderRadius: 9, fontSize: 12.5, color: C.violet }}>
                  <strong>Stretch goal:</strong> {proj.stretch}
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
