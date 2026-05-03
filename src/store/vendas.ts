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
   * Endpoint: GET /api/v1/eventos/disponiveis
   * Requer: Authorization header com token de VENDEDOR
   */
  async function listarEventosDisponiveis() {
    loading.value = true
    error.value = null
    try {
      console.log('🎪 Buscando eventos em /eventos/disponiveis...')
      const eventos = await api<Evento[]>('/eventos/disponiveis')
      console.log('✅ Eventos recebidos:', eventos.length)
      console.log('📋 Eventos:', eventos)
      
      // Filtrar apenas eventos abertos para venda
      const eventosAbertos = eventos.filter(e => {
        console.log(`📊 Evento "${e.titulo}": abertoParaVenda = ${e.abertoParaVenda}`)
        return e.abertoParaVenda
      })
      
      console.log('✅ Eventos abertos para venda:', eventosAbertos.length)
      return eventosAbertos
    } catch (e: any) {
      console.error('❌ Erro ao carregar eventos:', e)
      error.value = e.message || 'Erro ao carregar eventos'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Listar lotes disponíveis de um evento específico
   * Endpoint: GET /api/v1/lotes/evento/{eventoId}
   * Retorna apenas lotes ativos e disponíveis
   */
  async function listarLotesDisponiveis(eventoId: string) {
    loading.value = true
    error.value = null
    try {
      console.log('🎫 Buscando lotes do evento:', eventoId)
      
      // Buscar lotes diretamente
      const lotes = await api<LoteBilhete[]>(`/lotes/evento/${eventoId}`)
      console.log('✅ Lotes recebidos do backend:', lotes.length || 0)
      
      // Backend já retorna apenas lotes disponíveis (estoque > 0 e período válido)
      // Adicionar log de debug para cada lote
      lotes.forEach(lote => {
        console.log(`📦 Lote: ${lote.nome} | Preço: ${lote.preco} Kz | Disponível: ${lote.quantidadeDisponivel}`)
      })
      
      return lotes
    } catch (e: any) {
      console.error('❌ Erro ao carregar lotes:', e)
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
      // Preparar payload removendo campos nulos/vazios para vendas anônimas
      const payloadLimpo: any = {
        eventoId: payload.eventoId,
        loteId: payload.loteId,
        quantidade: payload.quantidade,
        metodoPagamento: payload.metodoPagamento,
        vendedorId: payload.vendedorId
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (payload.compradorNome && payload.compradorNome.trim()) {
        payloadLimpo.compradorNome = payload.compradorNome.trim()
      }
      if (payload.compradorTelefone && payload.compradorTelefone.trim()) {
        payloadLimpo.compradorTelefone = payload.compradorTelefone.trim()
      }
      if (payload.pontoVenda) {
        payloadLimpo.pontoVenda = payload.pontoVenda
      }

      console.log('📤 Enviando payload:', payloadLimpo)

      // Integração real com backend
      const response = await api<VendaPresencialResponse>('/vendas/pedidos', { 
        method: 'POST',
        body: JSON.stringify(payloadLimpo)
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
