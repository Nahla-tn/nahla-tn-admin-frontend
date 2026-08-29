import type { UserRole, UserStatus } from '@/lib/constants/auth.constants';
import { create } from 'zustand';
import api from '@/lib/api/axios';
import { API_BASE_URL, API_ROUTES } from '@/constants/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  region: string;
  password?: string;
  subscriptionPlan?: 'FREE' | 'PLUS' | 'PREMIUM';
  latitude?: number;
  longitude?: number;
  subscriptionStatus?: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  subscriptionExpiresAt?: string;
}

interface UserStore {
  users: User[];
  isLoading: boolean;
  page: number;
  total: number;
  lastPage: number;
  fetchUsers: (page?: number) => Promise<void>;
  setPage: (page: number) => void;
  addUser: (userData: any) => Promise<void>;
  updateUser: (id: string, userData: any) => Promise<void>;
  toggleBlockUser: (id: string) => Promise<void>;
  fetchSubscriptionStats: () => Promise<any>;
  exportUsersExcel: () => Promise<void>;
  exportUsersPdf: () => Promise<void>;
}

/**
 * Removes fields that should not be sent to the backend during update.
 * This avoids Mongo/Mongoose errors when trying to update immutable/system fields.
 */
function sanitizeUserPayload(userData: any) {
  const {
    _id,
    id,
    __v,
    createdAt,
    updatedAt,
    location,
    ...payload
  } = userData;

  if (payload.password === '') {
    delete payload.password;
  }

  if (payload.latitude === '' || payload.latitude === null) {
    delete payload.latitude;
  }

  if (payload.longitude === '' || payload.longitude === null) {
    delete payload.longitude;
  }

  return payload;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  isLoading: false,
  page: 1,
  total: 0,
  lastPage: 1,

  setPage: (page) => {
    const pageNum = Number(page);

    if (pageNum < 1) {
      return;
    }

    set({ page: pageNum });
    get().fetchUsers(pageNum);
  },

  fetchUsers: async (page = 1) => {
    const pageNum = Number(page) || 1;

    set({ isLoading: true });

    try {
      const response = await api.get(
        `${API_ROUTES.USERS}?page=${pageNum}&limit=10`,
      );

      set({
        users: Array.isArray(response.data.data) ? response.data.data : [],
        total: response.data.total || 0,
        lastPage: response.data.lastPage || 1,
        page: Number(response.data.page) || 1,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addUser: async (user) => {
    try {
      await api.post(API_ROUTES.USERS, user);
      await get().fetchUsers(get().page);
    } catch {
      // Avoid throwing Axios errors to the Next.js overlay.
    }
  },

  updateUser: async (id, user) => {
    try {
      const payload = sanitizeUserPayload(user);

      await api.patch(API_ROUTES.userById(id), payload);

      await get().fetchUsers(get().page);
    } catch {
      // Avoid throwing Axios errors to the Next.js overlay.
    }
  },

  toggleBlockUser: async (id) => {
    try {
      /**
       * Backend route:
       * PATCH /users/:id/toggle-status
       */
      await api.patch(`/users/${id}/toggle-status`);

      await get().fetchUsers(get().page);
    } catch {
      // Avoid throwing Axios errors to the Next.js overlay.
    }
  },

  fetchSubscriptionStats: async () => {
    try {
      const response = await api.get('/users/stats/subscriptions');

      return response.data;
    } catch {
      return {
        FREE: 0,
        PLUS: 0,
        PREMIUM: 0,
        total: 0,
      };
    }
  },

  exportUsersExcel: async () => {
    const baseURL = api.defaults.baseURL || API_BASE_URL;
    const token = localStorage.getItem('token');

    window.open(`${baseURL}/users/export/excel?token=${token}`, '_blank');
  },

  exportUsersPdf: async () => {
    const baseURL = api.defaults.baseURL || API_BASE_URL;
    const token = localStorage.getItem('token');

    window.open(`${baseURL}/users/export/pdf?token=${token}`, '_blank');
  },
}));