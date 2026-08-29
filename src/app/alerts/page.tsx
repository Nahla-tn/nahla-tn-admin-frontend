'use client';

import { useEffect, useState } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useSignalementStore } from '@/lib/store/signalementStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Eye,
  RefreshCw,
  ShieldAlert,
  XCircle,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  Loader2,
  Download,
} from 'lucide-react';
import { useI18n } from '@/lib/hooks/useI18n';
import { cn } from '@/lib/utils';
import { exportToCsv } from '@/lib/utils/exportCsv';

const STATUS = {
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED',
} as const;

type Signalement = {
  _id: string;
  type: string;
  description: string;
  imageUrl?: string;
  location?: { lat?: number; lng?: number };
  status: string;
  rejectReason?: string;
  createdAt?: string;
  authorId?: { name?: string; email?: string } | string;
};

function getStatusConfig(status: string) {
  switch (status) {
    case STATUS.VALIDATED:
      return {
        label: 'Validated',
        className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
        dotClass: 'bg-emerald-500',
        Icon: CheckCircle2,
      };
    case STATUS.REJECTED:
      return {
        label: 'Rejected',
        className: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
        dotClass: 'bg-rose-500',
        Icon: XCircle,
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
        dotClass: 'bg-amber-500',
        Icon: Clock,
      };
  }
}

const FILTER_OPTIONS = ['ALL', 'PENDING', 'VALIDATED', 'REJECTED'] as const;

type FilterOption = typeof FILTER_OPTIONS[number];

function filterLabel(status: FilterOption, t: (key: string) => string): string {
  switch (status) {
    case 'ALL': return t('alerts.filterAll');
    case 'PENDING': return t('alerts.filterPending');
    case 'VALIDATED': return t('alerts.filterValidated');
    default: return t('alerts.filterRejected');
  }
}

function filterCount(signalements: Signalement[], filter: FilterOption): number {
  if (filter === 'ALL') return signalements.length;
  return signalements.filter((s) => s.status === filter).length;
}

