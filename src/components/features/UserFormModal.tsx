'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ROLES,
  STATUSES,
  ROLE_LABELS,
  STATUS_LABELS,
  SUBSCRIPTION_PLAN_LABELS,
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_STATUS_LABELS,
} from '@/lib/constants/auth.constants';
import { User, useUserStore } from '@/lib/store/userStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/lib/hooks/useI18n';

const userFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.nativeEnum(ROLES as any),
  status: z.nativeEnum(STATUSES as any),
  subscriptionPlan: z.string().optional(),
  subscriptionStatus: z.string().optional(),
  subscriptionExpiresAt: z.string().optional(),
  region: z.string().min(2),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export function UserFormModal({
  isOpen,
  onClose,
  userToEdit,
}: UserFormModalProps) {
  const { t } = useI18n();
  const { addUser, updateUser } = useUserStore();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: ROLES.USER,
      status: STATUSES.ACTIVE,
      subscriptionPlan: 'FREE',
      subscriptionStatus: SUBSCRIPTION_STATUSES.ACTIVE,
      subscriptionExpiresAt: '',
      region: '',
    },
  });

  useEffect(() => {
    if (userToEdit) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role as any,
        status: userToEdit.status as any,
        subscriptionPlan: userToEdit.subscriptionPlan || 'FREE',
        subscriptionStatus:
          userToEdit.subscriptionStatus || SUBSCRIPTION_STATUSES.ACTIVE,
        subscriptionExpiresAt: userToEdit.subscriptionExpiresAt
          ? userToEdit.subscriptionExpiresAt.slice(0, 10)
          : '',
        region: userToEdit.region,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        role: ROLES.USER,
        status: STATUSES.ACTIVE,
        subscriptionPlan: 'FREE',
        subscriptionStatus: SUBSCRIPTION_STATUSES.ACTIVE,
        subscriptionExpiresAt: '',
        region: '',
      });
    }
  }, [userToEdit, isOpen, form]);

  async function onSubmit(data: UserFormValues) {
    try {
      const payload = {
        ...data,
        subscriptionExpiresAt: data.subscriptionExpiresAt || null,
      };

      if (userToEdit) {
        await updateUser(userToEdit._id, payload);
      } else {
        await addUser(payload);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {userToEdit
              ? t('users.form.editTitle')
              : t('users.form.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.form.fullName')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('users.form.fullNamePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.form.email')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('users.form.emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.form.role')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('users.form.role')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.form.accountStatus')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('users.form.accountStatus')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subscriptionPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.form.subscriptionPlan')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-amber-200 bg-amber-50/30">
                        <SelectValue placeholder={t('users.form.choosePlan')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SUBSCRIPTION_PLAN_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subscriptionStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.form.subscriptionStatus')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-amber-200 bg-amber-50/30">
                          <SelectValue
                            placeholder={t('users.form.subscriptionStatus')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SUBSCRIPTION_STATUS_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscriptionExpiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.form.expirationDate')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.form.region')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('users.form.regionPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                {t('users.form.cancel')}
              </Button>

              <Button
                type="submit"
                className="bg-amber-600 text-white shadow-md hover:bg-amber-700"
              >
                {userToEdit
                  ? t('users.form.update')
                  : t('users.form.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}