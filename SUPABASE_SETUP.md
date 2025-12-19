# Panduan Setup Supabase untuk Polaroida

Karena ada kendala biaya dengan Firebase, kita beralih ke **Supabase**. Supabase adalah alternatif Firebase open-source yang sangat powerful dan memiliki **free tier** yang dermawan (Database PostgreSQL, Auth, dan Storage).

Ikuti langkah-langkah berikut:

## 1. Buat Project Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan login (bisa pakai GitHub).
2. Klik **New Project**.
3. Pilih Organisasi (jika ada) atau buat baru.
4. Isi form:
   - **Name**: `Polaroida`
   - **Database Password**: (Buat yang kuat dan *SIMPAN*, kita tidak butuh untuk config app tapi penting untuk akses langsung).
   - **Region**: Pilih yang terdekat (misal: Singapore `ap-southeast-1` atau US).
   - **Pricing Plan**: Pastikan pilih **Free**.
5. Klik **Create new project**. Tunggu beberapa menit hingga database siap.

## 2. Setup Database (SQL Editor)
Kita perlu membuat tabel untuk menyimpan data foto. Kuta gunakan PostgreSQL.
1. Di sidebar kiri, klik icon **SQL Editor** (Terminal icon).
2. Klik **New Query** (blank).
3. Copy-paste script SQL berikut untuk membuat tabel `photos` dan mengatur security (RLS):

```sql
-- Create photos table
create table public.photos (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  image_url text not null,
  caption text,
  location text,
  device text,
  weather text,
  taken_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.photos enable row level security;

-- Policy: Semua orang boleh melihat foto (Public Feed)
create policy "Public photos are viewable by everyone"
  on public.photos for select
  using (true);

-- Policy: User hanya boleh upload foto miliknya sendiri
create policy "Users can insert their own photos"
  on public.photos for insert
  with check (auth.uid() = user_id);

-- Policy: User hanya boleh update/delete foto miliknya sendiri
create policy "Users can update own photos"
  on public.photos for update
  using (auth.uid() = user_id);

create policy "Users can delete own photos"
  on public.photos for delete
  using (auth.uid() = user_id);
```
4. Klik **Run** (tombol hijau play).

## 3. Setup Storage
1. Di sidebar kiri, klik icon **Storage** (Folder icon).
2. Klik **New Bucket** > **Create a new bucket**.
3. Isi detail:
   - **Name**: `photos`
   - **Public bucket**: **AKTIFKAN** (Switch ON). Ini penting agar foto bisa diakses via URL.
4. Klik **Save**.
5. Setelah bucket jadi, buka tab **Configuration** > **Policies**.
6. Klik **New Policy** di bawah "photos".
7. Pilih "Get started quickly" -> pilih opsi pertama "Give users access to all files" -> Use this template.
8. (Lebih aman) Edit policy manual agar:
   - SELECT (Read): Anyone (Anon).
   - INSERT/UPDATE/DELETE: Authenticated Users only.
   - *Alternatif cepat untuk dev*: Allow all operations for authenticated users.

## 4. Setup Authentication (Site URL)
1. Di sidebar kiri, klik **Authentication** > **URL Configuration**.
2. Pastikan **Site URL** adalah `http://localhost:3000` (untuk dev).
3. Jika nanti deploy ke Vercel, tambahkan URL Vercel produksi (misal `https://polaroida.vercel.app`) di **Redirect URLs**.

## 5. Dapatkan API Keys
1. Di sidebar kiri, klik icon **Settings** (Gear) > **API**.
2. Temukan bagian **Project API keys**.
3. Salin **Project URL** dan **anon public** key.

## 6. Update Environment Variables
Buat/Update file `.env.local` di root project Anda dengan credential di atas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

*Catatan: Tidak perlu service role key untuk aplikasi standar ini, anon key sudah cukup aman berkat RLS (Row Level Security).*
