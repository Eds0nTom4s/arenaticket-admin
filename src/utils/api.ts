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
    
    // Tentar parsear JSON do erro para obter mensagem detalhada
    try {
      const errorData = JSON.parse(text)
      // Formato Spring Boot: { timestamp, status, error, message, path }
      if (errorData.message) {
        throw new Error(errorData.message)
      }
    } catch (jsonError) {
      // Se não for JSON válido, usa a mensagem original
    }
    
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  if (res.status === 204) return undefined as unknown as T
  return (await res.json()) as T
}
