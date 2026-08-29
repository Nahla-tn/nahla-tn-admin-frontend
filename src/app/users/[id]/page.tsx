'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { userService } from '@/lib/api/users';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/lib/hooks/useI18n';

const HiveMovementMap = dynamic(
  () =>
    import('@/components/maps/HiveMovementMap').then(
      (mod) => mod.HiveMovementMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        Chargement carte...
      </div>
    ),
  },
);

const UserHeader = ({ user }: { user: any }) => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
    <p className="text-gray-500">{user.email}</p>
    <div className="mt-2 flex gap-2">
      <Badge variant="outline">{user.role}</Badge>
      <Badge
        className={
          user.status === 'Actif'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }
      >
        {user.status}
      </Badge>
    </div>
  </div>
);

const SubscriptionCard = ({
  subscription,
  userId,
  onUpdated,
}: {
  subscription: any;
  userId?: string;
  onUpdated?: () => void;
}) => {
  const { t } = useI18n();
  const [updating, setUpdating] = useState(false);

  const isCurrentPremium =
    subscription?.current === 'Premium' ||
    subscription?.current === 'PREMIUM' ||
    (subscription?.status === 'Actif' && subscription?.current !== 'Gratuit');

  const handleTogglePremium = async () => {
    if (!userId) return;
    try {
      setUpdating(true);
      const nextIsPremium = !isCurrentPremium;
      await userService.updateSubscription(userId, {
        isPremium: nextIsPremium,
        subscriptionPlan: nextIsPremium ? 'PREMIUM' : 'FREE',
      });
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Failed to update subscription:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'bg-green-100 text-green-800';
      case 'Expiré':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            {t('profile.subscription')}
          </div>
          {isCurrentPremium ? (
            <Badge className="bg-amber-500 text-white hover:bg-amber-600">★ VIP Premium</Badge>
          ) : (
            <Badge variant="outline">Gratuit</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">{t('profile.plan')}</span>
          <Badge variant="outline">{subscription?.current || 'Gratuit'}</Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">{t('profile.status')}</span>
          <Badge className={getStatusColor(subscription?.status)}>
            {subscription?.status || 'Inactif'}
          </Badge>
        </div>

        {subscription?.expiresAt && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{t('profile.expiresAt')}</span>
            <span>
              {new Date(subscription.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {userId && (
          <div className="pt-2 border-t">
            <Button
              size="sm"
              variant={isCurrentPremium ? "outline" : "default"}
              className={`w-full ${!isCurrentPremium ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600" : "text-red-600 hover:text-red-700 hover:bg-red-50"}`}
              disabled={updating}
              onClick={handleTogglePremium}
            >
              {updating ? (
                "Mise à jour..."
              ) : isCurrentPremium ? (
                "Rétrograder en compte Gratuit"
              ) : (
                "Accorder l'accès Premium"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SignalementsTable = ({ data }: { data: any[] }) => {
  const { t } = useI18n();

  if (data.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-6 text-center text-gray-500">
          {t('profile.noSignalements')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((s: any, idx: number) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <p className="text-sm font-medium">
              {s.reason || t('profile.signalements')}
            </p>
            <p className="text-xs text-gray-500">
              {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}
            </p>
          </div>
          <Badge variant="outline">{s.status || 'PENDING'}</Badge>
        </div>
      ))}
    </div>
  );
};

const AdminActions = ({
  userId,
  currentStatus,
  onStatusUpdated,
}: {
  userId: string;
  currentStatus: string;
  onStatusUpdated?: () => void;
}) => {
  const { t } = useI18n();

  const [confirmAction, setConfirmAction] = useState<
    'suspend' | 'activate' | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    try {
      setLoading(true);
      await userService.updateStatus(
        userId,
        confirmAction === 'suspend' ? 'Bloqué' : 'Actif',
      );
      setConfirmAction(null);
      if (onStatusUpdated) {
        onStatusUpdated();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {currentStatus === 'Actif' ? (
          <Button
            variant="destructive"
            onClick={() => setConfirmAction('suspend')}
          >
            <Ban className="h-4 w-4 mr-2" />
            {t('profile.suspend')}
          </Button>
        ) : (
          <Button
            className="bg-green-600"
            onClick={() => setConfirmAction('activate')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {t('profile.reactivate')}
          </Button>
        )}
      </div>

      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'suspend'
                ? t('profile.confirmSuspend')
                : t('profile.confirmActivate')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t('common.cancel')}
            </Button>

            <Button
              variant={confirmAction === 'suspend' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={loading}
            >
              {loading ? '...' : t('common.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-orange-600">{value}</div>
    </CardContent>
  </Card>
);

export default function UserProfilePage() {
  const { t } = useI18n();
  const { id } = useParams();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => userService.getProfile(id as string),
  });

  if (isLoading) {
    return <div className="p-6">{t('profile.loading')}</div>;
  }

  if (!profile) {
    return <div className="p-6">{t('profile.notFound')}</div>;
  }

  const { user, subscription, movements, signalements, stats } = profile;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <UserHeader user={user} />
        <AdminActions
          userId={user._id}
          currentStatus={user.status}
          onStatusUpdated={refetch}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={t('profile.hives')}
          value={stats.totalHives}
          icon={<Users className="h-4 w-4 text-orange-500" />}
        />

        <StatCard
          title={t('profile.movements')}
          value={stats.totalMovements}
          icon={<MapPin className="h-4 w-4 text-blue-500" />}
        />

        <StatCard
          title={t('profile.lastActivity')}
          value={new Date(stats.lastActivity).toLocaleDateString()}
          icon={<Calendar className="h-4 w-4 text-green-500" />}
        />

        <Card
          className={
            stats.renewalRisk === 'HIGH' ? 'border-red-200 bg-red-50' : ''
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {t('profile.churnRisk')}
              {stats.renewalRisk === 'HIGH' && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Badge
              variant={stats.renewalRisk === 'HIGH' ? 'destructive' : 'default'}
            >
              {stats.renewalRisk === 'LOW'
                ? t('profile.riskLow')
                : stats.renewalRisk === 'MEDIUM'
                  ? t('profile.riskMedium')
                  : t('profile.riskHigh')}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <SubscriptionCard subscription={subscription} userId={user._id} onUpdated={refetch} />

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.information')}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('profile.region')}</span>
                <span className="font-medium">{user.region}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">{t('profile.phone')}</span>
                <span>{user.phone}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  {t('profile.registeredAt')}
                </span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>{t('profile.hivesTrajectory')}</CardTitle>
            </CardHeader>

            <CardContent className="p-0 h-[400px]">
              <HiveMovementMap movements={movements} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.signalements')} ({signalements.length})
              </CardTitle>
            </CardHeader>

            <CardContent>
              <SignalementsTable data={signalements} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}