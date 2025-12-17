<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useVendasStore } from '@/store/vendas'
import { useAuthStore } from '@/store/auth'
import BilheteImpressao from '@/components/BilheteImpressao.vue'
import type { Evento, LoteBilhete, MetodoPagamento } from '@/types/evento'

const vendasStore = useVendasStore()
const authStore = useAuthStore()

// Estado do formulário
const eventoSelecionado = ref<Evento | null>(null)
const loteSelecionado = ref<LoteBilhete | null>(null)
const compradorNome = ref('')
const compradorTelefone = ref('')
const quantidade = ref(1)
const metodoPagamento = ref<MetodoPagamento>('CASH')
const pontoVenda = ref('BILHETERIA_1')

// Listas
const eventos = ref<Evento[]>([])
const lotes = ref<LoteBilhete[]>([])

// UI State
const mostrarModalImpressao = ref(false)
const processandoVenda = ref(false)

// Computed
const valorUnitario = computed(() => loteSelecionado.value?.preco || 0)
const valorTotal = computed(() => valorUnitario.value * quantidade.value)
const quantidadeMaxima = computed(() => loteSelecionado.value?.quantidadeDisponivel || 1)

const podeVender = computed(() => {
  return (
    eventoSelecionado.value &&
    loteSelecionado.value &&
    compradorNome.value.trim().length > 0 &&
    compradorTelefone.value.trim().length >= 9 &&
    quantidade.value > 0 &&
    quantidade.value <= quantidadeMaxima.value
  )
})

// Métodos
async function carregarEventos() {
  eventos.value = await vendasStore.listarEventosDisponiveis()
}

async function carregarLotes() {
  if (eventoSelecionado.value) {
    lotes.value = await vendasStore.listarLotesDisponiveis(eventoSelecionado.value.id)
    loteSelecionado.value = null // Resetar lote ao trocar evento
  }
}

function incrementarQuantidade() {
  if (quantidade.value < quantidadeMaxima.value) {
    quantidade.value++
  }
}

function decrementarQuantidade() {
  if (quantidade.value > 1) {
    quantidade.value--
  }
}

function formatarTelefone(valor: string) {
  // Remove caracteres não numéricos
  let numeros = valor.replace(/\D/g, '')
  
  // Adiciona +244 se não tiver
  if (!numeros.startsWith('244')) {
    numeros = '244' + numeros
  }
  
  // Formata: +244 900 000 000
  const formatted = numeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{3})$/, '+$1 $2 $3 $4')
  compradorTelefone.value = formatted
}

async function realizarVenda() {
  if (!podeVender.value || !eventoSelecionado.value || !loteSelecionado.value) return
  
  processandoVenda.value = true
  
  try {
    await vendasStore.realizarVenda({
      eventoId: eventoSelecionado.value.id,
      loteId: loteSelecionado.value.id,
      quantidade: quantidade.value,
      compradorNome: compradorNome.value.trim(),
      compradorTelefone: compradorTelefone.value.trim(),
      metodoPagamento: metodoPagamento.value as 'CASH' | 'TPA',
      vendedorId: authStore.user?.id || '', // ID do vendedor autenticado
      pontoVenda: pontoVenda.value
    })
    
    // Mostrar modal de impressão
    mostrarModalImpressao.value = true
  } catch (error: any) {
    // Exibir erro formatado do store
    alert(vendasStore.error || 'Erro ao realizar venda')
  } finally {
    processandoVenda.value = false
  }
}

