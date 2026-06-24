import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Compact profile summary — keeps the system prompt short so it fits in cache
function buildSystemPrompt(profile: Record<string, unknown>, prof: Record<string, unknown>): string {
  const matched = (prof.matched as string[] | undefined) ?? [];
  const missing = (prof.missing as string[] | undefined) ?? [];

  return `You are MentorAI — the embedded career co-pilot inside Career Co-Pilot, a platform helping CS students land their first job.

STUDENT SNAPSHOT (always use this real data, never invent facts):
• Name: ${profile.name}
• Degree: ${profile.degree}, ${profile.year} — region: ${profile.region}
• Target role: ${prof.role} (interest: ${profile.interest})
• Readiness: ${prof.readiness}/100${Number(prof.readiness) < 40 ? ' — significant gaps remain' : Number(prof.readiness) < 70 ? ' — on track' : ' — strong position'}
• Free time: ${profile.free_hours} hrs/week
• Skills already owned: ${matched.length > 0 ? matched.join(', ') : 'none listed yet'}
• Top skill gaps (highest leverage first): ${missing.length > 0 ? missing.slice(0, 5).join(', ') : 'none — all role skills covered!'}
• Projects shipped: ${profile.projects_done ?? 0}
• Internships: ${(profile.internships as unknown[])?.length ?? 0}

HOW TO RESPOND:
1. Always reference the student's real data — name their actual gaps, not generic ones.
2. Be specific: name skills, suggest concrete resources or timelines based on their free hours.
3. Default to 2–3 sentences. Only go longer if they explicitly ask for a breakdown or plan.
4. Be honest but encouraging — if readiness is low, acknowledge it and give a path forward.
5. For "what next?" questions: pick their #1 gap and tell them exactly what to do this week given ${profile.free_hours} free hours.
6. Never mention that you are Claude or that you use an AI model. You are MentorAI.`;
}

export async function POST(req: NextRequest) {
  let body: { message?: unknown; history?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ reply: 'Bad request — could not parse message.' }, { status: 400 });
  }

  const { message, history = [], context } = body as {
    message?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    context?: { profile: Record<string, unknown>; prof: Record<string, unknown> };
  };

  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ reply: 'Send me a message!' }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json({ reply: 'That message is a bit long — try keeping it under 1000 characters.' }, { status: 400 });
  }

  const profile = context?.profile ?? {};
  const prof = context?.prof ?? {};

  // Keep at most last 6 turns (3 exchanges) for context without blowing token budget
  const priorTurns = (Array.isArray(history) ? history : []).slice(-6);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: buildSystemPrompt(profile, prof),
      messages: [
        ...priorTurns.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message.trim() },
      ],
    });

    const reply =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : "I didn't quite get that — could you rephrase?";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    // Log full details server-side only — never expose to the user
    const status = (err as { status?: number })?.status;
    const errMsg = (err as { message?: string })?.message ?? String(err);
    console.error('[MentorAI]', status, errMsg);

    const reply = status === 429
      ? "I'm taking a quick break — give me 30 seconds and try again!"
      : "I'm taking a quick break — try again in a moment!";

    return NextResponse.json({ reply });
  }
}
