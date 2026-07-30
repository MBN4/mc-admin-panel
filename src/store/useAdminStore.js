import { create } from 'zustand';
import axios from 'axios';

export const useAdminStore = create((set, get) => ({
  admin: JSON.parse(localStorage.getItem('adminUser')) || null,
  token: localStorage.getItem('adminToken') || null,
  theme: localStorage.getItem('theme') || 'dark',
  setAuth: (admin, token) => {
    localStorage.setItem('adminUser', JSON.stringify(admin));
    localStorage.setItem('adminToken', token);
    set({ admin, token });
  },
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },
  // Wipe local auth without hitting /logout. Used by the 401 interceptor and
  // by the JWT-expiry check on app load — both cases where calling the
  // server would just get another 401.
  clearAuth: () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    set({ admin: null, token: null });
  },
  logout: async () => {
    const { token } = get();
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Logout sync failed');
    } finally {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      set({ admin: null, token: null });
    }
  }
}));