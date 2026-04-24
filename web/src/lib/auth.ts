'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'corporate' | 'admin' | 'superadmin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  set: (user: User | null, token?: string | null) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      set: (user, token) => set({ user, token: token ?? null }),
      clear: () => set({ user: null, token: null }),
    }),
    { name: 'vt_auth' },
  ),
);
