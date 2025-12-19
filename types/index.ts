export type FrameStyle = 'classic' | 'black' | 'mint' | 'blush' | 'sky' | 'striped';
export type ThemePreference = 'light' | 'dark' | 'auto'; // Keeping for legacy/compatibility if needed, or remove? Request says "hapus theme dark/light", but strictly it meant the toggle. keeping types is safe.
export type ThemeStyle = 'classic' | 'vintage' | 'minimal' | 'pastel' | 'darkroom' | 'monochrome';

export interface Profile {
  id: string;
  full_name: string | null;
  theme_preference: ThemePreference; // Legacy
  frame_style: FrameStyle;
  ui_theme_style: ThemeStyle;
}

export interface Album {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  cover_photo_id?: string;
}

export interface StyleConfig {
  filter: string;
  brightness: number;
  contrast: number;
  warmth: number;
  vignette: number;
  grain: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Photo {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  taken_at: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  device_info?: string;
  weather?: string;
  frame_style: FrameStyle;
  filter_style?: string; // Legacy simple filter
  style_config?: StyleConfig; // Rich edit config
  album_id?: string;
  created_at: string;
}
