-- ==========================================
-- FORCE FIX SCRIPT FOR POLAROIDA
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR
-- ==========================================

-- 1. Force Add Columns (Idempotent: won't fail if they exist)
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS location_name text;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS location_lat double precision;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS location_lng double precision;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS weather text;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS device_info text;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.albums(id);
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS filter_style text DEFAULT 'normal';

-- 2. Force Add Columns to Profiles (Just in case)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'auto';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS frame_style text DEFAULT 'classic';

-- 3. Fix RLS Policies for Profiles (Crucial for Theme Switching)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view everyone photos" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Allow users to read any profile (basic)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update THEIR OWN profile
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert THEIR OWN profile
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 4. Fix RLS for Albums (Crucial for Upload to Album)
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own albums" ON public.albums;
DROP POLICY IF EXISTS "Users can create albums" ON public.albums;

CREATE POLICY "Users can view own albums" ON public.albums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create albums" ON public.albums FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. RELOAD SCHEMA CACHE (Fixes the "Could not find column" error)
NOTIFY pgrst, 'reload config';
