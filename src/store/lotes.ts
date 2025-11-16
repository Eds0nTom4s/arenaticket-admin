import { defineStore } from 'pinia'
import { api } from '@/utils/api'
import type { LoteBilhete, LoteCreate, LoteUpdate } from '@/types/evento'

interface State {
  itens: LoteBilhete[]
  loading: boolean
  error: string | null
}

export const useLotesStore = defineStore('lotes', {
  state: (): State => ({ itens: [], loading: false, error: null }),
  actions: {
    async listarPorEvento(eventoId: string) {
      this.loading = true
      this.error = null
      try {
        // Buscar lotes via endpoint /admin/lotes (todos os lotes)
        // e filtrar pelo eventoId
        const todosLotes = await api<LoteBilhete[]>(`/admin/lotes`)
        this.itens = todosLotes.filter(l => l.eventoId === eventoId)
      } catch (e: any) {
        this.error = e.message || 'Erro ao carregar lotes'
      } finally {
        this.loading = false
      }
    },
    
    async criar(eventoId: string, payload: LoteCreate) {
      const payloadComEvento = {
        ...payload,
        eventoId
      }
      const created = await api<LoteBilhete>(`/admin/lotes`, {
        method: 'POST',
        body: JSON.stringify(payloadComEvento),
      })
      this.itens.push(created)
      return created
    },
    
    async atualizar(eventoId: string, loteId: string, payload: LoteUpdate) {
      const payloadComEvento = {
        ...payload,
        eventoId
      }
      const updated = await api<LoteBilhete>(`/admin/lotes/${loteId}`, {
        method: 'PUT',
        body: JSON.stringify(payloadComEvento),
      })
      const idx = this.itens.findIndex((l) => l.id === loteId)
      if (idx >= 0) this.itens[idx] = updated
      return updated
    },
    
    async remover(_eventoId: string, loteId: string) {
      await api<void>(`/admin/lotes/${loteId}`, { method: 'DELETE' })
      this.itens = this.itens.filter((l) => l.id !== loteId)
    },
  },
})
