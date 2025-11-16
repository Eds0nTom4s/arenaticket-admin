<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { usePedidosStore } from '@/store/pedidos'

const store = usePedidosStore()
const statusFilter = ref('')
const currentPage = ref(0)
const pageSize = ref(20)

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'PAID', label: 'Pagos' },
  { value: 'CANCELLED', label: 'Cancelados' },
  { value: 'EXPIRED', label: 'Expirados' },
]

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
    case 'PAID': return 'text-green-600'
    case 'PENDING': return 'text-yellow-600'
    case 'CANCELLED': return 'text-red-600'
    case 'EXPIRED': return 'text-gray-600'
    default: return 'text-gray-500'
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

onMounted(() => loadPedidos())
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Pedidos</h1>
      <div class="flex items-center gap-2">
        <label class="text-sm text-[var(--color-text-secondary)]">Status:</label>
        <select v-model="statusFilter" class="input w-auto" @change="changeStatus(statusFilter)">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <div v-if="store.error" class="card bg-red-50 border-red-200 text-red-600">
      {{ store.error }}
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-[var(--color-text-secondary)]">
            <th class="py-2">ID</th>
            <th class="py-2">Comprador</th>
            <th class="py-2">Telefone</th>
            <th class="py-2">Evento</th>
            <th class="py-2">Qtd</th>
            <th class="py-2">Total (Kz)</th>
            <th class="py-2">Status</th>
            <th class="py-2">Criado em</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pedido in store.itens" :key="pedido.id" class="border-t border-gray-100">
            <td class="py-2 font-mono text-xs">{{ pedido.clientRequestId || pedido.id.slice(0, 8) }}</td>
            <td class="py-2">{{ pedido.compradorNome }}</td>
            <td class="py-2">{{ pedido.compradorTelefone }}</td>
            <td class="py-2">{{ pedido.evento || '-' }}</td>
            <td class="py-2">{{ pedido.quantidade || '-' }}</td>
            <td class="py-2 font-medium">{{ pedido.total.toFixed(2) }}</td>
            <td class="py-2">
              <span :class="getStatusColor(pedido.status)">{{ getStatusLabel(pedido.status) }}</span>
            </td>
            <td class="py-2 text-xs">{{ new Date(pedido.createdAt).toLocaleString('pt-AO') }}</td>
          </tr>
          <tr v-if="!store.loading && store.itens.length === 0">
            <td colspan="8" class="py-6 text-center text-[var(--color-text-secondary)]">Nenhum pedido encontrado</td>
          </tr>
        </tbody>
      </table>
      <div v-if="store.loading" class="text-sm text-[var(--color-text-secondary)] mt-2">Carregando...</div>
      
      <!-- Paginação -->
      <div v-if="store.totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t">
        <div class="text-sm text-[var(--color-text-secondary)]">
          Página {{ currentPage + 1 }} de {{ store.totalPages }} ({{ store.totalElements }} pedidos)
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1 text-sm border rounded hover:bg-gray-50" :disabled="currentPage === 0" @click="prevPage">
            Anterior
          </button>
          <button class="px-3 py-1 text-sm border rounded hover:bg-gray-50" 
            :disabled="currentPage >= store.totalPages - 1" @click="nextPage">
            Próxima
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
