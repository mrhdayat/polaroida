-- Add ui_theme_style column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ui_theme_style text DEFAULT 'classic';

-- Add check constraint to ensure valid values (optional but good practice)
-- Note: 'classic', 'vintage', 'minimal', 'pastel', 'darkroom', 'monochrome'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_ui_theme_style_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_ui_theme_style_check 
  CHECK (ui_theme_style IN ('classic', 'vintage', 'minimal', 'pastel', 'darkroom', 'monochrome'));

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
-- Ensure the column exists with the correct type
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ui_theme_style text DEFAULT 'classic';

-- verify the constraint is correct
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_ui_theme_style_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_ui_theme_style_check -- re-add
  CHECK (ui_theme_style IN ('classic', 'vintage', 'minimal', 'pastel', 'darkroom', 'monochrome'));

-- GRANT permissions incase that's the issue (406 can sometimes mask 403 or schema visibility issues)
GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO anon;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload config';
-- EMERGENCY FIX: Run this to fix missing columns and permissions
-- Buka Supabase Dashboard > SQL Editor > Paste ini > Run

-- 1. Pastikan kolom location_name dan lainnya ada
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS location_name text;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS location_lat double precision;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS location_lng double precision;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS weather text;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS device_info text;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.albums(id);
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS filter_style text DEFAULT 'normal';

-- 2. Fix RLS Profile (Agar bisa ganti Tema)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- 3. Fix RLS Albums (Agar bisa upload ke album)
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own albums" ON public.albums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create albums" ON public.albums FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload config';
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
-- ===================================================
-- NEW FEATURES SETUP (Detailed Dazz Cam & Journaling)
-- RUN THIS IN SUPABASE SQL EDITOR
-- ===================================================

-- 1. TAGS SYSTEM
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photo_tags (
  photo_id uuid REFERENCES public.photos(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);

-- 2. STYLE CONFIGURATION (For Non-Destructive Editing)
-- Stores: filter, brightness, contrast, warmth, vignette, grain, frame
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS style_config jsonb DEFAULT '{}'::jsonb;

-- 3. USER PRESETS & PREFERENCES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_presets jsonb DEFAULT '[]'::jsonb; -- Array of {name, config}

-- 4. RLS POLICIES FOR TAGS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can read tags
CREATE POLICY "Tags are public" ON public.tags FOR SELECT USING (true);
-- Authenticated users can create tags
CREATE POLICY "Users can create tags" ON public.tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Everyone can read photo tags
CREATE POLICY "Photo tags are public" ON public.photo_tags FOR SELECT USING (true);
-- Users can tag their own photos
CREATE POLICY "Users can tag own photos" ON public.photo_tags FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.photos 
    WHERE id = photo_id AND user_id = auth.uid()
  )
);

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload config';
-- Database Schema & Security for Polaroida
-- Run this in Supabase SQL Editor to upgrade your database for Advanced Features.

-- 1. Create Profiles Table (Triggered by Auth)
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  full_name text,
  theme_preference text default 'auto' check (theme_preference in ('light', 'dark', 'auto')),
  frame_style text default 'classic' check (frame_style in ('classic', 'mint', 'blush', 'sky')),
  created_at timestamptz default now()
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create Albums Table
create table public.albums (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_photo_id uuid, -- Reference to a photo
  created_at timestamptz default now()
);

-- RLS for Albums
alter table public.albums enable row level security;
create policy "Users can view own albums" on public.albums for select using (auth.uid() = user_id);
create policy "Users can create albums" on public.albums for insert with check (auth.uid() = user_id);
create policy "Users can update own albums" on public.albums for update using (auth.uid() = user_id);
create policy "Users can delete own albums" on public.albums for delete using (auth.uid() = user_id);

-- 3. Update Photos Table (Add new columns)
-- Check if columns exist first to avoid errors if re-running
alter table public.photos add column if not exists album_id uuid references public.albums(id) on delete set null;
alter table public.photos add column if not exists location_lat double precision;
alter table public.photos add column if not exists location_lng double precision;
alter table public.photos add column if not exists weather text;
alter table public.photos add column if not exists device_info text;
alter table public.photos add column if not exists resolution text;
alter table public.photos add column if not exists frame_style text default 'classic';

-- 4. Create Tags Table for Auto-tagging
create table public.tags (
  id uuid not null default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

alter table public.tags enable row level security;
create policy "Tags are viewable by everyone" on public.tags for select using (true);
create policy "Authenticated users can create tags" on public.tags for insert with check (auth.role() = 'authenticated');

-- 5. Photo Tags Junction Table
create table public.photo_tags (
  photo_id uuid not null references public.photos(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (photo_id, tag_id)
);

alter table public.photo_tags enable row level security;
create policy "Photo tags viewable by everyone" on public.photo_tags for select using (true);
create policy "Photo owner can add tags" on public.photo_tags for insert with check (
  exists (select 1 from public.photos where id = photo_id and user_id = auth.uid())
);
-- 1. Reload Schema Cache (CRITICAL for 406 Error)
NOTIFY pgrst, 'reload config';

-- 2. Verify Column Exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ui_theme_style text DEFAULT 'classic';

-- 3. Reset Permissions (Just in case)
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- 4. Check if the user exists and insert if missing (idempotent fix)
insert into public.profiles (id, full_name, theme_preference, frame_style, ui_theme_style)
values ('72fc110d-e292-4ff8-ae82-d356ee1098d4', 'User', 'auto', 'classic', 'classic')
on conflict (id) do update 
set ui_theme_style = 'classic'; -- Temporarily reset to classic to ensure valid data
