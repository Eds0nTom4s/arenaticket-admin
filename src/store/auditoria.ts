import { defineStore } from 'pinia'
import { api } from '@/utils/api'

export interface LogAuditoria {
  id: string
  usuario: string
  usuarioId: string
  acao: string
  entidade: string
  entidadeId: string
  detalhes: string
  ipAddress: string
  timestamp: string
}

interface State {
  itens: LogAuditoria[]
  loading: boolean
  error: string | null
  totalPages: number
  totalElements: number
}

export const useAuditoriaStore = defineStore('auditoria', {
  state: (): State => ({
    itens: [],
    loading: false,
    error: null,
    totalPages: 0,
    totalElements: 0,
  }),
  actions: {
    async listar(params?: {
      usuario?: string
      acao?: string
      entidade?: string
      dataInicio?: string
      dataFim?: string
      page?: number
      size?: number
    }) {
      this.loading = true
      this.error = null
      try {
        const query = new URLSearchParams()
        if (params?.usuario) query.append('usuario', params.usuario)
        if (params?.acao) query.append('acao', params.acao)
        if (params?.entidade) query.append('entidade', params.entidade)
        if (params?.dataInicio) query.append('dataInicio', params.dataInicio)
        if (params?.dataFim) query.append('dataFim', params.dataFim)
        if (params?.page !== undefined) query.append('page', String(params.page))
        if (params?.size !== undefined) query.append('size', String(params.size))

        const response = await api<any>(`/admin/auditoria?${query.toString()}`)
        
        if (response.content) {
          this.itens = response.content
          this.totalPages = response.totalPages || 0
          this.totalElements = response.totalElements || 0
        } else {
          this.itens = response
        }
      } catch (e: any) {
        this.error = e.message || 'Erro ao carregar logs de auditoria'
      } finally {
        this.loading = false
      }
    },
  },
})
