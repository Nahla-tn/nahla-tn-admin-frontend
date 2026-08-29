'use client';

import { useEffect, useState } from 'react';
import { reportsService } from '../services/reports.service';
import { PaginatedReportsResponse, Report } from '../types/report.types';
import { useI18n } from '@/lib/hooks/useI18n';
import {
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function getStatusConfig(status: string) {
  const s = status.toUpperCase();

  if (['APPROVED', 'VALIDATED', 'VALIDÉ', 'VALIDEE', 'RESOLVED'].includes(s)) {
    return {
      label: status,
      class: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
      dot: 'bg-emerald-500',
      Icon: CheckCircle2,
    };
  }

  if (['REJECTED', 'REJETED', 'REJETÉ'].includes(s)) {
    return {
      label: status,
      class: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
      dot: 'bg-rose-500',
      Icon: XCircle,
    };
  }

  return {
    label: status,
    class: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
    Icon: Clock,
  };
}

function formatDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportsView() {
  const { t } = useI18n();

  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function getReporterName(report: Report) {
    const reporter = report.reporterId;
    if (!reporter) return t('common.unknown');
    if (typeof reporter === 'string') return reporter;
    return reporter.name || reporter.email || t('common.unknown');
  }

  function getReporterEmail(report: Report) {
    const reporter = report.reporterId;
    if (!reporter || typeof reporter === 'string') return '-';
    return reporter.email || '-';
  }

  function getSnapshotPreview(report: Report) {
    const snapshot = report.contentSnapshot;
    if (!snapshot) return '-';
    const possibleText =
      snapshot.title ||
      snapshot.description ||
      snapshot.message ||
      snapshot.content ||
      snapshot.reason;
    if (typeof possibleText === 'string') {
      return possibleText.length > 90 ? `${possibleText.slice(0, 90)}…` : possibleText;
    }
    return t('reports.snapshotAvailable');
  }

  async function loadReports(selectedPage = page) {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedReportsResponse =
        await reportsService.getReports(selectedPage, limit);
      setReports(Array.isArray(response.data) ? response.data : []);
      setTotal(response.total || 0);
      setPage(response.page || selectedPage);
      setLastPage(response.lastPage || 1);
    } catch {
      setError(t('reports.loadError'));
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReports(1); }, []);

  const pendingCount  = reports.filter((r) => !['APPROVED','VALIDATED','VALIDÉ','VALIDEE','RESOLVED','REJECTED','REJETED','REJETÉ'].includes(r.status.toUpperCase())).length;
  const resolvedCount = reports.filter((r) => ['APPROVED','VALIDATED','VALIDÉ','VALIDEE','RESOLVED'].includes(r.status.toUpperCase())).length;
  const rejectedCount = reports.filter((r) => ['REJECTED','REJETED','REJETÉ'].includes(r.status.toUpperCase())).length;

  return (
    <div className="space-y-7 p-5 sm:p-7 lg:p-9 animate-fade-in">

      {/* ─── Hero Header ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-7 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-40 w-40 rounded-full bg-slate-200/30 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-700">
              <FileText size={12} className="text-slate-500" />
              {t('reports.badge')}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {t('reports.title')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-2xl">
              {t('reports.subtitle')}
            </p>
          </div>

          {/* Summary stat cards */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200/80 bg-white px-5 py-3 shadow-xs min-w-[80px]">
              <span className="text-2xl font-black text-amber-600">{total}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">{t('reports.totalReports')}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 px-5 py-3 min-w-[80px]">
              <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-500 mt-0.5">Pending</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 min-w-[80px]">
              <span className="text-2xl font-black text-emerald-700">{resolvedCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-500 mt-0.5">Resolved</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Reports Table ───────────────────────────────── */}
      <section className="nahla-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="nahla-section-title">{t('reports.moderationQueue')}</h2>
            <p className="nahla-muted-text mt-0.5">{t('reports.moderationQueueDesc')}</p>
          </div>
          <button
            type="button"
            onClick={() => loadReports(page)}
            disabled={loading}
            className="nahla-primary-btn shrink-0"
          >
            {loading
              ? <Loader2 size={15} className="animate-spin" />
              : <RefreshCw size={15} />}
            {loading ? t('reports.refreshing') : t('reports.refresh')}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 p-12">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-400 [animation-delay:0ms]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-500 [animation-delay:100ms]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-500 [animation-delay:200ms]" />
            </div>
            <p className="text-sm font-medium text-slate-400">{t('reports.loading')}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="m-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <AlertCircle size={18} className="text-rose-500 shrink-0" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && reports.length === 0 && (
          <div className="nahla-empty-state m-5">
            <div className="text-4xl">📋</div>
            <p className="text-sm font-semibold text-slate-500">{t('reports.empty')}</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && reports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="nahla-table min-w-[1000px]">
              <thead className="nahla-table-head">
                <tr>
                  <th className="nahla-table-th">{t('reports.reporter')}</th>
                  <th className="nahla-table-th">{t('reports.targetType')}</th>
                  <th className="nahla-table-th">{t('reports.reason')}</th>
                  <th className="nahla-table-th">{t('reports.snapshot')}</th>
                  <th className="nahla-table-th">{t('reports.status')}</th>
                  <th className="nahla-table-th">{t('reports.createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, idx) => {
                  const statusCfg = getStatusConfig(report.status);
                  const StatusIcon = statusCfg.Icon;
                  return (
                    <tr
                      key={report._id}
                      className={cn(
                        'nahla-table-row animate-fade-in-up',
                      )}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      {/* Reporter */}
                      <td className="nahla-table-td">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-sm font-black text-amber-800">
                            {getReporterName(report).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{getReporterName(report)}</p>
                            <p className="truncate text-xs text-slate-400">{getReporterEmail(report)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Target Type */}
                      <td className="nahla-table-td">
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                          {report.targetType}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="nahla-table-td max-w-[180px]">
                        <p className="truncate text-sm text-slate-600">{report.reason}</p>
                      </td>

                      {/* Snapshot */}
                      <td className="nahla-table-td max-w-[280px]">
                        <p className="line-clamp-2 text-xs text-slate-500">{getSnapshotPreview(report)}</p>
                      </td>

                      {/* Status */}
                      <td className="nahla-table-td">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', statusCfg.class)}>
                          <StatusIcon size={11} />
                          {report.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="nahla-table-td whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-700">{formatDate(report.createdAt)}</p>
                        <p className="text-xs text-slate-400">{formatTime(report.createdAt)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
              {t('common.page')} {page} / {lastPage || 1}
            </span>
            <span className="text-xs text-slate-400">
              {limit} {t('reports.perPage')}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadReports(page - 1)}
              disabled={page <= 1 || loading}
              className="nahla-secondary-btn"
            >
              <ChevronLeft size={15} />
              {t('reports.previous')}
            </button>
            <button
              type="button"
              onClick={() => loadReports(page + 1)}
              disabled={page >= lastPage || loading}
              className="nahla-secondary-btn"
            >
              {t('reports.next')}
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}