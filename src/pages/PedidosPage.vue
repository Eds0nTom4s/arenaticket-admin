<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { usePedidosStore } from '@/store/pedidos'

const store = usePedidosStore()
const statusFilter = ref('')
const currentPage = ref(0)
const pageSize = ref(20)
const searchTerm = ref('')
const showModal = ref(false)
const selectedPedido = ref<any>(null)

const statusOptions = [
  { value: '', label: 'Todos', color: 'text-gray-600' },
  { value: 'PENDING', label: 'Pendentes', color: 'text-yellow-600' },
  { value: 'PAID', label: 'Pagos', color: 'text-green-600' },
  { value: 'CANCELLED', label: 'Cancelados', color: 'text-red-600' },
  { value: 'EXPIRED', label: 'Expirados', color: 'text-gray-600' },
]

const filteredPedidos = computed(() => {
  if (!searchTerm.value) return store.itens
  
  const term = searchTerm.value.toLowerCase()
  return store.itens.filter(p => 
    p.compradorNome.toLowerCase().includes(term) ||
    p.compradorTelefone.includes(term) ||
    p.clientRequestId?.toLowerCase().includes(term) ||
    p.id.toLowerCase().includes(term)
  )
})

async function loadPedidos() {
  await store.listar({
    status: statusFilter.value || undefined,
    page: currentPage.value,
    size: pageSize.value,
  })
}

function changeStatus(value: string) {
  statusFilter.value = value
  currentPage.value = 0
  loadPedidos()
}

