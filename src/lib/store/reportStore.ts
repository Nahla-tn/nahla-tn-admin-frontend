// src/lib/store/reportStore.ts
import { create } from 'zustand';
import api from '@/lib/api/axios'; // Nesta3mlou el axios instance mte3ek ✅

interface ReportStore {
  reports: any[];
  isLoading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  updateReportStatus: (id: string, status: string) => Promise<void>;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  isLoading: false,
  error: null,

  fetchReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/reports');
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      set({ reports: data, isLoading: false, error: null });
    } catch (err: any) {
      console.error('Fetch reports error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Erreur lors du chargement des rapports';
      set({ reports: [], isLoading: false, error: errorMsg });
    }
  },

  updateReportStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/reports/${id}/status`, { status });
      
      await get().fetchReports();
    } catch (err: any) {
      console.error("Update report status error:", err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Erreur lors de la mise à jour du statut';
      set({ isLoading: false, error: errorMsg });
    }
  }
}));