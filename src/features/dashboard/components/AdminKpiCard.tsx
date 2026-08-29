import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ReactNode } from 'react';

type Tone = 'amber' | 'emerald' | 'sky' | 'rose' | 'violet' | 'slate' | 'orange' | 'green' | 'blue' | 'red';

type AdminKpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
  tone?: Tone;
  icon?: ReactNode;
  trend?: number; // positive = up, negative = down
  suffix?: string;
  delay?: number;
};

const baseToneMap = {
  amber: {
    bg: 'from-amber-50/60 to-white',
    border: 'border-amber-200/70',
    icon: 'bg-amber-100 text-amber-700',
    value: 'text-amber-700',
    dot: 'bg-amber-500',
    glow: 'shadow-amber-500/10',
    badge: 'bg-amber-100 text-amber-700',
  },
  emerald: {
    bg: 'from-emerald-50/60 to-white',
    border: 'border-emerald-200/70',
    icon: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-700',
    dot: 'bg-emerald-500',
    glow: 'shadow-emerald-500/10',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  sky: {
    bg: 'from-sky-50/60 to-white',
    border: 'border-sky-200/70',
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-sky-700',
    dot: 'bg-sky-500',
    glow: 'shadow-sky-500/10',
    badge: 'bg-sky-100 text-sky-700',
  },
  rose: {
    bg: 'from-rose-50/60 to-white',
    border: 'border-rose-200/70',
    icon: 'bg-rose-100 text-rose-700',
    value: 'text-rose-700',
    dot: 'bg-rose-500',
    glow: 'shadow-rose-500/10',
    badge: 'bg-rose-100 text-rose-700',
  },
  violet: {
    bg: 'from-violet-50/60 to-white',
    border: 'border-violet-200/70',
    icon: 'bg-violet-100 text-violet-700',
    value: 'text-violet-700',
    dot: 'bg-violet-500',
    glow: 'shadow-violet-500/10',
    badge: 'bg-violet-100 text-violet-700',
  },
  slate: {
    bg: 'from-slate-50/60 to-white',
    border: 'border-slate-200/70',
    icon: 'bg-slate-100 text-slate-700',
    value: 'text-slate-700',
    dot: 'bg-slate-500',
    glow: 'shadow-slate-500/10',
    badge: 'bg-slate-100 text-slate-700',
  },
};

const toneMap: Record<Tone, {
  bg: string;
  border: string;
  icon: string;
  value: string;
  dot: string;
  glow: string;
  badge: string;
}> = {
  ...baseToneMap,
  orange: baseToneMap.amber,
  green: baseToneMap.emerald,
  blue: baseToneMap.sky,
  red: baseToneMap.rose,
};

export function AdminKpiCard({
  title,
  value,
  description,
  tone = 'amber',
  icon,
  trend,
  delay = 0,
}: AdminKpiCardProps) {
  const styles = toneMap[tone];

  return (
    <div
      className={cn(
        'nahla-stat-card group animate-fade-in-up bg-gradient-to-br shadow-md',
        styles.bg,
        styles.border,
        styles.glow,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative corner glow */}
      <div className={cn('pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-bl-3xl opacity-30', `bg-gradient-to-bl ${styles.bg}`)} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="nahla-section-label truncate">{title}</p>

          <div className="mt-3 flex items-end gap-2">
            <span
              className={cn(
                'text-3xl font-black leading-none tracking-tight animate-count-up',
                styles.value,
              )}
              style={{ animationDelay: `${delay + 100}ms` }}
            >
              {value}
            </span>

            {trend !== undefined && (
              <span className={cn(
                'mb-0.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                trend >= 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700',
              )}>
                {trend >= 0
                  ? <TrendingUp size={10} />
                  : <TrendingDown size={10} />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>

          {description && (
            <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>

        {icon ? (
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105', styles.icon)}>
            {icon}
          </div>
        ) : (
          <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125', styles.dot)} />
        )}
      </div>
    </div>
  );
}