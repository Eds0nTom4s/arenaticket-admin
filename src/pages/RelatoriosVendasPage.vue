<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// import { api } from '@/utils/api' // TODO: Usar quando endpoint estiver pronto

interface VendaRelatorio {
  pedidoId: string
  eventoTitulo: string
  eventoId: string
  quantidade: number
  valorTotal: number
  metodoPagamento: string
  vendedorNome: string
  vendedorId: string
  pontoVenda: string
  criadoEm: string
  status: string
}

interface EstatisticasVendas {
  receitaTotal: number
  quantidadeVendas: number
  quantidadeBilhetes: number
  ticketMedio: number
}

interface ReceitaPorEvento {
  eventoId: string
  eventoTitulo: string
  receita: number
  quantidade: number
}

interface ReceitaPorMetodo {
  metodoPagamento: string
  receita: number
  quantidade: number
  percentual: number
}

interface PerformanceVendedor {
  vendedorId: string
  vendedorNome: string
  quantidadeVendas: number
  receitaTotal: number
  quantidadeBilhetes: number
  pontoVenda: string
}

const loading = ref(false)
const vendas = ref<VendaRelatorio[]>([])
const estatisticas = ref<EstatisticasVendas>({
  receitaTotal: 0,
  quantidadeVendas: 0,
  quantidadeBilhetes: 0,
  ticketMedio: 0
})

// Filtros
const dataInicio = ref('')
const dataFim = ref('')
const eventoFiltro = ref('')
const metodoPagamentoFiltro = ref('')

// Computed
const receitaPorEvento = computed(() => {
  const map = new Map<string, ReceitaPorEvento>()
  
  vendas.value.forEach(venda => {
    const key = venda.eventoId
    if (map.has(key)) {
      const item = map.get(key)!
      item.receita += venda.valorTotal
      item.quantidade += venda.quantidade
    } else {
      map.set(key, {
        eventoId: venda.eventoId,
        eventoTitulo: venda.eventoTitulo,
        receita: venda.valorTotal,
        quantidade: venda.quantidade
      })
    }
  })
  
  return Array.from(map.values()).sort((a, b) => b.receita - a.receita)
})

const receitaPorMetodo = computed(() => {
  const map = new Map<string, ReceitaPorMetodo>()
  const total = vendas.value.reduce((sum, v) => sum + v.valorTotal, 0)
  
  vendas.value.forEach(venda => {
    const key = venda.metodoPagamento
    if (map.has(key)) {
      const item = map.get(key)!
      item.receita += venda.valorTotal
      item.quantidade += 1
    } else {
      map.set(key, {
        metodoPagamento: venda.metodoPagamento,
        receita: venda.valorTotal,
        quantidade: 1,
        percentual: 0
      })
    }
  })
  
  const result = Array.from(map.values())
  result.forEach(item => {
    item.percentual = total > 0 ? (item.receita / total) * 100 : 0
  })
  
  return result.sort((a, b) => b.receita - a.receita)
})

const performanceVendedores = computed(() => {
  const map = new Map<string, PerformanceVendedor>()
  
  vendas.value.forEach(venda => {
    const key = venda.vendedorId
    if (map.has(key)) {
      const item = map.get(key)!
      item.quantidadeVendas += 1
      item.receitaTotal += venda.valorTotal
      item.quantidadeBilhetes += venda.quantidade
    } else {
      map.set(key, {
        vendedorId: venda.vendedorId,
        vendedorNome: venda.vendedorNome,
        quantidadeVendas: 1,
        receitaTotal: venda.valorTotal,
        quantidadeBilhetes: venda.quantidade,
        pontoVenda: venda.pontoVenda
      })
    }
  })
  
  return Array.from(map.values()).sort((a, b) => b.receitaTotal - a.receitaTotal)
})

const eventosDisponiveis = computed(() => {
  const eventos = new Map<string, string>()
  vendas.value.forEach(v => {
    eventos.set(v.eventoId, v.eventoTitulo)
  })
  return Array.from(eventos.entries()).map(([id, titulo]) => ({ id, titulo }))
})

async function carregarVendas() {
  loading.value = true
  try {
    // TODO: Ajustar endpoint quando backend estiver pronto
    // const params = new URLSearchParams()
    // if (dataInicio.value) params.append('dataInicio', dataInicio.value)
    // if (dataFim.value) params.append('dataFim', dataFim.value)
    // const data = await api<VendaRelatorio[]>(`/admin/vendas/relatorio?${params}`)
    
    // Mock data para desenvolvimento
    const data: VendaRelatorio[] = []
    vendas.value = data
    calcularEstatisticas()
  } catch (error) {
    console.error('Erro ao carregar vendas:', error)
    alert('Erro ao carregar relatório de vendas')
  } finally {
    loading.value = false
  }
}

