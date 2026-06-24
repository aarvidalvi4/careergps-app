'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile, ProjectItem, InternshipItem } from '@/lib/types';

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setProfile: (p: UserProfile) => void;
}

const ProfileContext = createContext<ProfileContextType>(null!);

export function ProfileProvider({ children, initial }: { children: ReactNode; initial: UserProfile }) {
  const [profile, setProfile] = useState<UserProfile>(initial);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const supabase = createClient();
    const { skills, project_list, internships, ...profileFields } = updates;

    // Persist profile scalar fields
    if (Object.keys(profileFields).length > 0) {
      await supabase.from('profiles').update(profileFields).eq('id', profile.id);
    }

    // Replace skills
    if (skills !== undefined) {
      await supabase.from('user_skills').delete().eq('user_id', profile.id);
      if (skills.length > 0) {
        await supabase.from('user_skills').insert(
          skills.map(s => ({ user_id: profile.id, skill: s }))
        );
      }
    }

    // Replace custom projects
    if (project_list !== undefined) {
      await supabase.from('user_projects').delete().eq('user_id', profile.id);
      if (project_list.length > 0) {
        await supabase.from('user_projects').insert(
          project_list.map((p: ProjectItem) => ({
            user_id:     profile.id,
            title:       p.title,
            stack:       p.stack,
            description: p.description ?? null,
            gh_url:      p.gh_url ?? null,
            shipped:     p.shipped ?? false,
            level:       p.level ?? null,
          }))
        );
      }
    }

    // Replace internships
    if (internships !== undefined) {
      await supabase.from('user_internships').delete().eq('user_id', profile.id);
      if (internships.length > 0) {
        await supabase.from('user_internships').insert(
          internships.map((i: InternshipItem) => ({ user_id: profile.id, title: i.title, company: i.company, start: i.start, end: i.end, description: i.description }))
        );
      }
    }

    setProfile(p => ({ ...p, ...updates }));
  }, [profile.id]);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
