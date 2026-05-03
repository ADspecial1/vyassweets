import { create } from 'zustand';
import type { User } from '../types';
import { getMe } from '../api/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  hydrate: async () => {
    try {
      const { user } = await getMe();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
