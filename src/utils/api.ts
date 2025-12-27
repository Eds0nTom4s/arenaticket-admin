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
      // Formato Spring Boot melhorado: { timestamp, status, error, message, path }
      // error: tipo específico ("Check-in Fechado", "Bilhete Já Utilizado", etc.)
      // message: mensagem amigável já formatada pelo backend
      if (errorData.message) {
        const error = new Error(errorData.message) as Error & { type?: string }
        // Adicionar tipo de erro para uso na UI
        error.type = errorData.error
        throw error
      }
    } catch (jsonError) {
      // Se o erro for do tipo Error (já lançado acima), relançar
      if (jsonError instanceof Error && jsonError.message) {
        throw jsonError
      }
      // Se não for JSON válido ou erro no parsing, continua
    }
    
    throw new Error(`Erro na operação (${res.status})`)
  }
  if (res.status === 204) return undefined as unknown as T
  return (await res.json()) as T
}
