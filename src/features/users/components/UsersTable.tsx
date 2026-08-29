'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Import jdid
import {
  ROLE_LABELS,
  STATUS_STYLES,
  STATUS_LABELS,
  STATUSES,
  SUBSCRIPTION_PLAN_LABELS,
  SUBSCRIPTION_PLAN_STYLES,
} from '@/lib/constants/auth.constants';
import { User } from '@/lib/store/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ArrowUpDown,
  UserMinus,
  UserCheck,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye, // ✅ Icon jdid lel "voir profil"
} from 'lucide-react';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleStatus: (id: string) => void;
}

export default function UsersTable({ users, onEdit, onToggleStatus }: UsersTableProps) {
  const router = useRouter(); // ✅ Hook
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);
  const itemsPerPage = 5;

  const handleSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ✅ Navigation l profil 360°
  const handleRowClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (searchTerm) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [users, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-gray-400 ml-2" />
        <Input
          placeholder="Rechercher un apiculteur..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="p-4 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => handleSort('name')}>
                  Nom <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4 hidden md:table-cell">Rôle</th>
                <th className="p-4">Abonnement</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => handleRowClick(user._id)} // ✅ Click 3la row
                    className="hover:bg-orange-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 font-medium">
                      <div className="flex flex-col">
                        {/* ✅ Nom ybqa visuellement link */}
                        <span className="text-gray-900 group-hover:text-orange-600 transition-colors">
                          {user.name}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-gray-600">
                      {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                    </td>

                    <td className="p-4">
                      <Badge variant="outline" className={SUBSCRIPTION_PLAN_STYLES[user.subscriptionPlan || 'FREE']}>
                        {user.subscriptionPlan === 'PREMIUM' && <ShieldCheck className="w-3 h-3 mr-1" />}
                        {SUBSCRIPTION_PLAN_LABELS[user.subscriptionPlan || 'FREE']}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <Badge className={STATUS_STYLES[user.status as keyof typeof STATUS_STYLES]}>
                        {STATUS_LABELS[user.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* ✅ Bouton "Voir profil" explicite */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Voir le profil 360°"
                          onClick={(e) => {
                            e.stopPropagation(); // ⚠️ Important
                            handleRowClick(user._id);
                          }}
                        >
                          <Eye className="w-4 h-4 text-orange-600" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Modifier"
                          onClick={(e) => {
                            e.stopPropagation(); // ⚠️ Ma yfta7ech lprofil
                            onEdit(user);
                          }}
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={user.status === STATUSES.ACTIVE ? 'Bloquer' : 'Débloquer'}
                          onClick={(e) => {
                            e.stopPropagation(); // ⚠️ Ma yfta7ech lprofil
                            onToggleStatus(user._id);
                          }}
                        >
                          {user.status === STATUSES.ACTIVE ? (
                            <UserMinus className="w-4 h-4 text-red-500" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">Aucun apiculteur trouvé...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination... */}
    </div>
  );
}