import { create } from 'zustand';
import api from '@/lib/api/axios';

interface UpdateSignalementPayload {
  status: string;
  rejectReason?: string;
}

interface SignalementStore {
  signalements: any[];
  fetchSignalements: (status?: string) => Promise<void>;
  updateSignalementStatus: (
    id: string,
    payload: UpdateSignalementPayload
  ) => Promise<void>;
}

export const useSignalementStore = create<SignalementStore>((set) => ({
  signalements: [],

  fetchSignalements: async (status) => {
    try {
      const url = status ? `/signalements?status=${status}` : '/signalements';
      const res = await api.get(url);
      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      set({ signalements: items });
    } catch (err) {
      console.error('Fetch signalements error:', err);
      set({ signalements: [] });
    }
  },

  updateSignalementStatus: async (id, payload) => {
    try {
      await api.patch(`/signalements/${id}/status`, payload);
    } catch (err) {
      console.error('Update signalement status error:', err);
      throw err;
    }
  },
}));