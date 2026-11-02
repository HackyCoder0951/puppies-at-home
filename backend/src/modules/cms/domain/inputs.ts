/** Pure rules and constants (no framework packages in the domain layer). */
export const SETTING_KEYS = ['whatsapp_number', 'whatsapp_text', 'phone_href', 'email', 'address', 'maps_href', 'instagram', 'tiktok', 'facebook'] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export const MEDIA_LIMITS = {
  imageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const,
  videoTypes: ['video/mp4', 'video/webm'] as const,
  maxImageBytes: 10 * 1024 * 1024,
  maxVideoBytes: 100 * 1024 * 1024,
};

export const EXTENSION_FOR: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'video/mp4': 'mp4', 'video/webm': 'webm',
};
