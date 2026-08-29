import { API_BASE_URL } from '@/constants/api';

type ApiRequestOptions = RequestInit;

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;

    try {
      const errorBody = await response.json();

      if (errorBody?.message) {
        errorMessage = Array.isArray(errorBody.message)
          ? errorBody.message.join(', ')
          : errorBody.message;
      }
    } catch {
      // Keep default error message if response body is not JSON
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function apiGet<T>(path: string, options?: ApiRequestOptions) {
  return apiRequest<T>(path, {
    ...options,
    method: 'GET',
  });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options?: ApiRequestOptions,
) {
  return apiRequest<T>(path, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options?: ApiRequestOptions,
) {
  return apiRequest<T>(path, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}