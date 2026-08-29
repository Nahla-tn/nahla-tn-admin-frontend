export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ANALYST: 'Analyste',
  SUPPORT: 'Support',
  USER: 'Apiculteur',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ANALYST]: 'Analyste',
  [ROLES.SUPPORT]: 'Support',
  [ROLES.USER]: 'Apiculteur',
};

export const STATUSES = {
  ACTIVE: 'Actif',
  BLOCKED: 'Bloqué',
  PENDING: 'En attente',
} as const;

export type UserStatus = typeof STATUSES[keyof typeof STATUSES];

export const STATUS_LABELS: Record<UserStatus, string> = {
  [STATUSES.ACTIVE]: 'Actif',
  [STATUSES.BLOCKED]: 'Bloqué',
  [STATUSES.PENDING]: 'En attente',
};

export const STATUS_STYLES: Record<UserStatus, string> = {
  [STATUSES.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
  [STATUSES.BLOCKED]: 'bg-red-100 text-red-800 border-red-200',
  [STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export const SUBSCRIPTION_PLAN_LABELS = {
  FREE: 'Gratuit',
  PLUS: 'Plus',
  PREMIUM: 'Premium',
  UNKNOWN: 'Non défini',
};

export const SUBSCRIPTION_PLAN_STYLES = {
  FREE: 'bg-slate-100 text-slate-700 border-slate-200',
  PLUS: 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm',
  PREMIUM: 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm font-bold',
  UNKNOWN: 'bg-gray-50 text-gray-400 border-gray-100 italic',
};

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
} as const;

export type SubscriptionStatus =
  typeof SUBSCRIPTION_STATUSES[keyof typeof SUBSCRIPTION_STATUSES];

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  EXPIRED: 'Expiré',
};

export const SUBSCRIPTION_STATUS_STYLES: Record<SubscriptionStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  SUSPENDED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  EXPIRED: 'bg-red-100 text-red-700 border-red-200',
};