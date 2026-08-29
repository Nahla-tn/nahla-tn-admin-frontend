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
}
  
  export interface UserProfile {
    user: {
      _id: string;
      name: string;
      email: string;
      role: 'SUPER_ADMIN' | 'SUPPORT' | 'ANALYST' | 'APICULTEUR';
      status: 'Actif' | 'Bloqué' | 'Suspendu';
      region: string;
      createdAt: string;
    };
    subscription: {
      current: string;
      status: string;
      expiresAt: string;
    };
    movements: Movement[];
    signalements: any[];
    stats: {
      totalHives: number;
      totalMovements: number;
      renewalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    };
  }