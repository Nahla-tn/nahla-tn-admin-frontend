'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ROLE_LABELS,
  ROLES,
  UserRole,
} from '@/lib/constants/auth.constants';

type StoredUser = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type RouteRule = {
  prefix: string;
  roles: UserRole[];
};

const routeRules: RouteRule[] = [
  {
    prefix: '/dashboard',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.SUPPORT,
      ROLES.ANALYST,
      ROLES.USER,
    ],
  },
  {
    prefix: '/users',
    roles: [ROLES.SUPER_ADMIN, ROLES.SUPPORT],
  },
  {
    prefix: '/maps',
    roles: [ROLES.SUPER_ADMIN, ROLES.ANALYST],
  },
  {
    prefix: '/alerts',
    roles: [ROLES.SUPER_ADMIN, ROLES.SUPPORT],
  },
  {
    prefix: '/reports',
    roles: [ROLES.SUPER_ADMIN, ROLES.ANALYST],
  },
  {
    prefix: '/subscriptions',
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    prefix: '/ai',
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    prefix: '/audit-log',
    roles: [ROLES.SUPER_ADMIN],
  },
];

function normalizeRole(role?: string | null): UserRole | null {
  if (!role) return null;

  const normalized = role.trim().toLowerCase();

  if (
    normalized === 'super_admin' ||
    normalized === 'super admin' ||
    normalized === 'superadmin' ||
    normalized === 'super-admin' ||
    normalized === 'admin'
  ) {
    return ROLES.SUPER_ADMIN;
  }

  if (normalized === 'support') {
    return ROLES.SUPPORT;
  }

  if (normalized === 'analyst' || normalized === 'analyste') {
    return ROLES.ANALYST;
  }

  if (normalized === 'user' || normalized === 'apiculteur') {
    return ROLES.USER;
  }

  return null;
}

export const usePermissions = () => {
  const [user, setUser] = useState<StoredUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const rawUser = localStorage.getItem('user');
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const rawUser = localStorage.getItem('user');

      if (!rawUser) {
        setUser(null);
      } else {
        const parsedUser = JSON.parse(rawUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleStorageChange = () => {
      refreshUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-state-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-change', handleStorageChange);
    };
  }, [refreshUser]);

  const role = useMemo(
    () => normalizeRole(user?.role),
    [user?.role],
  );

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isSupport = role === ROLES.SUPPORT;
  const isAnalyst = role === ROLES.ANALYST;
  const isUser = role === ROLES.USER;

  const permissions = useMemo(
    () => ({
      canViewDashboard:
        isSuperAdmin || isSupport || isAnalyst || isUser,
      canManageUsers: isSuperAdmin || isSupport,
      canManageZones: isSuperAdmin || isAnalyst,
      canModerate: isSuperAdmin || isSupport,
      canViewReports: isSuperAdmin || isAnalyst,
      canViewAI: isSuperAdmin,
      canViewAuditLogs: isSuperAdmin,
      canManageSubscriptions: isSuperAdmin,
    }),
    [isSuperAdmin, isSupport, isAnalyst, isUser],
  );

  const canAccessRoute = useCallback(
    (pathname: string) => {
      if (pathname === '/' || pathname === '/login') {
        return true;
      }

      const matchedRule = routeRules.find(
        (rule) =>
          pathname === rule.prefix ||
          pathname.startsWith(`${rule.prefix}/`),
      );

      if (!matchedRule) {
        return true;
      }

      if (!role) {
        return false;
      }

      return matchedRule.roles.includes(role);
    },
    [role],
  );

  return {
    user,
    role,
    roleLabel: role ? ROLE_LABELS[role] : 'Invité',
    isLoading,
    isSuperAdmin,
    isSupport,
    isAnalyst,
    isUser,
    ...permissions,
    canAccessRoute,
    refreshUser,
  };
};