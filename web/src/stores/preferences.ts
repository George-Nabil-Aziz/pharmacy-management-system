import { create } from 'zustand';

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark' | 'system';

interface Preferences {
  language: Language;
  theme: Theme;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
}

export const usePreferences = create<Preferences>((set) => ({
  language: 'ar',
  theme: 'system',
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
}));
