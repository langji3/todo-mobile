import { create } from 'zustand';
import { AppSettings } from '@/types';
import * as usersApi from '@/services/users';

interface SettingsState {
  settings: AppSettings;
}

interface SettingsActions {
  fetchSettings: () => Promise<void>;
  toggleSetting: (key: keyof AppSettings) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
}

export const useUserStore = create<SettingsState & SettingsActions>()((set, get) => ({
  settings: {
    darkMode: false,
    notifications: true,
  },

  fetchSettings: async () => {
    try {
      const s = await usersApi.getSettings();
      set({ settings: s });
    } catch {
      // ignore
    }
  },

  toggleSetting: async (key: keyof AppSettings) => {
    const prev = get().settings;
    const next = { ...prev, [key]: !prev[key] };
    set({ settings: next });
    try {
      const updated = await usersApi.updateSettings({ [key]: next[key] });
      set({ settings: updated });
    } catch {
      set({ settings: prev });
    }
  },

  toggleDarkMode: async () => {
    get().toggleSetting('darkMode');
  },

  toggleNotifications: async () => {
    get().toggleSetting('notifications');
  },
}));
