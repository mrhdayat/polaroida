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
