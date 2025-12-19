-- Add ui_theme_style column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ui_theme_style text DEFAULT 'classic';

-- Add check constraint to ensure valid values (optional but good practice)
-- Note: 'classic', 'vintage', 'minimal', 'pastel', 'darkroom', 'monochrome'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_ui_theme_style_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_ui_theme_style_check 
  CHECK (ui_theme_style IN ('classic', 'vintage', 'minimal', 'pastel', 'darkroom', 'monochrome'));

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
