import { get, patch, upload } from './api';
import { User, AppSettings } from '@/types';

export async function updateProfile(data: { name?: string; email?: string }): Promise<User> {
  return patch<User>('/api/users/profile', data);
}

export async function uploadAvatar(fileUri: string, mimeType?: string, fileName?: string): Promise<string> {
  const result = await upload<{ avatar: string }>('/api/users/avatar', fileUri, 'file', mimeType, fileName);
  return result.avatar;
}

export async function getSettings(): Promise<AppSettings> {
  return get<AppSettings>('/api/users/settings');
}

export async function updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
  return patch<AppSettings>('/api/users/settings', data);
}
