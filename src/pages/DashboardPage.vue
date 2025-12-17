<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useEventosStore } from '@/store/eventos'
import { usePedidosStore } from '@/store/pedidos'

const eventosStore = useEventosStore()
const pedidosStore = usePedidosStore()
const loading = ref(true)

const eventosAtivos = computed(() => 
  eventosStore.itens.filter(e => e.abertoParaVenda).length
)

const totalEventos = computed(() => eventosStore.itens.length)

const pedidosPagos = computed(() => 
  pedidosStore.itens.filter(p => p.status === 'PAID').length
)

const receitaTotal = computed(() => 
  pedidosStore.itens
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.valorTotal, 0)
)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const proximosEventos = computed(() => {
  const agora = new Date()
  return eventosStore.itens
    .filter(e => new Date(e.dataEvento) > agora && e.abertoParaVenda)
    .sort((a, b) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime())
    .slice(0, 5)
})

const pedidosRecentes = computed(() => 
  [...pedidosStore.itens]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
)

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      eventosStore.listar(),
      pedidosStore.listar({ size: 100 })
    ])
  } finally {
    loading.value = false
  }
})

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

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-AO', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-semibold mb-1">Dashboard</h1>
      <p class="text-xs sm:text-sm text-[var(--color-text-secondary)]">
        Visão geral do sistema ArenaTicket
      </p>
    </div>

    <!-- Métricas Principais -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="card animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div class="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xs sm:text-sm text-blue-100 mb-1">Total de Eventos</div>
            <div class="text-2xl sm:text-3xl font-bold">{{ totalEventos }}</div>
            <div class="text-[10px] sm:text-xs text-blue-100 mt-2">{{ eventosAtivos }} ativos</div>
          </div>
          <div class="p-2 sm:p-3 bg-white/20 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xs sm:text-sm text-green-100 mb-1">Bilhetes Vendidos</div>
            <div class="text-2xl sm:text-3xl font-bold">{{ pedidosPagos }}</div>
            <div class="text-[10px] sm:text-xs text-green-100 mt-2">Pedidos confirmados</div>
          </div>
          <div class="p-2 sm:p-3 bg-white/20 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xs sm:text-sm text-purple-100 mb-1">Receita Total</div>
            <div class="text-xl sm:text-2xl font-bold">{{ formatCurrency(receitaTotal) }}</div>
            <div class="text-[10px] sm:text-xs text-purple-100 mt-2">Em vendas</div>
          </div>
          <div class="p-2 sm:p-3 bg-white/20 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xs sm:text-sm text-orange-100 mb-1">Próximos Eventos</div>
            <div class="text-2xl sm:text-3xl font-bold">{{ proximosEventos.length }}</div>
            <div class="text-[10px] sm:text-xs text-orange-100 mt-2">Aguardando realização</div>
          </div>
          <div class="p-2 sm:p-3 bg-white/20 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos e Listas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <!-- Próximos Eventos -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base sm:text-lg font-semibold">Próximos Eventos</h2>
          <router-link to="/eventos" class="text-xs sm:text-sm text-[var(--color-cyan)] hover:underline">
            Ver todos
          </router-link>
        </div>
        <div v-if="proximosEventos.length === 0" class="text-center py-8 text-[var(--color-text-secondary)]">
          <p class="text-xs sm:text-sm">Nenhum evento próximo</p>
        </div>
        <div v-else class="space-y-3">
          <div 
            v-for="evento in proximosEventos" 
            :key="evento.id"
            class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex-1">
              <div class="font-medium text-xs sm:text-sm">{{ evento.titulo }}</div>
              <div class="text-[10px] sm:text-xs text-[var(--color-text-secondary)] mt-1">
                {{ formatDate(evento.dataEvento) }} • {{ evento.local }}
              </div>
            </div>
            <router-link 
              :to="`/eventos/${evento.id}/lotes`"
              class="text-xs px-3 py-1.5 bg-[var(--color-cyan)] text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Lotes
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pedidos Recentes -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base sm:text-lg font-semibold">Pedidos Recentes</h2>
          <router-link to="/pedidos" class="text-xs sm:text-sm text-[var(--color-cyan)] hover:underline">
            Ver todos
          </router-link>
        </div>
        <div v-if="pedidosRecentes.length === 0" class="text-center py-8 text-[var(--color-text-secondary)]">
          <p class="text-xs sm:text-sm">Nenhum pedido registrado</p>
        </div>
        <div v-else class="space-y-3">
          <div 
            v-for="pedido in pedidosRecentes" 
            :key="pedido.id"
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
          >
            <div class="flex-1">
              <div class="font-medium text-xs sm:text-sm">{{ pedido.compradorNome }}</div>
              <div class="text-[10px] sm:text-xs text-[var(--color-text-secondary)] mt-1">
                {{ formatDate(pedido.createdAt) }}
              </div>
            </div>
            <div class="text-left sm:text-right">
              <div class="font-semibold text-xs sm:text-sm">{{ formatCurrency(pedido.valorTotal) }}</div>
              <div :class="getStatusColor(pedido.status)" class="text-xs font-medium mt-1">
                {{ getStatusLabel(pedido.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
