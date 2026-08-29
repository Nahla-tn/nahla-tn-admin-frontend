// src/constants/users.ts

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SUPPORT = 'support',
  ANALYST = 'analyst',
  BEEKEEPER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  PENDING = 'pending',
}

export enum SubscriptionPlan {
  FREE = 'free',
  PLUS = 'plus',
  PREMIUM = 'premium',
}
export const SUBSCRIPTION_PLAN_LABELS = {
  FREE: { label: 'Gratuit', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  PLUS: { label: 'Plus', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  PREMIUM: { label: 'Premium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};