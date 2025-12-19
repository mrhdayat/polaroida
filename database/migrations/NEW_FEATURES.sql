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
