'use client';
import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile } from '@/lib/engine';
import { SEED_PEERS } from '@/lib/constants';
import { C, FONT_DISPLAY, FONT_MONO, FONT_BODY, Panel } from '@/components/ui';
import type { SeedPeer } from '@/lib/types';

function parseYear(y: string): number {
  const n = parseInt(y, 10);
  return Number.isNaN(n) ? 1 : n;
}

export default function Cohort() {
  const { profile } = useProfile();
  const prof = computeProfile(profile);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://careergps-alpha.vercel.app';

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const myYear: number = parseYear(profile.year);

  const me: SeedPeer = {
    name: profile.name,
    year: myYear,
    region: profile.region,
    role: prof.role,
    skills: profile.skills.slice(),
    projects: profile.projects_done,
    readiness: prof.readiness,
    isMe: true,
  };

  const peers = SEED_PEERS.filter(
    (p: SeedPeer) => p.role === prof.role || p.year === myYear,
  );
  const all: SeedPeer[] = [...peers, me].sort((a, b) => b.readiness - a.readiness);
  const myRank = all.findIndex(p => p.isMe) + 1;

  return (
    <div className="fade" style={{ padding: '36px 40px', maxWidth: 1200 }}>

      {/* Leaderboard */}
      <Panel style={{ marginBottom: 16, padding: '22px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {all.map((p: SeedPeer, i: number) => {
            const role = p.role.replace(' Engineer', '').replace('Data / ML', 'Data/ML');
            const barW = Math.max(3, p.readiness);
            return (
              <div key={`${p.name}-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 18px', borderRadius: 12,
                background: p.isMe ? `${C.lime}0d` : C.panel2,
                border: `1px solid ${p.isMe ? C.lime + '44' : C.line}`,
              }}>
                {/* Rank */}
                <div style={{
                  width: 32, fontFamily: FONT_MONO, fontSize: 14,
                  color: i < 3 ? C.amber : C.faint,
                  flexShrink: 0, fontWeight: i < 3 ? 600 : 400,
                }}>#{i + 1}</div>

                {/* Name + role/year */}
                <div style={{ minWidth: 180, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 500, color: C.text, fontFamily: FONT_BODY }}>
                      {p.name}
                    </span>
                    {p.isMe && (
                      <span style={{
                        fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: .5,
                        background: `${C.lime}18`, color: C.lime,
                        border: `1px solid ${C.lime}44`, borderRadius: 20, padding: '2px 8px',
                      }}>YOU</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>
                    {role} · Y{p.year}
                  </div>
                </div>

                {/* Readiness bar */}
                <div style={{ flex: 1, background: C.line, borderRadius: 20, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: `${barW}%`, height: '100%', borderRadius: 20,
                    background: p.readiness >= 70 ? C.cyan : p.readiness >= 40 ? C.lime : C.faint,
                  }} />
                </div>

                {/* Readiness % */}
                <div style={{ fontFamily: FONT_MONO, fontSize: 13.5, color: C.dim, width: 40, textAlign: 'right', flexShrink: 0 }}>
                  {p.readiness}%
                </div>

                {/* Projects */}
                <div style={{ fontSize: 13.5, color: C.amber, width: 40, textAlign: 'right', flexShrink: 0 }}>
                  🔥 {p.projects}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Invite row */}
      <Panel style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ fontSize: 14, color: C.dim }}>
            Invite a classmate — your cohort grows, everyone stays accountable.
          </div>
          <button onClick={() => setInviteOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            borderRadius: 10, background: C.lime, border: 'none', cursor: 'pointer',
            color: '#fff', fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 500, flexShrink: 0,
          }}>
            + Invite classmate
          </button>
        </div>
      </Panel>

      {/* Invite modal */}
      {inviteOpen && (
        <>
          <div onClick={() => setInviteOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 460, background: '#fff', borderRadius: 20, padding: '32px 28px',
            zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,.18)',
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, marginBottom: 8 }}>Invite a classmate</div>
            <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6, marginBottom: 22 }}>
              Share this link with a classmate. Once they sign up, they'll appear in your cohort leaderboard.
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: C.panel2, borderRadius: 12, padding: '12px 16px', marginBottom: 20,
            }}>
              <span style={{ flex: 1, fontSize: 13, color: C.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: FONT_MONO }}>
                {inviteUrl}
              </span>
              <button onClick={copyLink} style={{
                padding: '7px 16px', borderRadius: 8, border: `1px solid ${C.line}`,
                background: copied ? C.lime : '#fff', color: copied ? '#fff' : C.text,
                cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 13, flexShrink: 0,
                transition: 'all .2s',
              }}>
                {copied ? '✓ Copied' : 'Copy link'}
              </button>
            </div>
            <div style={{ fontSize: 12, color: C.faint, marginBottom: 22 }}>
              Your cohort currently has <strong style={{ color: C.text }}>{all.length}</strong> members. You're ranked <strong style={{ color: C.lime }}>#{myRank}</strong>.
            </div>
            <button onClick={() => setInviteOpen(false)} style={{
              width: '100%', padding: '11px', borderRadius: 10, border: `1px solid ${C.line}`,
              background: 'transparent', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 14, color: C.dim,
            }}>
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
