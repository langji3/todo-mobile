import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AppSettings } from '@/types';
import { MOCK_USER } from '@/constants/mock';

interface UserState {
  user: User | null;
  settings: AppSettings;
  initialized: boolean;
}

interface UserActions {
  initMockData: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateAvatar: (avatarUri: string) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      user: null,
      settings: {
        darkMode: false,
        notifications: true,
      },
      initialized: false,

      initMockData: () => {
        if (get().initialized) return;
        set({
          user: MOCK_USER,
          initialized: true,
        });
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      updateAvatar: (avatarUri) => {
        set((state) => ({
          user: state.user ? { ...state.user, avatar: avatarUri } : null,
        }));
      },

      toggleDarkMode: () => {
        set((state) => ({
          settings: { ...state.settings, darkMode: !state.settings.darkMode },
        }));
      },

      toggleNotifications: () => {
        set((state) => ({
          settings: { ...state.settings, notifications: !state.settings.notifications },
        }));
      },

      logout: () => {
        set({
          user: null,
          initialized: false,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
        initialized: state.initialized,
      }),
    }
  )
);
