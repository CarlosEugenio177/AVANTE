import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  cookiesAccepted: boolean;
  acceptCookies: () => void;
}

export const useAppStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      cookiesAccepted: false,
      acceptCookies: () => set({ cookiesAccepted: true }),
    }),
    {
      name: 'avante-app-storage',
    }
  )
);
