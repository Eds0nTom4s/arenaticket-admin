import { useAuthStore } from '@/store/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export async function api<T>(path: string, init?: RequestInit, options?: { extractDataOnError?: boolean }): Promise<T> {
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
    
    // Para endpoints específicos, tentar extrair dados mesmo em caso de erro
    if (options?.extractDataOnError && path.includes('/porteiro/validar')) {
      try {
        const errorData = JSON.parse(text)
        // Se contém dados do bilhete diretamente, retornar como sucesso
        if (errorData.bilhete) {
          return errorData.bilhete as T
        }
        // Tentar extrair dados do bilhete de outros campos possíveis
        if (errorData.data && typeof errorData.data === 'object') {
          return errorData.data as T
        }
        // Verificar se a resposta de erro em si é um bilhete (contém campos típicos)
        const possibleBilheteFields = ['id', 'codigoTicket', 'status', 'compradorNome', 'vendidoEm', 'utilizadoEm']
        const hasBilheteFields = possibleBilheteFields.some(field => errorData.hasOwnProperty(field))
        if (hasBilheteFields) {
          return errorData as T
        }
        
        // Ou se é um erro conhecido, criar um objeto bilhete com status baseado na mensagem
        if (errorData.message) {
          let status = 'INVALID'
          if (errorData.message.includes('utilizado') || errorData.message.includes('USED')) {
            status = 'USED'
          } else if (errorData.message.includes('expirado') || errorData.message.includes('EXPIRED')) {
            status = 'EXPIRED'
          } else if (errorData.message.includes('cancelado') || errorData.message.includes('CANCELLED')) {
            status = 'CANCELLED'
          }
          
          // Criar um bilhete básico com o status identificado
          let codigoTicket = ''
          try {
            if (init?.body && typeof init.body === 'string') {
              codigoTicket = JSON.parse(init.body).codigoTicket || ''
            }
          } catch (e) {
            // Ignorar erro de parsing
          }
          
          return {
            id: 0,
            status,
            codigoTicket,
            codigoTicketCompact: codigoTicket,
            compradorNome: 'Informação não disponível',
            compradorTelefone: 'N/A',
            vendidoEm: new Date().toISOString(),
            utilizadoEm: status === 'USED' ? new Date().toISOString() : undefined
          } as T
        }
      } catch (jsonError) {
        // Se não conseguir extrair, continua com o tratamento normal de erro
      }
    }
    
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
