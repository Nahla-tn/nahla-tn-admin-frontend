'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { MoreVertical, Ban, CheckCircle, Shield } from 'lucide-react';

interface Props {
  userId: string;
  currentStatus: string;
  currentRole?: string;
}

export function AdminActions({ userId, currentStatus, currentRole }: Props) {
  const { canManageUsers } = usePermissions();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'activate' | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => userService.updateStatus(userId, status),
    onSuccess: () => {
      // ✅ FIX ICI : Syntaxe v5 avec objet { queryKey: [...] }
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      setConfirmAction(null);
    },
  });

  if (!canManageUsers) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            Actions <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus === 'Actif' ? (
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => setConfirmAction('suspend')}
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspendre le compte
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              className="text-green-600"
              onClick={() => setConfirmAction('activate')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Réactiver le compte
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem disabled>
            <Shield className="h-4 w-4 mr-2" />
            Modifier le rôle (à venir)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'suspend' ? 'Suspendre cet utilisateur ?' : 'Réactiver cet utilisateur ?'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'suspend' 
                ? "L'utilisateur ne pourra plus se connecter jusqu'à réactivation."
                : "L'utilisateur retrouvera l'accès immédiat à la plateforme."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Annuler
            </Button>
            <Button 
              variant={confirmAction === 'suspend' ? 'destructive' : 'default'}
              onClick={() => statusMutation.mutate({ 
                status: confirmAction === 'suspend' ? 'Suspendu' : 'Actif' 
              })}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? 'Traitement...' : 'Confirmer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}