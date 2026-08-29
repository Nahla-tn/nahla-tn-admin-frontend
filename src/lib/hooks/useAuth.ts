'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, UserRole } from '@/lib/constants/auth.constants';

type StoredUser = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
};

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

  if (
    normalized === 'analyst' ||
    normalized === 'analyste'
  ) {
    return ROLES.ANALYST;
  }

  if (
    normalized === 'user' ||
    normalized === 'apiculteur'
  ) {
    return ROLES.USER;
  }

  return null;
}

export function useAuth(allowedRoles?: UserRole[]) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');

    if (!token || !rawUser) {
      router.push('/login');
      setIsChecking(false);
      return;
    }

    try {
      const parsedUser: StoredUser = JSON.parse(rawUser);
      const role = normalizeRole(parsedUser.role);

      if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        router.push('/dashboard');
        setIsChecking(false);
        return;
      }

      setUser(parsedUser);
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setIsChecking(false);
    }
  }, [router, allowedRoles]);

  return { isAuthenticated, isChecking, user };
}