export default function AlertsPage() {
  const { t } = useI18n();
  const { canModerate } = usePermissions();
  const { signalements, fetchSignalements, updateSignalementStatus } = useSignalementStore();

  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const safeSignalements = Array.isArray(signalements) ? signalements : [];

  useEffect(() => {
    fetchSignalements(selectedStatus === 'ALL' ? undefined : selectedStatus);
  }, [selectedStatus, fetchSignalements]);

  const handleViewDetails = (signalement: Signalement) => {
    setSelectedSignalement(signalement);
    setIsDetailsOpen(true);
  };

  const handleValidate = async () => {
    if (!selectedSignalement?._id) return;
    try {
      setIsUpdating(true);
      await updateSignalementStatus(selectedSignalement._id, { status: STATUS.VALIDATED });
      await fetchSignalements(selectedStatus === 'ALL' ? undefined : selectedStatus);
      setIsDetailsOpen(false);
      setSelectedSignalement(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSignalement?._id || !rejectReason.trim()) return;
    try {
      setIsUpdating(true);
      await updateSignalementStatus(selectedSignalement._id, { status: STATUS.REJECTED, rejectReason });
      await fetchSignalements(selectedStatus === 'ALL' ? undefined : selectedStatus);
      setIsRejectOpen(false);
      setIsDetailsOpen(false);
      setRejectReason('');
      setSelectedSignalement(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const getAuthorName = (s: Signalement) => {
    if (!s.authorId) return t('common.unknown');
    if (typeof s.authorId === 'string') return t('common.unknown');
    return s.authorId.name || t('common.unknown');
  };

  const getAuthorEmail = (s: Signalement) => {
    if (!s.authorId || typeof s.authorId === 'string') return '-';
    return s.authorId.email || '-';
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatTime = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const pendingCount = safeSignalements.filter((s) => s.status === 'PENDING').length;
  const validatedCount = safeSignalements.filter((s) => s.status === 'VALIDATED').length;
  const rejectedCount = safeSignalements.filter((s) => s.status === 'REJECTED').length;

  return (
    <div className="space-y-7 p-5 sm:p-7 lg:p-9 animate-fade-in">

      {/* ─── Hero Header ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-rose-200/50 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/30 p-7 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-rose-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-amber-200/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-md shadow-rose-500/20 text-white sm:flex">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/80 px-3 py-1 text-xs font-bold text-rose-700">
                <AlertTriangle size={11} />
                {t('alerts.badge')}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {t('alerts.title')}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-2xl">
                {t('alerts.subtitle')}
              </p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="flex flex-col items-center rounded-2xl border border-amber-200 bg-white px-5 py-3 shadow-xs">
              <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-500 mt-0.5">Pending</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-white px-5 py-3 shadow-xs">
              <span className="text-2xl font-black text-emerald-600">{validatedCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-500 mt-0.5">Validated</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-rose-200 bg-white px-5 py-3 shadow-xs">
              <span className="text-2xl font-black text-rose-600">{rejectedCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-rose-500 mt-0.5">Rejected</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Card ───────────────────────────────────── */}
      <section className="nahla-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {/* Controls Bar */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="nahla-section-title">{t('alerts.moderationQueue')}</h2>
              <p className="nahla-muted-text mt-0.5">{t('alerts.moderationQueueDesc')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  exportToCsv('signalements_nahla', [
                    { label: 'Type', key: 'type' },
                    { label: 'Description', key: 'description' },
                    { label: 'Statut', key: 'status' },
                    { label: 'Motif Rejet', key: 'rejectReason' },
                    { label: 'Date Création', key: 'createdAt' },
                  ], safeSignalements);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download size={14} />
                Exporter CSV
              </button>
              <button
                type="button"
                onClick={() => fetchSignalements(selectedStatus === 'ALL' ? undefined : selectedStatus)}
                className="nahla-primary-btn shrink-0"
              >
                <RefreshCw size={15} />
                {t('common.refresh')}
              </button>
            </div>
          </div>

          {/* Status filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((status) => {
              const isActive = selectedStatus === status;
              const cfg = getStatusConfig(status);
              const count = filterCount(safeSignalements, status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-[0.97]',
                    isActive
                      ? 'border-amber-400 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  {filterLabel(status, t)}
                  <span className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-black',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="nahla-table min-w-[900px]">
            <thead className="nahla-table-head">
              <tr>
                <th className="nahla-table-th">{t('alerts.type')}</th>
                <th className="nahla-table-th">{t('alerts.description')}</th>
                <th className="nahla-table-th">{t('alerts.author')}</th>
                <th className="nahla-table-th">{t('alerts.status')}</th>
                <th className="nahla-table-th">{t('alerts.date')}</th>
                <th className="nahla-table-th text-right">{t('alerts.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {safeSignalements.length > 0 ? (
                safeSignalements.map((signalement: Signalement, idx) => {
                  const cfg = getStatusConfig(signalement.status);
                  const StatusIcon = cfg.Icon;
                  return (
                    <tr
                      key={signalement._id}
                      className={cn('nahla-table-row animate-fade-in-up')}
                      style={{ animationDelay: `${idx * 25}ms` }}
                    >
                      {/* Type */}
                      <td className="nahla-table-td">
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {signalement.type}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="nahla-table-td max-w-[260px]">
                        <p className="line-clamp-2 text-sm text-slate-700">{signalement.description}</p>
                      </td>

                      {/* Author */}
                      <td className="nahla-table-td">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-sm font-black text-amber-800">
                            {getAuthorName(signalement).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{getAuthorName(signalement)}</p>
                            <p className="truncate text-xs text-slate-400">{getAuthorEmail(signalement)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="nahla-table-td">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', cfg.className)}>
                          <StatusIcon size={11} />
                          {signalement.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="nahla-table-td whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-700">{formatDate(signalement.createdAt)}</p>
                        <p className="text-xs text-slate-400">{formatTime(signalement.createdAt)}</p>
                      </td>

                      {/* Actions */}
                      <td className="nahla-table-td text-right">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(signalement)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 active:scale-[0.97]"
                        >
                          <Eye size={13} />
                          {t('alerts.viewDetails')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8">
                    <div className="nahla-empty-state">
                      <ShieldAlert size={32} className="text-slate-300" />
                      <p className="text-sm font-semibold text-slate-400">{t('alerts.empty')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Details Dialog ───────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="overflow-hidden rounded-3xl border border-slate-200/80 p-0 shadow-2xl sm:max-w-[680px]">
          {/* Dialog Header — dark gradient */}
          <DialogHeader className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-400">
                <ShieldAlert size={20} />
              </div>
              <DialogTitle className="text-lg font-black text-white">
                {t('alerts.detailsTitle')}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-5 p-6">
            {/* Info grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className="nahla-section-label">{t('alerts.type')}</span>
                <p className="mt-1.5 font-bold text-slate-800">{selectedSignalement?.type || 'N/A'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className="nahla-section-label">{t('alerts.status')}</span>
                <div className="mt-1.5">
                  {selectedSignalement?.status && (() => {
                    const cfg = getStatusConfig(selectedSignalement.status);
                    const Icon = cfg.Icon;
                    return (
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', cfg.className)}>
                        <Icon size={11} />
                        {selectedSignalement.status}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="nahla-section-label">{t('alerts.description')}</span>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {selectedSignalement?.description || t('alerts.noDescription')}
              </p>
            </div>

            {/* Coordinates */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <MapPin size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="nahla-section-label">{t('alerts.latitude')}</span>
                  <p className="mt-0.5 font-bold text-slate-800">{selectedSignalement?.location?.lat ?? '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <MapPin size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="nahla-section-label">{t('alerts.longitude')}</span>
                  <p className="mt-0.5 font-bold text-slate-800">{selectedSignalement?.location?.lng ?? '-'}</p>
                </div>
              </div>
            </div>

            {/* Photo */}
            {selectedSignalement?.imageUrl && (
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <img
                  src={selectedSignalement.imageUrl}
                  alt={t('alerts.photo')}
                  className="max-h-[280px] w-full object-cover"
                />
              </div>
            )}

            {/* Reject reason */}
            {selectedSignalement?.rejectReason && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <span className="nahla-section-label text-rose-600">{t('alerts.rejectReasonLabel')}</span>
                <p className="mt-2 text-sm leading-relaxed text-rose-700">
                  {selectedSignalement.rejectReason}
                </p>
              </div>
            )}

            {/* Moderation actions */}
            {canModerate && (
              <div className="grid gap-3 pt-1 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleValidate}
                  className="nahla-success-btn py-3 text-sm"
                >
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {t('alerts.validate')}
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setIsRejectOpen(true)}
                  className="nahla-danger-btn py-3 text-sm"
                >
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                  {t('alerts.reject')}
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Reject Dialog ───────────────────────────────── */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="rounded-3xl border border-slate-200/80 shadow-2xl sm:max-w-[520px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <XCircle size={20} />
              </div>
              <DialogTitle className="text-lg font-black text-slate-900">
                {t('alerts.rejectModalTitle')}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={5}
              placeholder={t('alerts.rejectPlaceholder')}
              className="nahla-input h-auto w-full resize-none p-4 text-sm leading-relaxed"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsRejectOpen(false); setRejectReason(''); }}
                className="nahla-secondary-btn"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isUpdating || !rejectReason.trim()}
                className="nahla-danger-btn"
              >
                {isUpdating && <Loader2 size={14} className="animate-spin" />}
                {t('alerts.confirmReject')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}