import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { getAdminMe } from '../api/auth';

interface AdminAuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
}

function readCachedAdmin(): User | null {
  try {
    const raw = localStorage.getItem('vyas-admin-auth');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.user ?? null;
  } catch {
    return null;
  }
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => {
      // See useAuthStore for why this reads the cache synchronously instead
      // of relying on zustand's async persist rehydration.
      const cachedUser = readCachedAdmin();
      return {
        user: cachedUser,
        loading: !cachedUser,
        setUser: (user) => set({ user }),
        hydrate: async () => {
          try {
            const { user } = await getAdminMe();
            set({ user, loading: false });
          } catch {
            set({ user: null, loading: false });
          }
        },
      };
    },
    {
      name: 'vyas-admin-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
