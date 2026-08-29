export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const API_ROUTES = {
  LOGIN: '/auth/login',
  USERS: '/users',
  userById: (id: string) => `/users/${id}`,
  toggleUserBlock: (id: string) => `/users/${id}/toggle-block`,
  ARTICLES: '/api/v1/articles',
  articleById: (id: string) => `/api/v1/articles/${id}`,
  togglePublishArticle: (id: string) => `/api/v1/articles/${id}/toggle-publish`,
  SCORING_CONFIG: '/zones/scoring-config',
  RECALCULATE_ZONES: '/zones/recalculate-all',
  BROADCAST: '/admin/broadcast',
} as const;