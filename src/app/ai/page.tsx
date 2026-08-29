'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api/axios';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/hooks/useI18n';
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  BarChart3,
  FileText,
  AlertTriangle,
  Lightbulb,
  Brain,
  Leaf,
  Loader2,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  scope?: string;
  confidence?: string;
  source?: string;
};

type AiReportResponse = {
  title: string;
  summary: string;
  keyFindings: string[];
  risks: string[];
  recommendations: string[];
  source: string;
};

function ConfidenceDot({ confidence }: { confidence?: string }) {
  if (!confidence) return null;
  const colors = {
    high:   'bg-emerald-500 ring-emerald-200',
    medium: 'bg-amber-500 ring-amber-200',
    low:    'bg-rose-400 ring-rose-200',
  };
  const key = confidence as keyof typeof colors;
  return (
    <span className={cn('inline-block h-2 w-2 rounded-full ring-2', colors[key] || colors.medium)} />
  );
}

function ChatBubble({ message, isNew = false }: { message: ChatMessage; isNew?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 transition-all',
        isUser ? 'justify-end' : 'justify-start',
        isNew && 'animate-fade-in-up',
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-500/20 text-sm">
          🐝
        </div>
      )}

      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-tr-sm'
            : 'border border-slate-200/80 bg-white text-slate-700 rounded-tl-sm',
        )}
      >
        {!isUser && (message.scope || message.confidence || message.source) && (
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            {message.scope && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 ring-1 ring-violet-200">
                {message.scope}
              </span>
            )}
            {message.confidence && (
              <span className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                <ConfidenceDot confidence={message.confidence} />
                {message.confidence}
              </span>
            )}
            {message.source && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                {message.source}
              </span>
            )}
          </div>
        )}

        <p className="whitespace-pre-line">{message.content}</p>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
          👤
        </div>
      )}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm text-sm">
        🐝
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-slate-200/80 bg-white px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:100ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:200ms]" />
        </div>
      </div>
    </div>
  );
}

