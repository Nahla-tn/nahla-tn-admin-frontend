import api from '@/lib/api/axios';
import {
  AuditLogsResponse,
  QueryAuditLogsParams,
} from '../types/audit-log.types';

function buildParams(params: QueryAuditLogsParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const auditLogsService = {
  async getAuditLogs(
    params: QueryAuditLogsParams = {},
  ): Promise<AuditLogsResponse> {
    const response = await api.get<AuditLogsResponse>(
      `/audit-logs${buildParams(params)}`,
    );
    return response.data;
  },

  async exportCsv(
    params: QueryAuditLogsParams = {},
  ): Promise<void> {
    const response = await api.get(
      `/audit-logs/export.csv${buildParams(params)}`,
      {
        responseType: 'blob',
      },
    );

    const blob = new Blob([response.data], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'audit-logs.csv');

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};