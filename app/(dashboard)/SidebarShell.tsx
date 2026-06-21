'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile } from '@/lib/engine';
import { C, FONT_DISPLAY, FONT_MONO, FONT_BODY } from '@/components/ui';
import {
  Compass, Activity, GitCompareArrows, Hammer, Users, FileText,
  Settings, Navigation, LogOut, X
} from '@/components/icons';
import { ChatBot } from '@/components/ChatBot';

const NAV_GROUPS = [
  {
    label: 'GPS',
    items: [
      { href: '/dashboard', icon: Navigation, label: 'CareerGPS' },
      { href: '/roadmap', icon: Compass, label: 'Roadmap' },
    ],
  },
  {
    label: 'GROW',
    items: [
      { href: '/compare', icon: GitCompareArrows, label: 'Skill Gap Analysis' },
      { href: '/projects', icon: Hammer, label: 'Projects' },
      { href: '/progress', icon: Activity, label: 'Progress' },
    ],
  },
  {
    label: 'CONNECT',
    items: [
      { href: '/cohort', icon: Users, label: 'Peer Cohort' },
      { href: '/resume', icon: FileText, label: 'Resume Builder' },
    ],
  },
];

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const prof = computeProfile(profile);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/');
  };

  const yearNum = profile.year?.replace('Year ', '') ?? '';
  const userSubtitle = [yearNum ? `Y${yearNum}` : '', prof.role].filter(Boolean).join(' · ');
  const initial = (profile.name?.[0] ?? '?').toUpperCase();

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: typeof Navigation; label: string }) => {
    const active = pathname === href;
    return (
      <Link href={href} onClick={() => setMobileOpen(false)} style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '10px 14px', borderRadius: 10, textDecoration: 'none', marginBottom: 2,
        background: active ? `${C.lime}18` : 'transparent',
        color: active ? C.lime : C.dim,
        fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: active ? 600 : 400,
        transition: 'background .15s, color .15s',
      }}>
        <Icon size={16} color={active ? C.lime : C.faint} />
        {label}
      </Link>
    );
  };

  const sidebar = (
    <div style={{
      width: 252, height: '100vh', background: C.panel, borderRight: `1px solid ${C.line}`,
      display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 18px' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.lime, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Compass size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.text, lineHeight: 1.1, fontWeight: 600 }}>Co-Pilot</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.faint, letterSpacing: 1.5, marginTop: 2 }}>CAREER OS</div>
          </div>
        </Link>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, padding: '6px 12px', overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: 22 }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: 1.5,
              color: C.faint, padding: '0 14px', marginBottom: 6, textTransform: 'uppercase',
            }}>{group.label}</div>
            {group.items.map(item => (
              <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
            ))}
          </div>
        ))}

        <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14, marginTop: 4 }}>
          <NavLink href="/settings" icon={Settings} label="Settings" />
        </div>
      </nav>

      {/* User card + logout */}
      <div style={{ padding: '12px 14px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 11,
          padding: '12px 14px', borderRadius: 12, marginBottom: 8,
          border: `1px solid ${C.line}`, background: C.panel2,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: C.lime,
            display: 'grid', placeItems: 'center', flexShrink: 0,
            fontFamily: FONT_DISPLAY, fontSize: 15, color: '#fff', fontWeight: 600,
          }}>{initial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>{userSubtitle}</div>
          </div>
        </div>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
          background: 'transparent', color: C.faint, fontFamily: FONT_BODY, fontSize: 13,
        }}>
          <LogOut size={14} color={C.faint} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', background: C.bg, minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <div className="no-print" style={{ display: 'none' }} id="sb-desktop">
        {sidebar}
      </div>
      <style>{`@media (min-width: 768px) { #sb-desktop { display: block !important; } #sb-mobile-btn { display: none !important; } }`}</style>

      {/* Mobile hamburger */}
      <button id="sb-mobile-btn" onClick={() => setMobileOpen(true)} style={{
        position: 'fixed', top: 14, left: 14, zIndex: 50, width: 40, height: 40,
        borderRadius: 10, background: C.panel, border: `1px solid ${C.line}`,
        cursor: 'pointer', display: 'grid', placeItems: 'center',
      }}>
        <Compass size={20} color={C.lime} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 39 }} />
          <div style={{ position: 'fixed', inset: '0 auto 0 0', zIndex: 40 }}>
            <button onClick={() => setMobileOpen(false)} style={{
              position: 'absolute', top: 12, right: -46, width: 36, height: 36,
              borderRadius: 9, background: C.panel, border: `1px solid ${C.line}`,
              cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}><X size={18} /></button>
            {sidebar}
          </div>
        </>
      )}

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, minHeight: '100vh' }} id="main-content">
        <style>{`@media (min-width: 768px) { #main-content { margin-left: 252px; } }`}</style>
        {children}
      </main>

      <ChatBot />
    </div>
  );
}
