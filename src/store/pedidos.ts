import { defineStore } from 'pinia'
import { api } from '@/utils/api'
import type { Pedido } from '@/types/evento'

interface State {
  itens: Pedido[]
  loading: boolean
  error: string | null
  totalPages: number
  totalElements: number
}

export const usePedidosStore = defineStore('pedidos', {
  state: (): State => ({
    itens: [],
    loading: false,
    error: null,
    totalPages: 0,
    totalElements: 0,
  }),
  actions: {
    async listar(params?: {
      status?: string
      dataInicio?: string
      dataFim?: string
      page?: number
      size?: number
      sort?: string
    }) {
      this.loading = true
      this.error = null
      try {
        const query = new URLSearchParams()
        if (params?.status) query.append('status', params.status)
        if (params?.dataInicio) query.append('dataInicio', params.dataInicio)
        if (params?.dataFim) query.append('dataFim', params.dataFim)
        if (params?.page !== undefined) query.append('page', String(params.page))
        if (params?.size !== undefined) query.append('size', String(params.size))
        if (params?.sort) query.append('sort', params.sort)

        const response = await api<any>(`/admin/pedidos?${query.toString()}`)
        
        if (response.content) {
          this.itens = response.content
          this.totalPages = response.totalPages || 0
          this.totalElements = response.totalElements || 0
        } else {
          this.itens = response
        }
      } catch (e: any) {
        this.error = e.message || 'Erro ao carregar pedidos'
      } finally {
        this.loading = false
      }
    },
    
    async buscarPorId(pedidoId: string) {
      const pedido = await api<Pedido>(`/admin/pedidos/${pedidoId}`)
      return pedido
    },
    
    async cancelar(pedidoId: string) {
      const pedidoCancelado = await api<Pedido>(`/admin/pedidos/${pedidoId}/cancelar`, {
        method: 'PATCH',
      })
      
      // Atualizar o pedido na lista local
      const idx = this.itens.findIndex((p) => p.id === pedidoId)
      if (idx >= 0) {
        this.itens[idx] = pedidoCancelado
      }
      
      return pedidoCancelado
    },
    
    async reenviarCodigos(pedidoId: string) {
      const response = await api<{ success: boolean; message: string }>(`/admin/pedidos/${pedidoId}/reenviar-codigos`, {
        method: 'POST',
      })
      return response
    },
  },
})
