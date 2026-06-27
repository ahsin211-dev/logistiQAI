import { create } from 'zustand';
import { api } from '../services/api';
import { UserRole } from '@logistics/shared';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    companyName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/login', {
      email,
      password,
    });
    await api.setToken(res.accessToken);
    set({ user: res.user, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/register', data);
    await api.setToken(res.accessToken);
    set({ user: res.user, isAuthenticated: true });
  },

  logout: async () => {
    await api.setToken(null);
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const token = await api.loadToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const user = await api.get<User>('/users/me');
      set({ user: user as unknown as User, isAuthenticated: true, isLoading: false });
    } catch {
      await api.setToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