function calcularEstatisticas() {
  const total = vendas.value.reduce((sum, v) => sum + v.valorTotal, 0)
  const quantidade = vendas.value.length
  const bilhetes = vendas.value.reduce((sum, v) => sum + v.quantidade, 0)
  
  estatisticas.value = {
    receitaTotal: total,
    quantidadeVendas: quantidade,
    quantidadeBilhetes: bilhetes,
    ticketMedio: quantidade > 0 ? total / quantidade : 0
  }
}

function limparFiltros() {
  dataInicio.value = ''
  dataFim.value = ''
  eventoFiltro.value = ''
  metodoPagamentoFiltro.value = ''
  carregarVendas()
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function getMetodoPagamentoLabel(metodo: string) {
  const labels: Record<string, string> = {
    'CASH': '💵 Dinheiro',
    'TPA': '💳 TPA (Cartão)',
    'MULTICAIXA_EXPRESS': '📱 Multicaixa Express',
    'REFERENCIA_ATM': '🏦 Referência ATM'
  }
  return labels[metodo] || metodo
}

onMounted(() => {
  // Definir período padrão: últimos 30 dias
  const hoje = new Date()
  const trintaDiasAtras = new Date(hoje)
  trintaDiasAtras.setDate(hoje.getDate() - 30)
  
  dataInicio.value = trintaDiasAtras.toISOString().split('T')[0]!
  dataFim.value = hoje.toISOString().split('T')[0]!
  
  carregarVendas()
})
</script>

<template>
  <div class="relatorios-container">
    <header class="page-header">
      <h1 class="page-title">📊 Relatórios de Vendas</h1>
      <p class="page-subtitle">Análise completa de vendas presenciais e online</p>
    </header>

    <!-- Filtros -->
    <div class="filtros-card">
      <h3 class="filtros-titulo">Filtros</h3>
      <div class="filtros-grid">
        <div class="form-group">
          <label>Data Início</label>
          <input type="date" v-model="dataInicio" class="form-input" />
        </div>
        <div class="form-group">
          <label>Data Fim</label>
          <input type="date" v-model="dataFim" class="form-input" />
        </div>
        <div class="form-group">
          <label>Evento</label>
          <select v-model="eventoFiltro" class="form-select">
            <option value="">Todos os eventos</option>
            <option v-for="evento in eventosDisponiveis" :key="evento.id" :value="evento.id">
              {{ evento.titulo }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Método de Pagamento</label>
          <select v-model="metodoPagamentoFiltro" class="form-select">
            <option value="">Todos os métodos</option>
            <option value="CASH">💵 Dinheiro</option>
            <option value="TPA">💳 TPA (Cartão)</option>
            <option value="MULTICAIXA_EXPRESS">📱 Multicaixa Express</option>
            <option value="REFERENCIA_ATM">🏦 Referência ATM</option>
          </select>
        </div>
      </div>
      <div class="filtros-acoes">
        <button class="btn-filtrar" @click="carregarVendas" :disabled="loading">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {{ loading ? 'Carregando...' : 'Aplicar Filtros' }}
        </button>
        <button class="btn-limpar" @click="limparFiltros">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpar
        </button>
      </div>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="estatisticas-grid">
      <div class="stat-card receita">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-label">Receita Total</div>
          <div class="stat-value">{{ formatCurrency(estatisticas.receitaTotal) }}</div>
        </div>
      </div>
      <div class="stat-card vendas">
        <div class="stat-icon">🛒</div>
        <div class="stat-content">
          <div class="stat-label">Total de Vendas</div>
          <div class="stat-value">{{ estatisticas.quantidadeVendas }}</div>
        </div>
      </div>
      <div class="stat-card bilhetes">
        <div class="stat-icon">🎫</div>
        <div class="stat-content">
          <div class="stat-label">Bilhetes Vendidos</div>
          <div class="stat-value">{{ estatisticas.quantidadeBilhetes }}</div>
        </div>
      </div>
      <div class="stat-card ticket-medio">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-label">Ticket Médio</div>
          <div class="stat-value">{{ formatCurrency(estatisticas.ticketMedio) }}</div>
        </div>
      </div>
    </div>

    <!-- Grid de Tabelas -->
    <div class="tabelas-grid">
      <!-- Receita por Evento -->
      <div class="tabela-card">
        <h3 class="tabela-titulo">🎪 Receita por Evento</h3>
        <div class="tabela-wrapper">
          <table class="tabela">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Bilhetes</th>
                <th>Receita</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in receitaPorEvento" :key="item.eventoId">
                <td class="evento-nome">{{ item.eventoTitulo }}</td>
                <td class="centro">{{ item.quantidade }}</td>
                <td class="receita-valor">{{ formatCurrency(item.receita) }}</td>
              </tr>
              <tr v-if="receitaPorEvento.length === 0">
                <td colspan="3" class="vazio">Nenhuma venda encontrada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Receita por Método de Pagamento -->
      <div class="tabela-card">
        <h3 class="tabela-titulo">💳 Receita por Método de Pagamento</h3>
        <div class="tabela-wrapper">
          <table class="tabela">
            <thead>
              <tr>
                <th>Método</th>
                <th>Vendas</th>
                <th>%</th>
                <th>Receita</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in receitaPorMetodo" :key="item.metodoPagamento">
                <td>{{ getMetodoPagamentoLabel(item.metodoPagamento) }}</td>
                <td class="centro">{{ item.quantidade }}</td>
                <td class="centro">{{ item.percentual.toFixed(1) }}%</td>
                <td class="receita-valor">{{ formatCurrency(item.receita) }}</td>
              </tr>
              <tr v-if="receitaPorMetodo.length === 0">
                <td colspan="4" class="vazio">Nenhuma venda encontrada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Performance de Vendedores -->
      <div class="tabela-card tabela-full">
        <h3 class="tabela-titulo">👥 Performance de Vendedores</h3>
        <div class="tabela-wrapper">
          <table class="tabela">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Ponto de Venda</th>
                <th>Vendas</th>
                <th>Bilhetes</th>
                <th>Receita Total</th>
                <th>Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vendedor in performanceVendedores" :key="vendedor.vendedorId">
                <td class="vendedor-nome">{{ vendedor.vendedorNome }}</td>
                <td>{{ vendedor.pontoVenda }}</td>
                <td class="centro">{{ vendedor.quantidadeVendas }}</td>
                <td class="centro">{{ vendedor.quantidadeBilhetes }}</td>
                <td class="receita-valor">{{ formatCurrency(vendedor.receitaTotal) }}</td>
                <td class="receita-valor">
                  {{ formatCurrency(vendedor.receitaTotal / vendedor.quantidadeVendas) }}
                </td>
              </tr>
              <tr v-if="performanceVendedores.length === 0">
                <td colspan="6" class="vazio">Nenhuma venda encontrada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Carregando dados...</p>
    </div>
  </div>
</template>

<style scoped>
.relatorios-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

/* Filtros */
.filtros-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.filtros-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filtros-acoes {
  display: flex;
  gap: 1rem;
}

.btn-filtrar,
.btn-limpar {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: none;
  font-size: 0.95rem;
}

.btn-filtrar {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-filtrar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-filtrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-limpar {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.btn-limpar:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.icon {
  width: 20px;
  height: 20px;
}

/* Estatísticas */
.estatisticas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-left: 4px solid;
}

.stat-card.receita {
  border-left-color: #10b981;
}

.stat-card.vendas {
  border-left-color: #3b82f6;
}

.stat-card.bilhetes {
  border-left-color: #f59e0b;
}

.stat-card.ticket-medio {
  border-left-color: #8b5cf6;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

/* Tabelas */
.tabelas-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.tabela-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.tabela-card.tabela-full {
  grid-column: 1 / -1;
}

.tabela-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.tabela-wrapper {
  overflow-x: auto;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
}

.tabela thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.tabela th {
  padding: 0.875rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tabela td {
  padding: 1rem 0.875rem;
  font-size: 0.95rem;
  color: #4b5563;
  border-bottom: 1px solid #f3f4f6;
}

.tabela tbody tr:hover {
  background: #f9fafb;
}

.evento-nome,
.vendedor-nome {
  font-weight: 600;
  color: #1f2937;
}

.receita-valor {
  font-weight: 700;
  color: #10b981;
  text-align: right;
}

.centro {
  text-align: center;
}

.vazio {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 2rem !important;
}

/* Loading */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .tabelas-grid {
    grid-template-columns: 1fr;
  }
  
  .estatisticas-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .estatisticas-grid {
    grid-template-columns: 1fr;
  }
  
  .filtros-grid {
    grid-template-columns: 1fr;
  }
  
  .filtros-acoes {
    flex-direction: column;
  }
}
</style>
