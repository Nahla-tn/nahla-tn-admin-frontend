'use client';

import { usePermissions } from '@/lib/hooks/usePermissions';
import {
  STATUSES,
  SUBSCRIPTION_PLAN_LABELS,
  SUBSCRIPTION_PLAN_STYLES,
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_STYLES,
} from '@/lib/constants/auth.constants';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, User } from '@/lib/store/userStore';
import { UserFormModal } from '@/components/features/UserFormModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';
import { useI18n } from '@/lib/hooks/useI18n';
import { exportToCsv } from '@/lib/utils/exportCsv';

function formatSubscriptionDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
}

export default function UsersPage() {
  const router = useRouter();
  const { t } = useI18n();

  const {
    users,
    fetchUsers,
    toggleBlockUser,
    exportUsersExcel,
    exportUsersPdf,
    page,
    lastPage,
    setPage,
    total,
  } = useUserStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const { canManageUsers } = usePermissions();

  const handleViewProfile = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  return (
    <div className="p-8 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm border-gray-100 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {t('users.title')}
          </h1>
          <p className="text-gray-500 mt-1">{t('users.subtitle')}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              const exportData = users.map((u) => {
                const resolvedName =
                  (u as any).name ||
                  `${(u as any).prenom || ''} ${(u as any).nom || ''}`.trim() ||
                  'Utilisateur';
                const resolvedPhone = (u as any).telephone || (u as any).phone || '-';
                const resolvedEmail = u.email || '-';
                const resolvedRole = u.role || 'APICULTEUR';
                const resolvedRegion = u.region || 'Non renseignée';
                const resolvedStatus = u.status || 'Actif';
                const resolvedPlan =
                  (u as any).subscriptionPlan ||
                  ((u as any).isPremium ? 'PREMIUM' : 'FREE');
                const resolvedDate = (u as any).createdAt
                  ? new Date((u as any).createdAt).toLocaleDateString()
                  : '-';

                return {
                  name: resolvedName,
                  telephone: resolvedPhone,
                  email: resolvedEmail,
                  role: resolvedRole,
                  region: resolvedRegion,
                  status: resolvedStatus,
                  subscriptionPlan: resolvedPlan,
                  createdAt: resolvedDate,
                };
              });

              exportToCsv(
                'utilisateurs_nahla',
                [
                  { label: 'Nom Complet', key: 'name' },
                  { label: 'Téléphone', key: 'telephone' },
                  { label: 'Email', key: 'email' },
                  { label: 'Rôle', key: 'role' },
                  { label: 'Région', key: 'region' },
                  { label: 'Statut', key: 'status' },
                  { label: 'Abonnement', key: 'subscriptionPlan' },
                  { label: 'Créé le', key: 'createdAt' },
                ],
                exportData,
              );
            }}
            className="border-blue-600 text-blue-700 hover:bg-blue-50 rounded-xl px-5 flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>

          <Button
            variant="outline"
            onClick={exportUsersExcel}
            className="border-green-600 text-green-700 hover:bg-green-50 rounded-xl px-5"
          >
            {t('users.exportExcel')}
          </Button>

          <Button
            variant="outline"
            onClick={exportUsersPdf}
            className="border-red-600 text-red-700 hover:bg-red-50 rounded-xl px-5"
          >
            {t('users.exportPdf')}
          </Button>

          {canManageUsers && (
            <Button
              onClick={handleAdd}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl px-6"
            >
              + {t('users.addUser')}
            </Button>
          )}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold py-4">
                {t('common.name')}
              </TableHead>
              <TableHead className="font-bold">{t('common.email')}</TableHead>
              <TableHead className="font-bold">{t('common.role')}</TableHead>
              <TableHead className="font-bold">{t('common.region')}</TableHead>
              <TableHead className="font-bold text-center">
                {t('users.plan')}
              </TableHead>
              <TableHead className="font-bold text-center">
                {t('users.subscriptionStatus')}
              </TableHead>
              <TableHead className="font-bold">
                {t('users.expiration')}
              </TableHead>
              <TableHead className="font-bold">
                {t('users.accountStatus')}
              </TableHead>
              <TableHead className="text-right font-bold pr-6">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user._id}
                  onClick={() => handleViewProfile(user._id)}
                  className="hover:bg-orange-50/50 transition-colors cursor-pointer group"
                >
                  <TableCell className="font-medium py-4">
                    <span className="text-gray-900 group-hover:text-orange-600 transition-colors">
                      {user.name}
                    </span>
                  </TableCell>

                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-gray-600">{user.role}</TableCell>
                  <TableCell className="text-gray-600">{user.region}</TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 rounded-full ${
                        SUBSCRIPTION_PLAN_STYLES[
                          user.subscriptionPlan || 'UNKNOWN'
                        ]
                      }`}
                    >
                      {user.subscriptionPlan
                        ? SUBSCRIPTION_PLAN_LABELS[user.subscriptionPlan]
                        : t('subscriptionPlans.notSubscribed')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      className={`${
                        SUBSCRIPTION_STATUS_STYLES[
                          (user.subscriptionStatus as keyof typeof SUBSCRIPTION_STATUS_STYLES) ||
                            'ACTIVE'
                        ]
                      }`}
                    >
                      {
                        SUBSCRIPTION_STATUS_LABELS[
                          (user.subscriptionStatus as keyof typeof SUBSCRIPTION_STATUS_LABELS) ||
                            'ACTIVE'
                        ]
                      }
                    </Badge>
                  </TableCell>

                  <TableCell className="text-gray-600">
                    {formatSubscriptionDate(user.subscriptionExpiresAt)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        user.status === STATUSES.ACTIVE
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right space-x-2 pr-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(user._id);
                      }}
                      className="text-orange-600 border-orange-100 hover:bg-orange-50 rounded-lg"
                      title={t('users.view')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t('users.view')}
                    </Button>

                    {canManageUsers && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(user);
                          }}
                          className="text-blue-600 border-blue-100 hover:bg-blue-50 rounded-lg"
                        >
                          {t('users.edit')}
                        </Button>

                        <Button
                          variant={
                            user.status === STATUSES.ACTIVE
                              ? 'destructive'
                              : 'secondary'
                          }
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBlockUser(user._id);
                          }}
                          className="rounded-lg"
                        >
                          {user.status === STATUSES.ACTIVE
                            ? t('users.block')
                            : t('users.unblock')}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="p-8 text-center text-gray-500 italic"
                >
                  {t('users.noUsers')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION UI */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-700">
            {t('common.page')}{' '}
            <span className="font-bold">{Number(page) || 1}</span> /{' '}
            <span className="font-bold">{Number(lastPage) || 1}</span>
            <span className="mx-2 text-gray-300">|</span>
            {t('common.total')}:{' '}
            <span className="font-bold text-amber-600">
              {total || 0} {t('users.totalUsers')}
            </span>
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (Number(page) > 1) setPage(Number(page) - 1);
              }}
              disabled={Number(page) <= 1}
              className="rounded-xl"
            >
              {t('common.previous')}
            </Button>

            <Button
              variant="outline"
              onClick={() => setPage(Number(page) + 1)}
              disabled={Number(page) >= Number(lastPage)}
              className="rounded-xl"
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userToEdit={editingUser}
      />
    </div>
  );
}