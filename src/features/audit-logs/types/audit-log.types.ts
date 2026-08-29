export type AuditLogStatus = 'SUCCESS' | 'FAILURE';

export interface AuditLog {
  _id: string;
  action: string;
  status: AuditLogStatus;

  actorId?: string;
  actorEmail?: string;
  actorRole?: string;

  targetType?: string;
  targetId?: string;

  method?: string;
  path?: string;
  ip?: string;
  userAgent?: string;

  metadata?: Record<string, any>;
  errorMessage?: string;

  createdAt: string;
}

export interface AuditLogsResponse {
  items?: AuditLog[];
  data?: AuditLog[];
  total: number;
  page: number;
  limit: number;
  pages?: number;
  lastPage?: number;
  hasMore?: boolean;
}

export interface QueryAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  status?: AuditLogStatus;
  actorEmail?: string;
  targetId?: string;
  search?: string;
  from?: string;
  to?: string;
}