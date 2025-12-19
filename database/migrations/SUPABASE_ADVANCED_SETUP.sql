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
