import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { email, password, name, account_type } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Create user pre-confirmed — no email sent
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, account_type: account_type ?? 'student' },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Create profile row immediately
  const { error: profileErr } = await admin.from('profiles').insert({
    id: data.user.id,
    name: name.trim(),
    email,
    account_type: account_type ?? 'student',
    google_verified: false,
  });

  if (profileErr) {
    // User was created — still let them through, onboard will upsert profile
    console.error('Profile insert error:', profileErr.message);
  }

  return NextResponse.json({ success: true });
}
