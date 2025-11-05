import { defineStore } from 'pinia'
import { api } from '@/utils/api'
import type { Evento, EventoCreate } from '@/types/evento'

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
        // fallback para público se /admin/eventos não estiver disponível ainda
        if (String(e.message || '').includes('404') || String(e.message || '').includes('Not Found')) {
          try {
            this.itens = await api<Evento[]>('/public/eventos')
          } catch (e2: any) {
            this.error = e2.message || 'Erro ao carregar eventos'
          }
        } else {
          this.error = e.message || 'Erro ao carregar eventos'
        }
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
    async atualizar(id: string, payload: Partial<EventoCreate>) {
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
  },
})
