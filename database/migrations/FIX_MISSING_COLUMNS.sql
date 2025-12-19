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
