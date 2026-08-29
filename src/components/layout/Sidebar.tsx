'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Bot,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  ShieldCheck,
  Users,
  ChevronRight,
  Sparkles,
  BookOpen,
  Sliders,
  Radio,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useI18n } from '@/lib/hooks/useI18n';

type SidebarProps = {
  onNavigate?: () => void;
};

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const {
    canViewDashboard,
    canManageUsers,
    canManageZones,
    canModerate,
    canViewReports,
    canViewAI,
    canViewAuditLogs,
    user,
    roleLabel,
  } = usePermissions();

  const navItems = [
    {
      href: '/dashboard',
      label: t('common.dashboard'),
      icon: LayoutDashboard,
      visible: canViewDashboard,
    },
    {
      href: '/users',
      label: t('common.users'),
      icon: Users,
      visible: canManageUsers,
    },
    {
      href: '/maps',
      label: t('common.maps'),
      icon: Map,
      visible: canManageZones,
    },
    {
      href: '/alerts',
      label: t('common.alerts'),
      icon: Bell,
      visible: canModerate,
    },
    {
      href: '/reports',
      label: t('common.reports'),
      icon: FileText,
      visible: canViewReports,
    },
    {
      href: '/articles',
      label: 'Articles & Conseils',
      icon: BookOpen,
      visible: canModerate || canManageZones || true,
    },
    {
      href: '/scoring-config',
      label: 'Moteur de Scoring',
      icon: Sliders,
      visible: canManageZones || true,
    },
    {
      href: '/broadcast',
      label: 'Diffusion Push',
      icon: Radio,
      visible: true,
    },
    {
      href: '/ai',
      label: t('common.ai'),
      icon: Bot,
      visible: canViewAI,
      badge: 'AI',
    },
    {
      href: '/audit-log',
      label: t('common.auditLog'),
      icon: ShieldCheck,
      visible: canViewAuditLogs,
    },
  ].filter((item) => item.visible);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-state-change'));
    router.push('/login');
  };

  return (
    <div className="flex h-full w-72 flex-col justify-between overflow-hidden border-r border-slate-200/80 bg-white/95 backdrop-blur-xl">
      {/* Brand Header */}
      <div>
        <div className="border-b border-slate-100 p-5">
          <Link href="/dashboard" className="group flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-md shadow-amber-500/20 ring-4 ring-amber-500/10 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/logo-nahla.png"
                alt="Nahla"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Nahla
                </span>
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800">
                  Pro
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">
                Apiculture Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 px-3.5 py-5">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </p>

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25 font-bold'
                    : 'text-slate-600 hover:bg-amber-50/60 hover:text-amber-900',
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100/80 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-700',
                    )}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} />
                  </span>

                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && !isActive && (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500/10 to-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 ring-1 ring-amber-500/20">
                      <Sparkles size={10} />
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight size={15} className="text-white/80" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Actions Footer */}
      <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-black text-white shadow-xs">
            {(user?.name || 'N').charAt(0).toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900 leading-tight">
              {user?.name || 'Nahla Admin'}
            </p>
            <span className="mt-0.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {roleLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 shadow-xs transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98]"
        >
          <LogOut size={15} className="text-rose-500" />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </div>
  );
}