'use client';
import { Badge } from '@/components/ui/badge';

export function UserHeader({ user }: { user: any }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-500">{user.email}</p>
      <Badge>{user.role}</Badge>
    </div>
  );
}