'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { C, FONT_DISPLAY, FONT_BODY, FONT_MONO } from '@/components/ui';
import { Compass, LogOut } from '@/components/icons';

export default function RecruiterPage() {
  const router = useRouter();

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: C.lime, display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}>
          <Compass size={28} color="#fff" />
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: C.lime, marginBottom: 10 }}>RECRUITER PORTAL</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: C.text, margin: '0 0 12px' }}>Coming soon</h1>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.dim, lineHeight: 1.7, margin: '0 0 32px' }}>
          The recruiter portal is under construction. You will be able to browse verified student profiles, track candidates, and reach out directly once it is ready.
        </p>
        <button onClick={logout} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 10, border: '1px solid ' + C.line,
          background: C.panel, cursor: 'pointer', fontFamily: FONT_BODY,
          fontSize: 13.5, color: C.dim,
        }}>
          <LogOut size={14} /> Log out
        </button>
      </div>
    </div>
  );
}
