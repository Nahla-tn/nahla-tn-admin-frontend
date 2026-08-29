import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: {
    current: string;
    status: string;
    expiresAt: string | null;
    history: any[];
  };
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'Expiré': return 'bg-red-100 text-red-800';
      case 'En renouvellement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-orange-500" />
          Abonnement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Plan actuel</span>
          <Badge variant="outline" className="font-semibold">
            {subscription.current}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Statut</span>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </div>

        {subscription.expiresAt && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Expiration
            </span>
            <span className="text-sm">
              {new Date(subscription.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {subscription.history.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-500 mb-2">Historique</p>
            <div className="space-y-1">
              {subscription.history.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="text-xs text-gray-600 flex justify-between">
                  <span>{item.plan || 'N/A'}</span>
                  <span>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}