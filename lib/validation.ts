
import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2).max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
  ui_theme_style: z.enum(['classic', 'vintage', 'minimal', 'pastel', 'darkroom', 'monochrome']).optional(),
});

export const photoSchema = z.object({
  caption: z.string().max(280).optional(),
  location_name: z.string().max(100).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type PhotoInput = z.infer<typeof photoSchema>;
