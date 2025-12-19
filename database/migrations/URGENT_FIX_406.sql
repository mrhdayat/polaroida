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
