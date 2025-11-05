import { useAuthStore } from '@/store/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = useAuthStore()
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...auth.authHeader,
    ...(init?.headers || {}),
  } as Record<string, string>

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  if (res.status === 204) return undefined as unknown as T
  return (await res.json()) as T
}
