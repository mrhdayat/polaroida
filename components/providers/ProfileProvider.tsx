"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile, FrameStyle, ThemeStyle } from "@/types";

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  updateFrameStyle: (style: FrameStyle) => Promise<void>;
  updateThemeStyle: (style: ThemeStyle) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  updateFrameStyle: async () => { },
  updateThemeStyle: async () => { },
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('profile_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        if (payload.new) setProfile(payload.new as Profile);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync theme to body class for global scope (Modals/Portals)
  useEffect(() => {
    // Reset classes first
    const theme = profile?.ui_theme_style || 'classic';
    // Remove any existing theme-* classes to avoid conflicts
    document.body.classList.forEach(cls => {
      if (cls.startsWith('theme-')) document.body.classList.remove(cls);
    });
    document.body.classList.add(`theme-${theme}`);

    // Also set data-theme attribute for easier styling/debugging
    document.body.setAttribute('data-theme', theme);
  }, [profile?.ui_theme_style]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Critical Error fetching profile:", error);
      // Fallback to avoid breaking UI if fetch fails
      setProfile({
        id: user.id,
        full_name: user.email?.split('@')[0] || 'User',
        theme_preference: 'light',
        frame_style: 'classic',
        ui_theme_style: 'classic'
      } as Profile);
    }

    if (data) {
      setProfile(data as Profile);
    }
    setLoading(false);
  };



  const updateThemeStyle = async (style: ThemeStyle) => {
    if (!profile) return;

    // Optimistic Update
    setProfile({ ...profile, ui_theme_style: style });
    // Immediate DOM update for responsiveness
    document.body.classList.forEach(cls => {
      if (cls.startsWith('theme-')) document.body.classList.remove(cls);
    });
    document.body.classList.add(`theme-${style}`);
    document.body.setAttribute('data-theme', style);

    await supabase.from('profiles').update({ ui_theme_style: style }).eq('id', profile.id);
  };

  const updateFrameStyle = async (style: FrameStyle) => {
    if (!profile) return;
    await supabase.from('profiles').update({ frame_style: style }).eq('id', profile.id);
    setProfile({ ...profile, frame_style: style });
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateFrameStyle, updateThemeStyle }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
