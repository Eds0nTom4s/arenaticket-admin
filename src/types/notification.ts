/**
 * Tipos para sistema de notificações e resend
 * Conforme GUIA_IMPLEMENTACAO_RESEND_PAINEL_ADMIN.txt
 */

export type NotificationType = 'SMS_TICKET_CODES' | 'SMS_PAYMENT_CONFIRMED' | 'EMAIL_CONFIRMATION'
export type NotificationStatus = 'SUCCESS' | 'FAILED' | 'PENDING'

export interface Notification {
  id: number
  tipo: NotificationType
  status: NotificationStatus
  tentativa: number
  dataTentativa: string // ISO 8601
  destinatario: string // Mascarado: +244 9XX***678
  motivo?: string // Razão da falha (timeout, invalid number, etc)
  usuarioId?: number // Admin que solicitou resend
}

export interface NotificationSummary {
  hasNotificationFailure: boolean
  lastNotificationStatus: NotificationStatus
  lastNotificationTimestamp: string
  notificationFailureCount: number
}

export interface SmsHealthStatus {
  healthy: boolean
  consecutiveFailures: number
  totalFailures: number
  totalSuccess: number
  successRate: number // Percentual (0-100)
  lastSuccessTimestamp?: string
  lastFailureTimestamp?: string
  lastFailureReason?: string
}

export interface ResendResponse {
  success: boolean
  message: string
}
