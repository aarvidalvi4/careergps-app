'use client';
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { computeProfile, nextAction, timeToGoal, buildProjects } from '@/lib/engine';
import { C, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ui';
import { Sparkles, X, Send, Bot } from './icons';

interface Message { role: 'user' | 'bot'; t: string }

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [val, setVal] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const prof = computeProfile(profile);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{
        role: 'bot',
        t: `Hey ${profile.name.split(' ')[0]}! I'm MentorAI — I know your roadmap for ${prof.role}. You're ${prof.readiness}/100 ready, about ${timeToGoal(profile, prof)} out. Ask me anything!`,
      }]);
    }
  }, [open]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const send = async () => {
    if (!val.trim() || loading) return;
    const q = val.trim();
    setVal('');
    setMsgs(m => [...m, { role: 'user', t: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, context: { profile, prof } }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: 'bot', t: data.reply }]);
    } catch {
      setMsgs(m => [...m, { role: 'bot', t: `Your next move: ${nextAction(profile, prof)}. Ask me to break it down!` }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') send(); };

  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: 26, right: 26, width: 56, height: 56, borderRadius: '50%',
        background: C.lime, border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center',
        boxShadow: '0 6px 20px rgba(79,70,229,.28)', zIndex: 50,
      }}>
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
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15 }}>MentorAI</div>
              <div style={{ fontSize: 10.5, color: C.lime, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.lime }} />online · reads your CareerGPS
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                <div style={{
                  background: m.role === 'user' ? C.lime : '#eef0f6',
                  color: m.role === 'user' ? '#fff' : C.text,
                  padding: '10px 13px', borderRadius: 13, fontSize: 13, lineHeight: 1.45,
                  borderBottomRightRadius: m.role === 'user' ? 4 : 13,
                  borderBottomLeftRadius: m.role === 'bot' ? 4 : 13,
                }}>{m.t}</div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start' }}>
                <div style={{ background: '#eef0f6', padding: '10px 13px', borderRadius: 13, borderBottomLeftRadius: 4, fontSize: 18, color: C.faint }}>···</div>
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
              style={{ flex: 1, background: '#eef0f6', border: `1px solid ${C.line}`, borderRadius: 11, color: C.text, padding: '10px 13px', fontFamily: FONT_BODY, fontSize: 13, outline: 'none' }}
            />
            <button onClick={send} disabled={loading} style={{ width: 42, background: C.lime, border: 'none', borderRadius: 11, cursor: 'pointer', display: 'grid', placeItems: 'center', opacity: loading ? 0.5 : 1 }}>
              <Send size={17} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
