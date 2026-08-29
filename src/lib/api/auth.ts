// src/lib/api/auth.ts
import { API_BASE_URL, API_ROUTES } from '@/constants/api';

export async function loginUser(identifier: string, password: string) {
  const isEmail = identifier.includes('@');
  const payload = isEmail
    ? { email: identifier.trim(), password }
    : { telephone: identifier.trim(), password };

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login échoué');
  }

  return data;
}