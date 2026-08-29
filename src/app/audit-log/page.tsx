'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/lib/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { auditLogsService } from '@/features/audit-logs/services/audit-logs.service';
import {
  AuditLog,
  AuditLogStatus,
  QueryAuditLogsParams,
} from '@/features/audit-logs/types/audit-log.types';
import {
  ShieldCheck,
  Search,
  Tags,
  ShieldQuestion,
  CalendarDays,
  RefreshCw,
  Download,
  UserRound,
  Fingerprint,
  Globe2,
  CheckCircle2,
  XCircle,
  Inbox,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  ScrollText,
} from 'lucide-react';

const AUDIT_ACTIONS = [
  'LOGIN',
  'LOGIN_FAILED',
  'LOGOUT',
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'USER_BLOCK',
  'USER_UNBLOCK',
  'USER_LOCATION_UPDATE',
  'SUBSCRIPTION_UPDATE',
  'ZONE_CREATE',
  'ZONE_UPDATE',
  'ZONE_DELETE',
  'SIGNALEMENT_VALIDATE',
  'SIGNALEMENT_REJECT',
  'REPORT_STATUS_UPDATE',
  'USERS_EXPORT_EXCEL',
  'USERS_EXPORT_PDF',
  'AUDIT_LOG_EXPORT_CSV',
  'DAILY_STATS_INIT',
  'AI_ASK',
  'AI_REPORT_GENERATE',
];

type Filters = {
  search: string;
  action: string;
  status: string;
  from: string;
  to: string;
};

const emptyFilters: Filters = {
  search: '',
  action: '',
  status: '',
  from: '',
  to: '',
};

// --- Presentational-only helpers (no business logic, purely visual grouping) ---

type ActionCategory =
  | 'auth'
  | 'user'
  | 'subscription'
  | 'zone'
  | 'signalement'
  | 'report'
  | 'export'
  | 'ai'
  | 'system'
  | 'default';

const ACTION_CATEGORY_STYLES: Record<ActionCategory, string> = {
  auth: 'bg-sky-50 text-sky-700 border-sky-200',
  user: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  subscription: 'bg-amber-50 text-amber-700 border-amber-200',
  zone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  signalement: 'bg-orange-50 text-orange-700 border-orange-200',
  report: 'bg-purple-50 text-purple-700 border-purple-200',
  export: 'bg-slate-100 text-slate-600 border-slate-200',
  ai: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  system: 'bg-slate-100 text-slate-600 border-slate-200',
  default: 'bg-slate-100 text-slate-600 border-slate-200',
};

function getActionCategory(action: string): ActionCategory {
  if (!action) return 'default';
  if (action.startsWith('LOGIN') || action === 'LOGOUT') return 'auth';
  if (action.startsWith('USER_')) return 'user';
  if (action.startsWith('SUBSCRIPTION')) return 'subscription';
  if (action.startsWith('ZONE_')) return 'zone';
  if (action.startsWith('SIGNALEMENT')) return 'signalement';
  if (action.startsWith('REPORT_')) return 'report';
  if (action.includes('EXPORT')) return 'export';
  if (action.startsWith('AI_')) return 'ai';
  if (action.startsWith('DAILY_STATS')) return 'system';
  return 'default';
}

function getActionBadgeClasses(action: string): string {
  return ACTION_CATEGORY_STYLES[getActionCategory(action)];
}

