import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/utils/api'
import type { Evento, LoteBilhete, VendaPresencialPayload, VendaPresencialResponse } from '@/types/evento'

export const useVendasStore = defineStore('vendas', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const ultimaVenda = ref<VendaPresencialResponse | null>(null)
  const vendasHoje = ref(0)
  const totalHoje = ref(0)

  /**
   * Listar eventos disponíveis para venda (apenas eventos abertos)
   */
  async function listarEventosDisponiveis() {
    loading.value = true
    error.value = null
    try {
      const eventos = await api<Evento[]>('/admin/eventos')
      // Filtrar apenas eventos abertos para venda
      return eventos.filter(e => e.abertoParaVenda)
    } catch (e: any) {
      error.value = e.message || 'Erro ao carregar eventos'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Listar lotes disponíveis de um evento específico
   */
  async function listarLotesDisponiveis(eventoId: string) {
    loading.value = true
    error.value = null
    try {
      const lotes = await api<LoteBilhete[]>(`/admin/lotes?eventoId=${eventoId}`)
      // Filtrar apenas lotes com estoque disponível e dentro do período de venda
      const agora = new Date()
      return lotes.filter(lote => {
        const inicioVenda = new Date(lote.inicioVenda)
        const fimVenda = new Date(lote.fimVenda)
        return lote.quantidadeDisponivel > 0 && agora >= inicioVenda && agora <= fimVenda
      })
    } catch (e: any) {
      error.value = e.message || 'Erro ao carregar lotes'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Realizar venda presencial
   * Endpoint: POST /api/v1/vendas/pedidos
   * Conforme IMPLEMENTACAO_VENDEDOR_RESUMO.txt
   */
  async function realizarVenda(payload: VendaPresencialPayload) {
    loading.value = true
    error.value = null
    try {
      // Integração real com backend
      const response = await api<VendaPresencialResponse>('/vendas/pedidos', { 
        method: 'POST',
        body: JSON.stringify(payload)
      })
      
      ultimaVenda.value = response
      vendasHoje.value++
      totalHoje.value += response.total
      
      return response
    } catch (e: any) {
      // Tratamento de erros conforme documentação backend
      if (e.status === 400) {
        error.value = 'Dados inválidos. Verifique o formulário.'
      } else if (e.status === 401) {
        error.value = 'Sessão expirada. Faça login novamente.'
      } else if (e.status === 403) {
        error.value = 'Você não tem permissão para realizar vendas.'
      } else if (e.status === 404) {
        error.value = 'Evento, lote ou vendedor não encontrado.'
      } else if (e.status === 409) {
        error.value = 'Bilhetes insuficientes ou lote fora do período de venda.'
      } else {
        error.value = e.message || 'Erro ao realizar venda. Tente novamente.'
      }
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar estatísticas do vendedor (vendas do dia)
   * Endpoint: GET /api/v1/vendedor/estatisticas (quando backend estiver pronto)
   */
  async function buscarEstatisticasHoje() {
    try {
      // TODO: Implementar quando backend estiver pronto
      // const stats = await api<{ vendas: number, total: number }>('/vendedor/estatisticas')
      // vendasHoje.value = stats.vendas
      // totalHoje.value = stats.total
    } catch (e: any) {
      console.error('Erro ao buscar estatísticas:', e)
    }
  }

  /**
   * Limpar última venda (para preparar para próxima venda)
   */
  function limparUltimaVenda() {
    ultimaVenda.value = null
    error.value = null
  }

  return {
    loading,
    error,
    ultimaVenda,
    vendasHoje,
    totalHoje,
    listarEventosDisponiveis,
    listarLotesDisponiveis,
    realizarVenda,
    buscarEstatisticasHoje,
    limparUltimaVenda
  }
})
