import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type') as 'student' | 'recruiter' | null;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Ensure profile row exists (handles email-confirmation flow where signup page couldn't create it)
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.user_metadata?.name || '',
          email: user.email ?? '',
          account_type: type || user.user_metadata?.account_type || 'student',
          google_verified: false,
        }, { onConflict: 'id', ignoreDuplicates: true });

        const { data: profile } = await supabase.from('profiles').select('onboarded, account_type').eq('id', user.id).single();
        if (!profile?.onboarded) return NextResponse.redirect(`${origin}/onboard`);
        if (profile?.account_type === 'recruiter') return NextResponse.redirect(`${origin}/recruiter`);
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}