function getRoleBadgeClasses(role?: string): string {
  if (!role) return 'bg-slate-50 text-slate-500 border-slate-200';
  const normalized = role.toUpperCase();
  if (normalized.includes('SUPER')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (normalized.includes('ADMIN')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-slate-50 text-slate-600 border-slate-200';
}

function getInitial(value?: string): string {
  if (!value) return '?';
  return value.trim().charAt(0).toUpperCase();
}

export default function AuditLogPage() {
  const { t, locale } = useI18n();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [limit] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  const [pendingFilters, setPendingFilters] =
    useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(emptyFilters);

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const buildQuery = useCallback(
    (targetPage: number): QueryAuditLogsParams => ({
      page: targetPage,
      limit,
      search: appliedFilters.search || undefined,
      action: appliedFilters.action || undefined,
      status:
        (appliedFilters.status as AuditLogStatus) || undefined,
      from: appliedFilters.from || undefined,
      to: appliedFilters.to || undefined,
    }),
    [appliedFilters, limit],
  );

  const loadLogs = useCallback(
    async (targetPage: number = 1) => {
      try {
        setLoading(true);
        setError(false);

        const response = await auditLogsService.getAuditLogs(
          buildQuery(targetPage),
        );

        const rawItems =
          response?.items ??
          response?.data ??
          (Array.isArray(response) ? response : []);
        setLogs(Array.isArray(rawItems) ? rawItems : []);
        setTotal(response?.total ?? (Array.isArray(rawItems) ? rawItems.length : 0));
        setPage(response?.page ?? targetPage);
        setLastPage(response?.lastPage ?? response?.pages ?? 1);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
        setError(true);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery],
  );

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
  };

  const handleResetFilters = () => {
    setPendingFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportError(false);

      await auditLogsService.exportCsv(buildQuery(1));
    } catch (err) {
      console.error('Failed to export audit logs:', err);
      setExportError(true);
    } finally {
      setExporting(false);
    }
  };

  const formattedLogs = useMemo(() => {
    return (logs ?? []).map((log) => {
      const date = log.createdAt
        ? new Date(log.createdAt)
        : null;

      return {
        ...log,
        formattedDate: date
          ? date.toLocaleString(dateLocale)
          : '-',
      };
    });
  }, [logs, dateLocale]);

  const activeFilterCount = [
    appliedFilters.search,
    appliedFilters.action,
    appliedFilters.status,
    appliedFilters.from,
    appliedFilters.to,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 p-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-amber-50/60 p-8 shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-amber-100/70 to-orange-100/40 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold tracking-wide text-red-700">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t('auditLog.badge')}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                <ScrollText
                  className="h-5 w-5 text-slate-700"
                  aria-hidden="true"
                />
              </div>

              <h1 className="text-3xl font-black text-slate-950">
                {t('auditLog.title')}
              </h1>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              {t('auditLog.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Fingerprint
                className="h-5 w-5 text-amber-700"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {t('auditLog.totalLogs')}
              </p>

              <p className="mt-0.5 text-3xl font-black tabular-nums text-slate-900">
                {total.toLocaleString(dateLocale)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <h2 className="text-lg font-black text-slate-900">
              {t('auditLog.filters')}
            </h2>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={loading}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t('auditLog.resetFilters')}
            </Button>

            <Button
              onClick={handleApplyFilters}
              disabled={loading}
              className="gap-1.5 bg-gray-900 text-white hover:bg-gray-800"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              {t('auditLog.applyFilters')}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {t('auditLog.search')}
            </label>

            <Input
              value={pendingFilters.search}
              onChange={(event) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
              placeholder={t('auditLog.searchPlaceholder')}
              className="focus-visible:ring-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Tags className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {t('auditLog.actionFilter')}
            </label>

            <select
              value={pendingFilters.action}
              onChange={(event) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  action: event.target.value,
                }))
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">
                {t('auditLog.allActions')}
              </option>

              {AUDIT_ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <ShieldQuestion className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {t('auditLog.statusFilter')}
            </label>

            <select
              value={pendingFilters.status}
              onChange={(event) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">
                {t('auditLog.allStatuses')}
              </option>
              <option value="SUCCESS">
                {t('auditLog.success')}
              </option>
              <option value="FAILURE">
                {t('auditLog.failure')}
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {t('auditLog.from')}
            </label>

            <Input
              type="date"
              value={pendingFilters.from}
              onChange={(event) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  from: event.target.value,
                }))
              }
              className="focus-visible:ring-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {t('auditLog.to')}
            </label>

            <Input
              type="date"
              value={pendingFilters.to}
              onChange={(event) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  to: event.target.value,
                }))
              }
              className="focus-visible:ring-amber-500"
            />
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
            {t('auditLog.title')}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => loadLogs(page)}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {loading
                ? t('auditLog.refreshing')
                : t('auditLog.refresh')}
            </Button>

            <Button
              onClick={handleExport}
              disabled={exporting || loading}
              className="gap-1.5 bg-orange-500 text-white hover:bg-orange-600"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {exporting
                ? t('auditLog.exporting')
                : t('auditLog.export')}
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('auditLog.loadError')}
          </div>
        )}

        {exportError && (
          <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('auditLog.exportError')}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('auditLog.columns.date')}
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('auditLog.columns.admin')}
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('auditLog.columns.role')}
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('auditLog.columns.action')}
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('auditLog.columns.target')}
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('auditLog.columns.status')}
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t('auditLog.columns.ip')}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && formattedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-12">
                    <div className="flex flex-col items-center justify-center gap-2 text-sm text-slate-500">
                      <Loader2
                        className="h-5 w-5 animate-spin text-amber-500"
                        aria-hidden="true"
                      />
                      <span className="italic">
                        {t('auditLog.loading')}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : formattedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-12">
                    <div className="flex flex-col items-center justify-center gap-2 text-sm text-slate-500">
                      <Inbox
                        className="h-6 w-6 text-slate-300"
                        aria-hidden="true"
                      />
                      <span className="italic">
                        {t('auditLog.noLogs')}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                formattedLogs.map((log) => (
                  <TableRow
                    key={log._id}
                    className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/70"
                  >
                    <TableCell className="whitespace-nowrap text-sm font-medium text-slate-700">
                      {log.formattedDate}
                    </TableCell>

                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                          {getInitial(log.actorEmail)}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {log.actorEmail || '-'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm">
                      {log.actorRole ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeClasses(
                            log.actorRole,
                          )}`}
                        >
                          <UserRound className="h-3 w-3" aria-hidden="true" />
                          {log.actorRole}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-sm">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getActionBadgeClasses(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-slate-700">
                      {log.targetType ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-700">
                            {log.targetType}
                          </span>
                          {log.targetId ? (
                            <span className="w-fit rounded bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-400">
                              {log.targetId}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          log.status === 'SUCCESS'
                            ? 'gap-1 border-emerald-200 bg-emerald-100 text-emerald-700'
                            : 'gap-1 border-red-200 bg-red-100 text-red-700'
                        }
                      >
                        {log.status === 'SUCCESS' ? (
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <XCircle className="h-3 w-3" aria-hidden="true" />
                        )}
                        {log.status === 'SUCCESS'
                          ? t('auditLog.success')
                          : t('auditLog.failure')}
                      </Badge>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm">
                      {log.ip ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
                          <Globe2 className="h-3 w-3 text-slate-400" aria-hidden="true" />
                          {log.ip}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700">
            {t('auditLog.pagination.page')}{' '}
            <span className="font-bold">{page}</span>{' '}
            {t('auditLog.pagination.of')}{' '}
            <span className="font-bold">{lastPage}</span>{' '}
            <span className="mx-2 text-slate-300">|</span>{' '}
            <span className="font-bold text-amber-600">
              {total}
            </span>{' '}
            {t('auditLog.pagination.entries')}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => loadLogs(page - 1)}
              disabled={page <= 1 || loading}
              className="gap-1.5"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {t('auditLog.pagination.previous')}
            </Button>

            <Button
              variant="outline"
              onClick={() => loadLogs(page + 1)}
              disabled={page >= lastPage || loading}
              className="gap-1.5"
            >
              {t('auditLog.pagination.next')}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
