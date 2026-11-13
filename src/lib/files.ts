import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const DIR = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}scans/` : null;

/** Копіює фото в пам'ять застосунку (тільки на телефоні). Повертає новий шлях. */
export async function persistPhoto(uri: string): Promise<string> {
  if (Platform.OS === 'web' || !DIR) return uri;
  await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => {});
  const ext = uri.split('?')[0].split('.').pop() || 'jpg';
  const dest = `${DIR}${Date.now()}-${Math.floor(Math.random() * 1e4)}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function removePhoto(uri: string | null) {
  if (!uri || Platform.OS === 'web' || !DIR || !uri.startsWith(DIR)) return;
  await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
}