function nextPage() {
  if (currentPage.value < store.totalPages - 1) {
    currentPage.value++
    loadPedidos()
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
    loadPedidos()
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PAID': return 'text-green-600 bg-green-50'
    case 'PENDING': return 'text-yellow-600 bg-yellow-50'
    case 'CANCELLED': return 'text-red-600 bg-red-50'
    case 'EXPIRED': return 'text-gray-600 bg-gray-50'
    default: return 'text-gray-500 bg-gray-50'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PAID': return 'Pago'
    case 'PENDING': return 'Pendente'
    case 'CANCELLED': return 'Cancelado'
    case 'EXPIRED': return 'Expirado'
    default: return status
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2
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

function formatMetodoPagamento(metodo?: string) {
  if (!metodo) return '-'
  switch (metodo) {
    case 'MULTICAIXA_EXPRESS': return 'Multicaixa Express'
    case 'MULTICAIXA': return 'Multicaixa'
    case 'EMIS': return 'EMIS'
    case 'CASH': return 'Dinheiro'
    case 'BANK_TRANSFER': return 'Transferência'
    default: return metodo
  }
}

async function viewDetails(pedido: any) {
  selectedPedido.value = pedido
  showModal.value = true
  
  // Buscar detalhes completos
  try {
    const detalhes = await store.buscarPorId(pedido.id)
    selectedPedido.value = detalhes
  } catch (error: any) {
    console.error('Erro ao buscar detalhes:', error)
    alert(error.message || 'Erro ao carregar detalhes do pedido')
  }
}

function closeModal() {
  showModal.value = false
  selectedPedido.value = null
}

async function cancelarPedido(pedidoId: string) {
  if (!confirm('Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.')) {
    return
  }
  
  try {
    await store.cancelar(pedidoId)
    alert('Pedido cancelado com sucesso!')
    
    // Atualizar modal se estiver aberto
    if (selectedPedido.value?.id === pedidoId) {
      selectedPedido.value.status = 'CANCELLED'
    }
    
    // Recarregar lista
    await loadPedidos()
  } catch (error: any) {
    alert(error.message || 'Erro ao cancelar pedido. Verifique se o pedido não está pago.')
  }
}

async function reenviarCodigos(pedidoId: string) {
  if (!confirm('Deseja reenviar os códigos dos bilhetes por SMS para o comprador?')) {
    return
  }
  
  try {
    const response = await store.reenviarCodigos(pedidoId)
    if (response.success) {
      alert('✅ Códigos reenviados com sucesso!')
    } else {
      alert(response.message || 'Erro ao reenviar códigos.')
    }
  } catch (error: any) {
    alert(error.message || 'Erro ao reenviar códigos. Verifique se o pedido está pago e tem telefone cadastrado.')
  }
}

const totalPedidos = computed(() => store.totalElements)
const totalReceita = computed(() => 
  store.itens.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.valorTotal, 0)
)
const pedidosPagos = computed(() => 
  store.itens.filter(p => p.status === 'PAID').length
)

onMounted(() => loadPedidos())
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Gestão de Pedidos</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-1">
          Acompanhe e gerencie todos os pedidos de bilhetes
        </p>
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card bg-blue-50 border-blue-200">
        <div class="text-sm text-blue-600 mb-1">Total de Pedidos</div>
        <div class="text-2xl font-bold text-blue-700">{{ totalPedidos }}</div>
      </div>
      <div class="card bg-green-50 border-green-200">
        <div class="text-sm text-green-600 mb-1">Pedidos Pagos</div>
        <div class="text-2xl font-bold text-green-700">{{ pedidosPagos }}</div>
      </div>
      <div class="card bg-purple-50 border-purple-200">
        <div class="text-sm text-purple-600 mb-1">Receita Total</div>
        <div class="text-2xl font-bold text-purple-700">{{ formatCurrency(totalReceita) }}</div>
      </div>
    </div>

    <!-- Filtros e Busca -->
    <div class="card">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input 
            v-model="searchTerm" 
            type="text" 
            class="input" 
            placeholder="Buscar por nome, telefone ou ID do pedido..."
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-[var(--color-text-secondary)] whitespace-nowrap">Status:</label>
          <select v-model="statusFilter" class="input w-auto" @change="changeStatus(statusFilter)">
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="store.error" class="card bg-red-50 border-red-200 text-red-600">
      {{ store.error }}
    </div>

    <!-- Tabela de Pedidos -->
    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-[var(--color-text-secondary)] border-b border-gray-200">
            <th class="py-3 px-2">ID / Ref</th>
            <th class="py-3 px-2">Comprador</th>
            <th class="py-3 px-2">Contato</th>
            <th class="py-3 px-2">Evento</th>
            <th class="py-3 px-2">Lote</th>
            <th class="py-3 px-2">Qtd</th>
            <th class="py-3 px-2">Total</th>
            <th class="py-3 px-2">Pagamento</th>
            <th class="py-3 px-2">Status</th>
            <th class="py-3 px-2">Data</th>
            <th class="py-3 px-2 w-32">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pedido in filteredPedidos" :key="pedido.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-2">
              <div class="font-mono text-xs">{{ pedido.clientRequestId || pedido.id.slice(0, 8) }}</div>
            </td>
            <td class="py-3 px-2">
              <div class="font-medium">{{ pedido.compradorNome }}</div>
            </td>
            <td class="py-3 px-2">
              <div class="text-xs">{{ pedido.compradorTelefone }}</div>
              <div v-if="pedido.compradorEmail" class="text-xs text-[var(--color-text-secondary)]">
                {{ pedido.compradorEmail }}
              </div>
            </td>
            <td class="py-3 px-2">
              <div class="font-medium text-xs">{{ pedido.eventoTitulo || '-' }}</div>
            </td>
            <td class="py-3 px-2">
              <div class="text-xs text-[var(--color-text-secondary)]">{{ pedido.loteNome || '-' }}</div>
            </td>
            <td class="py-3 px-2 text-center">
              <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {{ pedido.quantidade || '-' }}
              </span>
            </td>
            <td class="py-3 px-2 font-semibold">{{ formatCurrency(pedido.valorTotal) }}</td>
            <td class="py-3 px-2">
              <div class="text-xs">{{ formatMetodoPagamento(pedido.metodoPagamento) }}</div>
            </td>
            <td class="py-3 px-2">
              <span :class="getStatusColor(pedido.status)" class="px-2 py-1 rounded-full text-xs font-semibold">
                {{ getStatusLabel(pedido.status) }}
              </span>
            </td>
            <td class="py-3 px-2 text-xs">{{ formatDate(pedido.createdAt) }}</td>
            <td class="py-3 px-2">
              <button 
                class="text-[var(--color-cyan)] hover:underline text-xs font-medium"
                @click="viewDetails(pedido)"
              >
                Ver Detalhes
              </button>
            </td>
          </tr>
          <tr v-if="!store.loading && filteredPedidos.length === 0">
            <td colspan="11" class="py-12 text-center">
              <div class="text-[var(--color-text-secondary)]">
                <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-base">Nenhum pedido encontrado</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="store.loading" class="text-sm text-[var(--color-text-secondary)] mt-4 text-center py-4">
        Carregando pedidos...
      </div>
      
      <!-- Paginação -->
      <div v-if="store.totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t">
        <div class="text-sm text-[var(--color-text-secondary)]">
          Página {{ currentPage + 1 }} de {{ store.totalPages }} ({{ store.totalElements }} pedidos)
        </div>
        <div class="flex items-center gap-2">
          <button 
            class="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
            :disabled="currentPage === 0" 
            @click="prevPage"
          >
            ← Anterior
          </button>
          <button 
            class="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
            :disabled="currentPage >= store.totalPages - 1" 
            @click="nextPage"
          >
            Próxima →
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="showModal && selectedPedido" class="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50" @click.self="closeModal">
      <div class="w-full max-w-3xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Detalhes do Pedido</h2>
          <div class="flex items-center gap-2">
            <button
              v-if="selectedPedido.status === 'PAID'"
              @click="reenviarCodigos(selectedPedido.id)"
              class="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Reenviar Códigos
            </button>
            <button
              v-if="selectedPedido.status === 'PENDING'"
              @click="cancelarPedido(selectedPedido.id)"
              class="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Cancelar Pedido
            </button>
            <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="closeModal">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Informações do Pedido -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">ID do Pedido</div>
              <div class="font-mono text-sm">{{ selectedPedido.clientRequestId || selectedPedido.id }}</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">Status</div>
              <span :class="getStatusColor(selectedPedido.status)" class="px-3 py-1 rounded-full text-sm font-semibold inline-block">
                {{ getStatusLabel(selectedPedido.status) }}
              </span>
            </div>
            <div class="col-span-2">
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">Evento</div>
              <div class="text-base font-semibold">{{ selectedPedido.eventoTitulo || '-' }}</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">Lote</div>
              <div class="text-sm">{{ selectedPedido.loteNome || '-' }}</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">Método de Pagamento</div>
              <div class="text-sm font-medium">{{ formatMetodoPagamento(selectedPedido.metodoPagamento) }}</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">Valor Unitário</div>
              <div class="text-sm">{{ formatCurrency(selectedPedido.valorUnitario || 0) }}</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">Valor Total</div>
              <div class="text-lg font-bold text-[var(--color-primary)]">{{ formatCurrency(selectedPedido.valorTotal) }}</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">Quantidade</div>
              <div class="text-lg font-semibold">{{ selectedPedido.quantidade || '-' }} bilhete(s)</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">Criado em</div>
              <div class="text-sm">{{ formatDate(selectedPedido.createdAt) }}</div>
            </div>
            <div v-if="selectedPedido.paidAt">
              <div class="text-xs text-[var(--color-text-secondary)] mb-1">Pago em</div>
              <div class="text-sm">{{ formatDate(selectedPedido.paidAt) }}</div>
            </div>
          </div>

          <!-- Informações do Comprador -->
          <div class="border-t pt-4">
            <h3 class="font-semibold mb-3">Informações do Comprador</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-[var(--color-text-secondary)] mb-1">Nome</div>
                <div class="text-sm font-medium">{{ selectedPedido.compradorNome }}</div>
              </div>
              <div>
                <div class="text-xs text-[var(--color-text-secondary)] mb-1">Telefone</div>
                <div class="text-sm">{{ selectedPedido.compradorTelefone }}</div>
              </div>
              <div v-if="selectedPedido.compradorEmail" class="col-span-2">
                <div class="text-xs text-[var(--color-text-secondary)] mb-1">Email</div>
                <div class="text-sm">{{ selectedPedido.compradorEmail }}</div>
              </div>
              <div v-if="selectedPedido.numeroSocio">
                <div class="text-xs text-[var(--color-text-secondary)] mb-1">Número de Sócio</div>
                <div class="text-sm font-mono">{{ selectedPedido.numeroSocio }}</div>
              </div>
            </div>
          </div>

          <!-- Bilhetes (se disponível) -->
          <div v-if="selectedPedido.bilhetes && selectedPedido.bilhetes.length > 0" class="border-t pt-4">
            <h3 class="font-semibold mb-3">Bilhetes Gerados</h3>
            <div class="space-y-2">
              <div 
                v-for="bilhete in selectedPedido.bilhetes" 
                :key="bilhete.id"
                class="p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-mono text-sm font-medium">{{ bilhete.codigoTicket }}</div>
                    <div class="text-xs text-[var(--color-text-secondary)] mt-1">
                      {{ bilhete.evento }} • {{ bilhete.lote }}
                    </div>
                  </div>
                  <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {{ bilhete.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
          <button class="btn-primary w-full" @click="closeModal">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>