function fecharModalELimpar() {
  mostrarModalImpressao.value = false
  
  // Limpar formulário
  compradorNome.value = ''
  compradorTelefone.value = ''
  quantidade.value = 1
  
  // Recarregar lotes (estoque pode ter mudado)
  carregarLotes()
  
  // Limpar última venda do store
  vendasStore.limparUltimaVenda()
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('pt-AO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function imprimirBilhetes() {
  // Usa o window.print() do navegador
  // O CSS @media print do BilheteImpressao.vue cuidará do layout de impressão
  window.print()
}

// Watchers
watch(eventoSelecionado, () => {
  carregarLotes()
})

// Lifecycle
onMounted(() => {
  carregarEventos()
  vendasStore.buscarEstatisticasHoje()
})
</script>

<template>
  <div class="vendas-container">
    <!-- Header com estatísticas -->
    <header class="vendas-header">
      <div class="vendedor-info">
        <div class="vendedor-nome">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{{ authStore.userName }}</span>
          <span class="badge">{{ authStore.userRole }}</span>
        </div>
        <div class="ponto-venda">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <select v-model="pontoVenda" class="ponto-select">
            <option value="BILHETERIA_1">Bilheteria 1</option>
            <option value="BILHETERIA_2">Bilheteria 2</option>
            <option value="BILHETERIA_3">Bilheteria 3</option>
            <option value="MOVEL">Ponto Móvel</option>
          </select>
        </div>
      </div>
      <div class="estatisticas">
        <div class="stat">
          <div class="stat-label">Vendas Hoje</div>
          <div class="stat-value">{{ vendasStore.vendasHoje }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Total Hoje</div>
          <div class="stat-value">{{ formatCurrency(vendasStore.totalHoje) }}</div>
        </div>
      </div>
    </header>

    <!-- Grid principal: 2 colunas -->
    <div class="vendas-grid">
      <!-- Coluna 1: Seleção de Evento e Lote -->
      <div class="card selecao-card">
        <h2 class="card-title">Seleção de Evento e Lote</h2>
        
        <!-- Seleção de Evento -->
        <div class="form-group">
          <label for="evento" class="form-label">Evento</label>
          <select 
            id="evento" 
            v-model="eventoSelecionado" 
            class="form-select"
            :disabled="vendasStore.loading"
          >
            <option :value="null">Selecione um evento...</option>
            <option v-for="evento in eventos" :key="evento.id" :value="evento">
              {{ evento.titulo }} - {{ formatDate(evento.dataEvento) }}
            </option>
          </select>
        </div>

        <!-- Detalhes do Evento -->
        <div v-if="eventoSelecionado" class="evento-detalhes">
          <div class="detalhe-item">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>{{ eventoSelecionado.local }}</span>
          </div>
          <div class="detalhe-item">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formatDate(eventoSelecionado.dataEvento) }}</span>
          </div>
        </div>

        <!-- Seleção de Lote -->
        <div v-if="eventoSelecionado" class="form-group">
          <label for="lote" class="form-label">Lote / Setor</label>
          <select 
            id="lote" 
            v-model="loteSelecionado" 
            class="form-select"
            :disabled="vendasStore.loading || lotes.length === 0"
          >
            <option :value="null">Selecione um lote...</option>
            <option v-for="lote in lotes" :key="lote.id" :value="lote">
              {{ lote.nome }} - {{ formatCurrency(lote.preco) }} ({{ lote.quantidadeDisponivel }} disponíveis)
            </option>
          </select>
          <div v-if="lotes.length === 0 && !vendasStore.loading" class="text-warning">
            Nenhum lote disponível para este evento
          </div>
        </div>

        <!-- Informações do Lote -->
        <div v-if="loteSelecionado" class="lote-info">
          <div class="info-row">
            <span class="info-label">Preço Unitário:</span>
            <span class="info-value preço">{{ formatCurrency(valorUnitario) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Disponível:</span>
            <span class="info-value">{{ loteSelecionado.quantidadeDisponivel }} bilhetes</span>
          </div>
        </div>
      </div>

      <!-- Coluna 2: Resumo do Pedido -->
      <div class="card pedido-card">
        <h2 class="card-title">Dados do Comprador</h2>
        
        <!-- Nome do Comprador -->
        <div class="form-group">
          <label for="nome" class="form-label">Nome Completo *</label>
          <input 
            id="nome"
            v-model="compradorNome"
            type="text"
            class="form-input"
            placeholder="Ex: João Silva"
            :disabled="!loteSelecionado"
          />
        </div>

        <!-- Telefone -->
        <div class="form-group">
          <label for="telefone" class="form-label">Telefone *</label>
          <input 
            id="telefone"
            v-model="compradorTelefone"
            type="tel"
            class="form-input"
            placeholder="+244 900 000 000"
            :disabled="!loteSelecionado"
            @blur="formatarTelefone(compradorTelefone)"
          />
        </div>

        <!-- Quantidade -->
        <div class="form-group">
          <label class="form-label">Quantidade</label>
          <div class="quantidade-control">
            <button 
              class="btn-quantidade"
              :disabled="quantidade <= 1"
              @click="decrementarQuantidade"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <div class="quantidade-display">{{ quantidade }}</div>
            <button 
              class="btn-quantidade"
              :disabled="quantidade >= quantidadeMaxima"
              @click="incrementarQuantidade"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Método de Pagamento -->
        <div class="form-group">
          <label class="form-label">Método de Pagamento</label>
          <div class="metodo-pagamento">
            <label class="radio-option">
              <input type="radio" v-model="metodoPagamento" value="CASH" />
              <div class="radio-content">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Dinheiro</span>
              </div>
            </label>
            <label class="radio-option">
              <input type="radio" v-model="metodoPagamento" value="TPA" />
              <div class="radio-content">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>TPA (Cartão)</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Resumo de Valores -->
        <div class="resumo-valores">
          <div class="valor-row">
            <span>Valor Unitário:</span>
            <span>{{ formatCurrency(valorUnitario) }}</span>
          </div>
          <div class="valor-row">
            <span>Quantidade:</span>
            <span>{{ quantidade }}x</span>
          </div>
          <div class="valor-row total">
            <span>TOTAL:</span>
            <span>{{ formatCurrency(valorTotal) }}</span>
          </div>
        </div>

        <!-- Botão de Vender -->
        <button 
          class="btn-vender"
          :disabled="!podeVender || processandoVenda"
          @click="realizarVenda"
        >
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span v-if="!processandoVenda">VENDER E IMPRIMIR</span>
          <span v-else>PROCESSANDO...</span>
        </button>

        <!-- Mensagem de erro -->
        <div v-if="vendasStore.error" class="error-message">
          {{ vendasStore.error }}
        </div>
      </div>
    </div>

    <!-- Modal de Impressão -->
    <div v-if="mostrarModalImpressao && vendasStore.ultimaVenda" class="modal-overlay" @click.self="fecharModalELimpar">
      <div class="modal-content">
        <div class="modal-header">
          <h3>✅ Venda Realizada com Sucesso!</h3>
          <button class="btn-close" @click="fecharModalELimpar">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-info">
            <strong>{{ vendasStore.ultimaVenda.bilhetes.length }}</strong> bilhete(s) gerado(s)
          </p>
          <p class="modal-info">
            Total: <strong>{{ formatCurrency(vendasStore.ultimaVenda.total) }}</strong>
          </p>
          
          <!-- Preview dos bilhetes para impressão -->
          <div class="preview-area">
            <BilheteImpressao :bilhetes="vendasStore.ultimaVenda.bilhetes" />
          </div>
          
          <!-- Botão de imprimir -->
          <button class="btn-imprimir" @click="imprimirBilhetes">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            IMPRIMIR BILHETES
          </button>
        </div>
        <div class="modal-footer">
          <button class="btn-continuar" @click="fecharModalELimpar">
            Continuar Vendendo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vendas-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 1rem;
}

/* Header com Estatísticas */
.vendas-header {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.vendedor-info {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.vendedor-nome {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.badge {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.ponto-venda {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ponto-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.ponto-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.estatisticas {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: right;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
}

/* Grid Principal */
.vendas-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .vendas-grid {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

/* Form Elements */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.95rem;
}

.form-select,
.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  min-height: 48px; /* Touch-friendly */
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select:disabled,
.form-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

/* Evento/Lote Detalhes */
.evento-detalhes,
.lote-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.detalhe-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #4b5563;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.info-label {
  color: #6b7280;
}

.info-value {
  font-weight: 600;
  color: #1f2937;
}

.info-value.preço {
  color: #10b981;
  font-size: 1.1rem;
}

/* Quantidade Control */
.quantidade-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  padding: 1rem 0;
}

.btn-quantidade {
  width: 48px;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-quantidade:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #3b82f6;
}

.btn-quantidade:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-quantidade svg {
  width: 24px;
  height: 24px;
}

.quantidade-display {
  font-size: 2rem;
  font-weight: 700;
  min-width: 4rem;
  text-align: center;
  color: #1f2937;
}

/* Método de Pagamento */
.metodo-pagamento {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.radio-option {
  position: relative;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.radio-content {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  min-height: 80px;
  justify-content: center;
}

.radio-option input[type="radio"]:checked + .radio-content {
  border-color: #3b82f6;
  background: #eff6ff;
}

.radio-content svg {
  width: 32px;
  height: 32px;
  color: #6b7280;
}

.radio-option input[type="radio"]:checked + .radio-content svg {
  color: #3b82f6;
}

.radio-content span {
  font-weight: 600;
  font-size: 0.95rem;
}

/* Resumo de Valores */
.resumo-valores {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
}

.valor-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.valor-row.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
}

/* Botão Vender */
.btn-vender {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-vender:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-vender:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-vender svg {
  width: 28px;
  height: 28px;
}

/* Error Message */
.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.95rem;
}

.text-warning {
  color: #f59e0b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #9ca3af;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 2rem 1.5rem;
}

.modal-info {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #4b5563;
}

.preview-area {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  padding: 1rem;
  margin: 1.5rem 0;
}

/* Esconder preview na impressão, mostrar apenas BilheteImpressao */
@media print {
  .modal-overlay,
  .modal-content {
    position: static !important;
    background: none !important;
    box-shadow: none !important;
  }
  
  .modal-header,
  .modal-footer,
  .modal-info,
  .btn-imprimir,
  .vendas-header,
  .vendas-body,
  .preview-area {
    display: none !important;
  }
}

.btn-imprimir {
  width: 100%;
  padding: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  transition: all 0.2s;
}

.btn-imprimir:hover {
  background: #2563eb;
}

.btn-imprimir svg {
  width: 24px;
  height: 24px;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-continuar {
  width: 100%;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
}

.btn-continuar:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

/* Icons */
.icon {
  width: 20px;
  height: 20px;
}
</style>
