'use client';
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile, nextAction, timeToGoal } from '@/lib/engine';
import { C, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ui';
import { Sparkles, X, Send, Bot } from './icons';

interface Message { role: 'user' | 'bot'; t: string }

// Fallback replies when the API is unreachable — never a blank screen
const OFFLINE_FALLBACKS = [
  (next: string) => `MentorAI is resting right now. Your next move while I'm away: ${next}`,
  () => "I'm temporarily unavailable — check your internet or try again in a moment!",
  () => "Something went wrong on my end. Your roadmap is still live — keep going!",
];

export function ChatBot() {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState<Message[]>([]);
  const [val, setVal]         = useState('');
  const [loading, setLoading] = useState(false);
  const [errCount, setErrCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const prof = computeProfile(profile);

  // Greet on first open
  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{
        role: 'bot',
        t: `Hey ${profile.name?.split(' ')[0] ?? 'there'}! I'm MentorAI — I know your roadmap for ${prof.role}. You're ${prof.readiness}/100 ready, roughly ${timeToGoal(profile, prof)} from your goal. Ask me anything!`,
      }]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  const send = async () => {
    if (!val.trim() || loading) return;
    const q = val.trim();
    setVal('');

    const newUserMsg: Message = { role: 'user', t: q };
    setMsgs(m => [...m, newUserMsg]);
    setLoading(true);

    // Build history for the API — convert bot→assistant, exclude the greeting
    const allMsgs = [...msgs, newUserMsg];
    const history = allMsgs
      .filter(m => !(m.role === 'bot' && allMsgs.indexOf(m) === 0)) // drop greeting
      .slice(-6)  // last 3 exchanges
      .map(m => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.t }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: history.slice(0, -1), // exclude the current message (sent as `message`)
          context: { profile, prof },
        }),
      });

      if (!res.ok && res.status !== 200) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setMsgs(m => [...m, { role: 'bot', t: data.reply ?? "I didn't catch that — try again?" }]);
      setErrCount(0);
    } catch {
      const fallback = OFFLINE_FALLBACKS[Math.min(errCount, OFFLINE_FALLBACKS.length - 1)];
      setMsgs(m => [...m, { role: 'bot', t: fallback(nextAction(profile, prof)) }]);
      setErrCount(c => c + 1);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') send(); };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open MentorAI chat"
        style={{
          position: 'fixed', bottom: 26, right: 26, width: 56, height: 56,
          borderRadius: '50%', background: C.lime, border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 6px 20px rgba(79,70,229,.28)', zIndex: 50,
        }}
      >
        {open ? <X size={24} color="#fff" /> : <Bot size={26} color="#fff" />}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 94, right: 26, width: 360, height: 480,
          background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18,
          display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(30,27,58,.18)',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.lime, display: 'grid', placeItems: 'center' }}>
              <Sparkles size={17} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15 }}>MentorAI</div>
              <div style={{ fontSize: 10.5, color: C.lime, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.lime, display: 'inline-block' }} />
                online · reads your CareerGPS
              </div>
            </div>
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.faint, letterSpacing: .5 }}>claude-sonnet</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                <div style={{
                  background: m.role === 'user' ? C.lime : '#eef0f6',
                  color: m.role === 'user' ? '#fff' : C.text,
                  padding: '10px 13px', borderRadius: 13, fontSize: 13, lineHeight: 1.5,
                  borderBottomRightRadius: m.role === 'user' ? 4 : 13,
                  borderBottomLeftRadius:  m.role === 'bot'  ? 4 : 13,
                  whiteSpace: 'pre-wrap',
                }}>{m.t}</div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start' }}>
                <div style={{
                  background: '#eef0f6', padding: '10px 16px', borderRadius: 13,
                  borderBottomLeftRadius: 4, fontSize: 18, color: C.faint,
                  letterSpacing: 4,
                }}>···</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: `1px solid ${C.line}`, display: 'flex', gap: 8 }}>
            <input
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about your gaps, projects…"
              maxLength={1000}
              style={{
                flex: 1, background: '#eef0f6', border: `1px solid ${C.line}`,
                borderRadius: 11, color: C.text, padding: '10px 13px',
                fontFamily: FONT_BODY, fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={loading || !val.trim()}
              aria-label="Send message"
              style={{
                width: 42, background: C.lime, border: 'none', borderRadius: 11,
                cursor: loading || !val.trim() ? 'not-allowed' : 'pointer',
                display: 'grid', placeItems: 'center',
                opacity: loading || !val.trim() ? 0.45 : 1,
                transition: 'opacity .15s',
              }}
            >
              <Send size={17} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
