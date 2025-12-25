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
        // Limpar mensagens técnicas e extrair apenas a parte amigável
        let cleanMessage = errorData.message
        
        // Remover prefixos técnicos comuns
        cleanMessage = cleanMessage.replace(/^Erro de validação:\s*/, '')
        cleanMessage = cleanMessage.replace(/^\{.*=\s*/, '')
        cleanMessage = cleanMessage.replace(/\}.*$/, '')
        
        // Mapeamento de mensagens técnicas para mensagens amigáveis
        const messageMap: Record<string, string> = {
          'ID do evento é obrigatório': 'Evento não encontrado ou inválido',
          'Bilhete não encontrado': 'Bilhete não encontrado ou código inválido',
          'Bilhete já foi utilizado': 'Este bilhete já foi utilizado',
          'Bilhete expirado': 'Este bilhete está expirado',
          'Bilhete cancelado': 'Este bilhete foi cancelado',
          'Evento não permite check-in': 'Check-in não permitido para este evento no momento',
          'Acesso negado': 'Você não tem permissão para realizar esta ação'
        }
        
        // Usar mensagem mapeada se existir, senão usar a mensagem limpa
        cleanMessage = messageMap[cleanMessage] || cleanMessage
        
        throw new Error(cleanMessage)
      }
    } catch (jsonError) {
      // Se não for JSON válido ou erro no parsing, continua
    }
    
    throw new Error(`Erro na operação (${res.status})`)
  }
  if (res.status === 204) return undefined as unknown as T
  return (await res.json()) as T
}
