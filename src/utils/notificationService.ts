/**
 * Serviço de API para notificações e resend
 * Endpoints conforme GUIA_IMPLEMENTACAO_RESEND_PAINEL_ADMIN.txt
 */

import { api } from './api'
import type { SmsHealthStatus, ResendResponse } from '@/types/notification'

export const notificationService = {
  /**
   * Obter saúde do sistema SMS
   * GET /api/v1/admin/notifications/sms/health
   */
  async getSmsHealth(): Promise<SmsHealthStatus> {
    try {
      const response = await api('/admin/notifications/sms/health')
      return response as SmsHealthStatus
    } catch (error: any) {
      console.error('Erro ao buscar saúde do SMS:', error)
      throw error
    }
  },

  /**
   * Reenviar códigos de bilhetes para um pedido
   * POST /api/v1/admin/pedidos/{pedidoId}/reenviar-codigos
   */
  async resendTicketCodes(pedidoId: string): Promise<ResendResponse> {
    try {
      const response = await api(`/admin/pedidos/${pedidoId}/reenviar-codigos`, {
        method: 'POST'
      })
      return response as ResendResponse
    } catch (error: any) {
      console.error('Erro ao reenviar códigos:', error)
      throw error
    }
  }
}
