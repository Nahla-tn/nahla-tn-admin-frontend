import api from '@/lib/api/axios';

export async function getUsers() {
  const response = await api.get('/users');
  return response.data?.users || response.data?.data || response.data || [];
}