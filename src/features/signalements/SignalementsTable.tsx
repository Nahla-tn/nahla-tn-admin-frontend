import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Signalement {
  _id?: string;
  reason?: string;
  status?: 'PENDING' | 'VALIDATED' | 'REJECTED';
  createdAt?: string;
  description?: string;
}

interface SignalementsTableProps {
  data: Signalement[];
  compact?: boolean;
}

export function SignalementsTable({ data, compact }: SignalementsTableProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-6 text-center text-gray-500">
          Aucun signalement soumis par cet utilisateur
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'VALIDATED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'VALIDATED': return 'Validé';
      case 'REJECTED': return 'Rejeté';
      default: return 'En attente';
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {data.map((signalement, idx) => (
          <div key={signalement._id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(signalement.status)}
              <div>
                <p className="text-sm font-medium">{signalement.reason || 'Signalement terrain'}</p>
                <p className="text-xs text-gray-500">
                  {signalement.createdAt ? new Date(signalement.createdAt).toLocaleDateString() : 'Date inconnue'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {getStatusLabel(signalement.status)}
            </Badge>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left font-medium">Motif</th>
            <th className="p-3 text-left font-medium">Date</th>
            <th className="p-3 text-left font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {data.map((signalement, idx) => (
            <tr key={signalement._id || idx} className="border-t">
              <td className="p-3">{signalement.reason || '-'}</td>
              <td className="p-3 text-gray-500">
                {signalement.createdAt ? new Date(signalement.createdAt).toLocaleDateString() : '-'}
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(signalement.status)}
                  <span className="text-xs">{getStatusLabel(signalement.status)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}