'use client';

import { Menu, Shield } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Sidebar from './Sidebar';
import LanguageSwitcher from './LanguageSwitcher';

import { usePermissions } from '@/lib/hooks/usePermissions';
import { useI18n } from '@/lib/hooks/useI18n';

const noSidebarPages = ['/login', '/'];

const pageTitleKeys = [
  { href: '/dashboard', key: 'pages.dashboard' },
  { href: '/users', key: 'pages.users' },
  { href: '/maps', key: 'pages.maps' },
  { href: '/alerts', key: 'pages.alerts' },
  { href: '/ai', key: 'pages.ai' },
  { href: '/reports', key: 'pages.reports' },
  { href: '/subscriptions', key: 'pages.subscriptions' },
  { href: '/audit-log', key: 'pages.auditLog' },
];

function getPageTitleKey(pathname: string) {
  const page = pageTitleKeys.find(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`),
  );

  return page?.key || 'pages.default';
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const [isChecking, setIsChecking] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    isLoading: permissionsLoading,
    canAccessRoute,
    user,
    roleLabel,
  } = usePermissions();

  const showSidebar = !noSidebarPages.includes(pathname);

  useEffect(() => {
    setIsChecking(true);
  }, [pathname]);

  useEffect(() => {
    if (!showSidebar) {
      setIsChecking(false);
      return;
    }

    if (permissionsLoading) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      router.push('/login');
      return;
    }

    if (!canAccessRoute(pathname)) {
      router.push('/dashboard');
      return;
    }

    setIsChecking(false);
  }, [
    pathname,
    showSidebar,
    router,
    permissionsLoading,
    canAccessRoute,
  ]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  if (!showSidebar) {
    return <>{children}</>;
  }

  if (isChecking || permissionsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950/5 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200/80 bg-white/95 px-8 py-6 shadow-xl backdrop-blur-xl">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-amber-400/20" />
            <div className="h-9 w-9 animate-spin rounded-xl border-3 border-amber-500 border-t-transparent" />
          </div>
          <p className="text-sm font-bold text-slate-700">
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-72 shrink-0 md:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay & drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 z-50 h-screen w-72 shadow-2xl animate-fade-in-up">
            <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 shadow-xs backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold uppercase tracking-wider text-slate-400 sm:inline">
                {t('pages.adminSpace')} /
              </span>
              <h1 className="text-base font-extrabold text-slate-900 sm:text-lg">
                {t(getPageTitleKey(pathname))}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 text-xs font-bold text-slate-700 sm:flex">
              <Shield size={13} className="text-amber-600" />
              <span>{roleLabel}</span>
            </div>

            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-black text-white shadow-xs">
              {(user?.name || 'N').charAt(0).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}