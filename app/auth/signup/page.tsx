'use client';
import { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { C, FONT_DISPLAY, FONT_BODY, FONT_MONO, inputStyle, btnPrimary, Panel } from '@/components/ui';
import { Compass, Github, ArrowRight, GraduationCap, Briefcase } from '@/components/icons';

export default function Signup() {
  return <Suspense><SignupInner /></Suspense>;
}

function SignupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [type, setType] = useState<'student' | 'recruiter'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get('type') === 'recruiter') setType('recruiter');
  }, [params]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (pass.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    setLoading(true);

    // Create user server-side (no email sent, no rate limits)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name, account_type: type }),
    });
    const json = await res.json();
    if (!res.ok) { setErr(json.error ?? 'Signup failed'); setLoading(false); return; }

    // Sign in immediately to get a session
    const sb = createClient();
    const { error: signInErr } = await sb.auth.signInWithPassword({ email, password: pass });
    if (signInErr) { setErr(signInErr.message); setLoading(false); return; }

    router.push('/onboard');
  };

  const oauthGoogle = async () => {
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?type=${type}` },
    });
  };

  const oauthGithub = async () => {
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/callback?type=${type}` },
    });
  };

  const logo = (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', justifyContent: 'center', marginBottom: 36 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: C.lime, display: 'grid', placeItems: 'center' }}>
        <Compass size={20} color="#fff" />
      </div>
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.text, lineHeight: 1 }}>Co-Pilot</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.faint, letterSpacing: 1 }}>CAREER OS</div>
      </div>
    </Link>
  );


  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'grid', placeItems: 'center', padding: '30px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {logo}

        <Panel>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 600, margin: '0 0 6px' }}>Create your account</h1>
          <p style={{ color: C.dim, fontSize: 13.5, margin: '0 0 22px' }}>Your career co-pilot is waiting.</p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 22, background: C.panel2, borderRadius: 11, padding: 4 }}>
            {(['student', 'recruiter'] as const).map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: type === t ? 600 : 400,
                background: type === t ? C.panel : 'transparent',
                color: type === t ? C.text : C.dim,
                boxShadow: type === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                transition: 'all .18s',
              }}>
                {t === 'student' ? <GraduationCap size={15} /> : <Briefcase size={15} />}
                {t === 'student' ? 'Student' : 'Recruiter'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <button onClick={oauthGoogle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '11px 16px', background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 14, color: C.text }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button onClick={oauthGithub} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '11px 16px', background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 14, color: C.text }}>
              <Github size={18} />
              Continue with GitHub
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: C.line }} />
            <span style={{ fontSize: 12, color: C.faint }}>or</span>
            <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Full name</div>
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={{ ...inputStyle }} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Email</div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder={type === 'student' ? 'you@university.edu' : 'you@company.com'} style={{ ...inputStyle }} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Password</div>
              <input type="password" required value={pass} onChange={e => setPass(e.target.value)}
                placeholder="At least 8 characters" style={{ ...inputStyle }} />
            </div>
            {type === 'recruiter' && (
              <div style={{ background: `${C.cyan}14`, border: `1px solid ${C.cyan}33`, borderRadius: 10, padding: '11px 14px', fontSize: 13, color: C.dim }}>
                Recruiter accounts require verification before accessing the talent pool. You&apos;ll be notified by email.
              </div>
            )}
            {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#dc2626' }}>{err}</div>}
            <button type="submit" disabled={loading} style={{ ...btnPrimary, justifyContent: 'center', padding: '13px 20px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account…' : <>Create account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: C.faint }}>
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </Panel>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: C.dim }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: C.lime, textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