function ChatPanel({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon,
  messages,
  question,
  loading,
  scrollRef,
  onQuestion,
  onAsk,
  onClear,
  placeholder,
  accentClass,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon: React.ElementType;
  messages: ChatMessage[];
  question: string;
  loading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onQuestion: (v: string) => void;
  onAsk: () => void;
  onClear: () => void;
  placeholder: string;
  accentClass: string;
}) {
  return (
    <div className="nahla-card flex flex-col overflow-hidden animate-scale-in">
      {/* Panel Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm', accentClass)}>
              <BadgeIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">{title}</h2>
                <span className="rounded-full border border-current bg-current/10 px-2 py-0.5 text-[10px] font-bold opacity-80">
                  {badge}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        className="flex-1 space-y-4 overflow-y-auto bg-slate-50/40 p-4"
        style={{ minHeight: 320, maxHeight: 400 }}
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="text-3xl">🐝</div>
            <p className="text-sm font-medium text-slate-400">{placeholder}</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <ChatBubble key={idx} message={msg} isNew={idx === messages.length - 1} />
        ))}

        {loading && <ThinkingBubble />}
      </div>

      {/* Input Bar */}
      <div className="border-t border-slate-100 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => onQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading) onAsk(); }}
            placeholder={placeholder}
            className="nahla-input h-11 flex-1"
            disabled={loading}
          />
          <button
            type="button"
            onClick={onAsk}
            disabled={loading || !question.trim()}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
              accentClass,
              'text-white shadow-sm',
            )}
          >
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AiPage() {
  const { t, locale } = useI18n();

  const reportTypes = [
    { key: 'weekly-summary', label: t('ai.weeklySummary'), icon: BarChart3, color: 'amber' },
    { key: 'subscriptions-summary', label: t('ai.subscriptionsReport'), icon: Crown, color: 'sky' },
    { key: 'signalements-summary', label: t('ai.signalementsReport'), icon: AlertTriangle, color: 'rose' },
    { key: 'dashboard-health', label: t('ai.dashboardHealth'), icon: Zap, color: 'emerald' },
  ];

  const [generalMessages, setGeneralMessages] = useState<ChatMessage[]>([]);
  const [platformMessages, setPlatformMessages] = useState<ChatMessage[]>([]);
  const [generalQuestion, setGeneralQuestion] = useState('');
  const [platformQuestion, setPlatformQuestion] = useState('');
  const [generalLoading, setGeneralLoading] = useState(false);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('weekly-summary');
  const [reportResult, setReportResult] = useState<AiReportResponse | null>(null);

  const generalScrollRef = useRef<HTMLDivElement | null>(null);
  const platformScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (generalScrollRef.current) {
      generalScrollRef.current.scrollTop = generalScrollRef.current.scrollHeight;
    }
  }, [generalMessages, generalLoading]);

  useEffect(() => {
    if (platformScrollRef.current) {
      platformScrollRef.current.scrollTop = platformScrollRef.current.scrollHeight;
    }
  }, [platformMessages, platformLoading]);

  const buildHistory = (messages: ChatMessage[]) =>
    messages.map((m) => ({ role: m.role, content: m.content }));

  const handleAsk = async (mode: 'general' | 'platform') => {
    const question = mode === 'general' ? generalQuestion.trim() : platformQuestion.trim();
    if (!question) return;

    const currentMessages = mode === 'general' ? generalMessages : platformMessages;
    const nextMessages: ChatMessage[] = [...currentMessages, { role: 'user', content: question }];

    if (mode === 'general') {
      setGeneralMessages(nextMessages);
      setGeneralQuestion('');
      setGeneralLoading(true);
    } else {
      setPlatformMessages(nextMessages);
      setPlatformQuestion('');
      setPlatformLoading(true);
    }

    try {
      const response = await api.post('/ai/ask', {
        question,
        mode,
        locale,
        history: buildHistory(currentMessages),
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.answer,
        scope: response.data.scope,
        confidence: response.data.confidence,
        source: response.data.source,
      };

      if (mode === 'general') {
        setGeneralMessages((prev) => [...prev, assistantMessage]);
      } else {
        setPlatformMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (mode === 'general') setGeneralLoading(false);
      else setPlatformLoading(false);
    }
  };

  const handleGenerateReport = async (type: string) => {
    try {
      setSelectedReportType(type);
      setReportLoading(true);
      const response = await api.post('/ai/report', { type, locale });
      setReportResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-5 sm:p-7 lg:p-9 animate-fade-in">

      {/* ─── Hero Header ────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-200/50 bg-gradient-to-br from-violet-50 via-white to-amber-50/50 p-7 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-amber-200/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100/80 px-3 py-1 text-xs font-bold text-violet-800 shadow-xs">
            <Sparkles size={12} className="text-violet-500" />
            {t('ai.badge')}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {t('ai.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            {t('ai.subtitle')}
          </p>
        </div>
      </section>

      {/* ─── Report Generator ───────────────────────────── */}
      <section className="nahla-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm text-white">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('ai.generateReport')}</h2>
              <p className="text-xs text-slate-500">Génération de rapports IA basés sur vos données</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-3">
            {reportTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedReportType === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleGenerateReport(item.key)}
                  disabled={reportLoading}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
                    isSelected
                      ? 'border-amber-400 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800',
                  )}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {reportLoading && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:100ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-600 [animation-delay:200ms]" />
              </div>
              <span className="text-sm font-medium text-slate-500">{t('ai.generating')}</span>
            </div>
          )}

          {reportResult && !reportLoading && (
            <div className="animate-scale-in space-y-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black text-slate-900">{reportResult.title}</h3>
                <span className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-bold',
                  reportResult.source === 'openrouter'
                    ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200'
                    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
                )}>
                  {reportResult.source === 'openrouter' ? '🤖 AI Live' : '📊 Offline'}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">{reportResult.summary}</p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={14} className="text-amber-700" />
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-800">{t('ai.keyFindings')}</p>
                  </div>
                  <ul className="space-y-1.5">
                    {reportResult.keyFindings.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-amber-900">
                        <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-amber-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-rose-600" />
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-800">{t('ai.risks')}</p>
                  </div>
                  <ul className="space-y-1.5">
                    {reportResult.risks.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-rose-900">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-emerald-700" />
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{t('ai.recommendations')}</p>
                  </div>
                  <ul className="space-y-1.5">
                    {reportResult.recommendations.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-emerald-900">
                        <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Chat Panels ────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChatPanel
          title={t('ai.generalTitle')}
          subtitle={t('ai.generalSubtitle')}
          badge={t('ai.generalBadge')}
          badgeIcon={Leaf}
          messages={generalMessages}
          question={generalQuestion}
          loading={generalLoading}
          scrollRef={generalScrollRef}
          onQuestion={setGeneralQuestion}
          onAsk={() => handleAsk('general')}
          onClear={() => setGeneralMessages([])}
          placeholder={t('ai.generalPlaceholder')}
          accentClass="bg-gradient-to-br from-emerald-500 to-teal-600"
        />

        <ChatPanel
          title={t('ai.platformTitle')}
          subtitle={t('ai.platformSubtitle')}
          badge={t('ai.platformBadge')}
          badgeIcon={Brain}
          messages={platformMessages}
          question={platformQuestion}
          loading={platformLoading}
          scrollRef={platformScrollRef}
          onQuestion={setPlatformQuestion}
          onAsk={() => handleAsk('platform')}
          onClear={() => setPlatformMessages([])}
          placeholder={t('ai.platformPlaceholder')}
          accentClass="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>
    </div>
  );
}

// Placeholder for import
function Crown({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size ?? 18}
      height={size ?? 18}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M5 20h14" />
    </svg>
  );
}