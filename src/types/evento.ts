// Tipos conforme documentação FRONTEND_INTEGRATION.md v1.1.0
import type { NotificationStatus } from './notification'

export interface Evento {
  id: string
  titulo: string
  descricao: string
  local: string
  dataEvento: string // ISO 8601 - data/hora de início
  duracaoMinutos: number // Duração em minutos (default: 90)
  dataFim: string // ISO 8601 - calculado automaticamente
  bannerUrl?: string
  abertoParaVenda: boolean
  createdAt: string // ISO 8601
  updatedAt?: string // ISO 8601
}

export type EventoCreate = Omit<Evento, 'id' | 'createdAt' | 'updatedAt' | 'dataFim'>
export type EventoUpdate = Partial<EventoCreate>

export interface LoteBilhete {
  id: string
  eventoId: string
  nome: string
  preco: number // Kwanzas (Kz)
  quantidadeTotal: number
  quantidadeReservada: number
  quantidadeVendida: number
  quantidadeDisponivel: number // calculado
  inicioVenda: string // ISO 8601
  fimVenda: string // ISO 8601
  createdAt: string // ISO 8601
}

export type LoteCreate = Omit<LoteBilhete, 'id' | 'eventoId' | 'quantidadeReservada' | 'quantidadeVendida' | 'quantidadeDisponivel' | 'createdAt'>
export type LoteUpdate = Partial<LoteCreate>

export interface Pedido {
  id: string
  compradorNome: string
  compradorEmail?: string
  compradorTelefone: string
  eventoId: string
  eventoTitulo?: string
  loteId: string
  loteNome?: string
  quantidade: number
  valorUnitario?: number
  valorTotal: number // Backend retorna "valorTotal" não "total"
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  paymentId?: string
  metodoPagamento?: string
  createdAt: string
  updatedAt?: string
  paidAt?: string
  bilhetes?: Bilhete[]
  clientRequestId?: string
  // Campos do Sistema de Notificações (RESEND)
  notificationFailureCount?: number // Número de falhas no envio de notificações
  lastNotificationStatus?: NotificationStatus // Status da última tentativa de notificação
  lastNotificationAttempt?: string // ISO 8601 - data/hora da última tentativa
}

export interface Bilhete {
  id: string
  pedidoId: string
  eventoId: string
  loteId: string
  codigoTicket: string
  codigoTicketCompact: string
  codigoQR: string // Base64 image
  compradorNome: string
  compradorTelefone: string
  status: 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED'
  vendidoEm: string
  utilizadoEm?: string
  createdAt: string
}

// Tipos para Vendas Presenciais - Conforme IMPLEMENTACAO_VENDEDOR_RESUMO.txt
export type MetodoPagamento = 'CASH' | 'TPA' | 'MULTICAIXA_EXPRESS' | 'REFERENCIA_ATM'

export interface VendaPresencialPayload {
  eventoId: string
  loteId: string
  quantidade: number
  compradorNome: string
  compradorTelefone: string
  metodoPagamento: 'CASH' | 'TPA' // Apenas CASH e TPA para vendas presenciais
  vendedorId: string // ID do vendedor autenticado
  pontoVenda?: string // Identificação do ponto de venda (ex: "ESTADIO_BILHETERIA_1")
}

export interface VendaPresencialResponse {
  pedidoId: string
  status: 'PAID'
  total: number // Backend retorna "total" não "valorTotal"
  metodoPagamento: 'CASH' | 'TPA'
  pontoVenda?: string
  criadoEm: string // ISO 8601
  bilhetes: BilheteVendaPresencial[]
}

export interface BilheteVendaPresencial {
  id: string
  codigoTicket: string
  codigoQR: string // Base64 image (data:image/png;base64,...)
  compradorNome: string
  evento: string // Título do evento
  lote: string // Nome do lote
  preco: number
  dataEvento: string // ISO 8601 - data e hora do evento
}

