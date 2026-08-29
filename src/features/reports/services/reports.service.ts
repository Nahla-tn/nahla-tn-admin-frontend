import api from '@/lib/api/axios';
import { PaginatedReportsResponse } from '../types/report.types';

export const reportsService = {
  async getReports(page = 1, limit = 10): Promise<PaginatedReportsResponse> {
    const response = await api.get<PaginatedReportsResponse>(
      `/reports?page=${page}&limit=${limit}`,
    );

    return response.data;
  },

  async updateReportStatus(id: string, status: string, comment?: string) {
    const response = await api.patch(`/reports/${id}/status`, {
      status,
      comment,
    });

    return response.data;
  },

  async createReport(payload: any) {
    const response = await api.post('/reports', payload);
    return response.data;
  },
};