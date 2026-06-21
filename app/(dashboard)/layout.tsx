import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileProvider } from '@/context/ProfileContext';
import { SidebarShell } from './SidebarShell';
import type { UserProfile } from '@/lib/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch flat profile
  const { data: raw } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!raw?.onboarded) redirect('/onboard');

  // Fetch related data in parallel
  const [skillsRes, projectsRes, internshipsRes] = await Promise.all([
    supabase.from('user_skills').select('skill').eq('user_id', user.id),
    supabase.from('user_projects').select('*').eq('user_id', user.id),
    supabase.from('user_internships').select('*').eq('user_id', user.id),
  ]);

  const profile: UserProfile = {
    ...raw,
    skills: skillsRes.data?.map((r: { skill: string }) => r.skill) ?? [],
    project_list: projectsRes.data ?? [],
    internships: internshipsRes.data ?? [],
  };

  return (
    <ProfileProvider initial={profile}>
      <SidebarShell>{children}</SidebarShell>
    </ProfileProvider>
  );
}
