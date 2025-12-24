import { defineStore } from 'pinia'
import { api } from '@/utils/api'
import type { Bilhete } from '@/types/evento'

interface CheckInResponse {
  bilhete?: Bilhete
  mensagem: string
}

interface State {
  bilhete: Bilhete | null
  loading: boolean
  error: string | null
  ultimosCheckIns: Bilhete[]
}

export const useCheckInStore = defineStore('checkin', {
  state: (): State => ({
    bilhete: null,
    loading: false,
    error: null,
    ultimosCheckIns: [],
  }),
  actions: {
    async validarBilhete(codigo: string, eventoId?: string) {
      this.loading = true
      this.error = null
      this.bilhete = null
      
      try {
        const payload: any = { codigoTicket: codigo }
        if (eventoId) {
          payload.eventoId = eventoId
        }
        
        const response = await api<CheckInResponse>(`/porteiro/checkin`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        
        if (response.bilhete) {
          this.bilhete = response.bilhete
          // Adicionar aos últimos check-ins
          this.ultimosCheckIns.unshift(response.bilhete)
          if (this.ultimosCheckIns.length > 10) {
            this.ultimosCheckIns.pop()
          }
        } else {
          this.error = response.mensagem || 'Bilhete inválido'
        }
        
        return response
      } catch (e: any) {
        this.error = e.message || 'Erro ao validar bilhete'
        throw e
      } finally {
        this.loading = false
      }
    },

    /**
     * Consultar bilhete por código (GET público) - APENAS VISUALIZAÇÃO
     * Não faz check-in, apenas retorna informações do bilhete
     */
    async consultarBilhete(codigo: string) {
      this.loading = true
      this.error = null
      try {
        const bilhete = await api<Bilhete>(`/public/bilhete/${codigo}`, {
          method: 'GET',
        })
        return bilhete
      } catch (e: any) {
        this.error = e.message || 'Erro ao consultar bilhete'
        return null
      } finally {
        this.loading = false
      }
    },
    
    async confirmarCheckIn(bilheteId: string) {
      try {
        const response = await api<CheckInResponse>(`/admin/checkin/${bilheteId}/confirmar`, {
          method: 'POST',
        })
        
        if (response.bilhete) {
          // Atualizar bilhete na lista de últimos check-ins
          const idx = this.ultimosCheckIns.findIndex((b) => b.id === bilheteId)
          if (idx >= 0) {
            this.ultimosCheckIns[idx] = response.bilhete
          }
        }
        
        return response
      } catch (e: any) {
        throw e
      }
    },
    
    limparBilhete() {
      this.bilhete = null
      this.error = null
    },
  },
})
