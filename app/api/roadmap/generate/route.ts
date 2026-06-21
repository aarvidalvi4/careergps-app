import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { profile } = await req.json();

  const prompt = `Generate a detailed semester-by-semester learning roadmap for a ${profile.year} ${profile.degree} student targeting a ${profile.interest} role.

Student context:
- Current skills: ${profile.skills?.join(', ') || 'beginner'}
- Free hours per week: ${profile.free_hours}
- Region: ${profile.region}
- Projects done: ${profile.projects_done}

Return a JSON array of semesters. Each semester has:
{
  "label": "Semester 1 — Foundations",
  "items": [
    { "title": "Learn X", "sub": "Why this matters", "hours": 10, "icon": "BookOpen" }
  ]
}

icon must be one of: BookOpen, Code2, Database, Brain, Compass, Clock.
Keep each semester to 4-6 items. 4 semesters total. Be specific to the ${profile.interest} track.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found in response');

    const roadmap = JSON.parse(match[0]);
    return NextResponse.json({ roadmap });
  } catch (err) {
    console.error('[roadmap generate]', err);
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 });
  }
}
