export type ReportStatus = string;

export type ReportReporter = {
  _id?: string;
  name?: string;
  email?: string;
};

export type Report = {
  _id: string;
  reporterId?: string | ReportReporter;
  targetType: string;
  targetId: string;
  contentSnapshot: Record<string, unknown>;
  reason: string;
  status: ReportStatus;
  adminComment?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedReportsResponse = {
  data: Report[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
};