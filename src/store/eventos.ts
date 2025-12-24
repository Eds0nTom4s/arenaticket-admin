import { defineStore } from 'pinia'
import { api } from '@/utils/api'
import type { Evento, EventoCreate, EventoUpdate, CheckInToggleRequest, CheckInToggleResponse, CheckInStatusResponse } from '@/types/evento'

interface State {
  itens: Evento[]
  loading: boolean
  error: string | null
}

export const useEventosStore = defineStore('eventos', {
  state: (): State => ({ itens: [], loading: false, error: null }),
  actions: {
    async listar() {
      this.loading = true
      this.error = null
      try {
        this.itens = await api<Evento[]>('/admin/eventos')
      } catch (e: any) {
        this.error = e.message || 'Erro ao carregar eventos'
      } finally {
        this.loading = false
      }
    },
    
    async criar(payload: EventoCreate) {
      const created = await api<Evento>('/admin/eventos', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      this.itens.unshift(created)
      return created
    },
    
    async atualizar(id: string, payload: EventoUpdate) {
      const updated = await api<Evento>(`/admin/eventos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      const idx = this.itens.findIndex((e) => e.id === id)
      if (idx >= 0) this.itens[idx] = updated
      return updated
    },
    
    async remover(id: string) {
      await api<void>(`/admin/eventos/${id}`, { method: 'DELETE' })
      this.itens = this.itens.filter((e) => e.id !== id)
    },

    // Novos métodos para controle de check-in
    async toggleCheckIn(id: string, payload: CheckInToggleRequest): Promise<CheckInToggleResponse> {
      const response = await api<CheckInToggleResponse>(`/admin/eventos/${id}/checkin`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      
      // Atualizar o item na lista local
      const idx = this.itens.findIndex((e) => e.id === id)
      if (idx >= 0 && this.itens[idx]) {
        this.itens[idx].checkinAberto = payload.aberto
      }
      
      return response
    },

    async getCheckInStatus(): Promise<CheckInStatusResponse> {
      return await api<CheckInStatusResponse>('/admin/eventos/checkin-status')
    },
  },
})
