import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { message, context } = await req.json();
  const { profile, prof } = context ?? {};

  const systemPrompt = `You are MentorAI, a career advisor embedded in Career Co-Pilot — a platform that helps CS students go from their first year to their first job.

You have full context about this student:
- Name: ${profile?.name}
- Year: ${profile?.year}, Degree: ${profile?.degree}
- Goal track: ${profile?.interest}
- Region: ${profile?.region}
- Skills: ${profile?.skills?.join(', ') || 'none listed'}
- Readiness score: ${prof?.readiness}/100
- Role target: ${prof?.role}
- Skills matched: ${prof?.matched}, gaps: ${prof?.missing}
- Free hours/week: ${profile?.free_hours}

Give short, specific, actionable advice. Use the student's real data — not generic advice. Be encouraging but honest. Max 3 sentences unless they ask for a detailed breakdown.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.content[0]?.type === 'text' ? response.content[0].text : 'I had trouble with that. Try rephrasing?';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[chat API]', err);
    return NextResponse.json({ reply: 'MentorAI is temporarily unavailable. Check your API key in .env.local.' }, { status: 200 });
  }
}
