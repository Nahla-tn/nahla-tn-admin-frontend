import api from './axios'; 

// Types pour le Profil 360
export interface Movement {
  _id: string;
  date: string;
  destination?: string;
  coordinates?: [number, number] | null;
  from?: [number, number] | null;
  to?: [number, number] | null;
  hives?: number;
  hiveCount?: number;
  status?: string;
  rating?: string;
  feedbackNote?: string;
  reason?: string;
  notes?: string;
}

export interface UserProfile {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'SUPPORT' | 'ANALYST' | 'APICULTEUR';
    status: 'Actif' | 'Bloqué' | 'Suspendu';
    region: string;
    phone: string;
    createdAt: string;
  };
  subscription: {
    current: string;
    status: string;
    expiresAt: string | null;
    history: any[];
  };
  movements: Movement[];
  signalements: any[];
  stats: {
    totalHives: number;
    totalMovements: number;
    lastActivity: string;
    renewalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  region: string;
  subscriptionPlan?: string;
}

export const userService = {
  getProfile: (id: string): Promise<UserProfile> => 
    api.get(`/users/${id}/profile`).then(res => res.data),
    
  updateStatus: (id: string, status: string) =>
    api.patch(`/users/${id}/toggle-status`, { status }),
    
  updateRole: (id: string, role: string) =>
    api.patch(`/users/${id}`, { role }),
    
  findAll: (page: number = 1, limit: number = 10): Promise<{ data: User[]; total: number }> =>
    api.get('/users', { params: { page, limit } }).then(res => res.data),
    
  exportExcel: () =>
    api.get('/users/export/excel', { responseType: 'blob' }),
    
  exportPdf: () =>
    api.get('/users/export/pdf', { responseType: 'blob' }),

  updateSubscription: (id: string, data: { isPremium: boolean; subscriptionPlan?: string }) =>
    api.patch(`/users/${id}/subscription`, data).then(res => res.data),
};