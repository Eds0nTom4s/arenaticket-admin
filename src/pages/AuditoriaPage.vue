<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuditoriaStore } from '@/store/auditoria'

const store = useAuditoriaStore()
const currentPage = ref(0)
const pageSize = ref(50)
const searchTerm = ref('')
const acaoFilter = ref('')
const entidadeFilter = ref('')
const showFilters = ref(false)

const acaoOptions = [
  { value: '', label: 'Todas' },
  { value: 'CREATE', label: 'Criação' },
  { value: 'UPDATE', label: 'Atualização' },
  { value: 'DELETE', label: 'Exclusão' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'VIEW', label: 'Visualização' },
]

const entidadeOptions = [
  { value: '', label: 'Todas' },
  { value: 'EVENTO', label: 'Eventos' },
  { value: 'LOTE', label: 'Lotes' },
  { value: 'PEDIDO', label: 'Pedidos' },
  { value: 'BILHETE', label: 'Bilhetes' },
  { value: 'USUARIO', label: 'Usuários' },
]

const filteredLogs = computed(() => {
  if (!searchTerm.value) return store.itens
  
  const term = searchTerm.value.toLowerCase()
  return store.itens.filter(log => 
    log.usuario.toLowerCase().includes(term) ||
    log.acao.toLowerCase().includes(term) ||
    log.entidade.toLowerCase().includes(term) ||
    log.detalhes.toLowerCase().includes(term)
  )
})

async function loadLogs() {
  await store.listar({
    acao: acaoFilter.value || undefined,
    entidade: entidadeFilter.value || undefined,
    page: currentPage.value,
    size: pageSize.value,
  })
}

function applyFilters() {
  currentPage.value = 0
  loadLogs()
}

function clearFilters() {
  acaoFilter.value = ''
  entidadeFilter.value = ''
  searchTerm.value = ''
  currentPage.value = 0
  loadLogs()
}

function nextPage() {
  if (currentPage.value < store.totalPages - 1) {
    currentPage.value++
    loadLogs()
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
    loadLogs()
  }
}

function getAcaoColor(acao: string) {
  switch (acao) {
    case 'CREATE': return 'text-green-600 bg-green-50'
    case 'UPDATE': return 'text-blue-600 bg-blue-50'
    case 'DELETE': return 'text-red-600 bg-red-50'
    case 'LOGIN': return 'text-purple-600 bg-purple-50'
    case 'LOGOUT': return 'text-gray-600 bg-gray-50'
    case 'VIEW': return 'text-cyan-600 bg-cyan-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

function getAcaoLabel(acao: string) {
  const option = acaoOptions.find(opt => opt.value === acao)
  return option ? option.label : acao
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('pt-AO', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => loadLogs())
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Auditoria e Logs do Sistema</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-1">
          Histórico de ações realizadas no sistema
        </p>
      </div>
      <button 
        class="btn-primary"
        @click="showFilters = !showFilters"
      >
        {{ showFilters ? 'Ocultar' : 'Mostrar' }} Filtros
      </button>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card bg-blue-50 border-blue-200">
        <div class="text-sm text-blue-600 mb-1">Total de Registros</div>
        <div class="text-2xl font-bold text-blue-700">{{ store.totalElements }}</div>
      </div>
      <div class="card bg-purple-50 border-purple-200">
        <div class="text-sm text-purple-600 mb-1">Página Atual</div>
        <div class="text-2xl font-bold text-purple-700">{{ currentPage + 1 }} / {{ store.totalPages || 1 }}</div>
      </div>
      <div class="card bg-green-50 border-green-200">
        <div class="text-sm text-green-600 mb-1">Registros por Página</div>
        <div class="text-2xl font-bold text-green-700">{{ pageSize }}</div>
      </div>
    </div>

    <!-- Painel de Filtros -->
    <div v-if="showFilters" class="card">
      <h3 class="font-semibold mb-3">Filtros Avançados</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm mb-1">Buscar</label>
          <input 
            v-model="searchTerm" 
            type="text" 
            class="input" 
            placeholder="Usuário, ação, entidade..."
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Tipo de Ação</label>
          <select v-model="acaoFilter" class="input">
            <option v-for="opt in acaoOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm mb-1">Entidade</label>
          <select v-model="entidadeFilter" class="input">
            <option v-for="opt in entidadeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-4">
        <button class="btn-primary" @click="applyFilters">Aplicar Filtros</button>
        <button class="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50" @click="clearFilters">
          Limpar Filtros
        </button>
      </div>
    </div>

    <div v-if="store.error" class="card bg-red-50 border-red-200 text-red-600">
      {{ store.error }}
    </div>

    <!-- Tabela de Logs -->
    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-[var(--color-text-secondary)] border-b border-gray-200">
            <th class="py-3 px-2">Data/Hora</th>
            <th class="py-3 px-2">Usuário</th>
            <th class="py-3 px-2">Ação</th>
            <th class="py-3 px-2">Entidade</th>
            <th class="py-3 px-2">Detalhes</th>
            <th class="py-3 px-2">IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-2 text-xs whitespace-nowrap">
              {{ formatDate(log.timestamp) }}
            </td>
            <td class="py-3 px-2">
              <div class="font-medium">{{ log.usuario }}</div>
              <div class="text-xs text-[var(--color-text-secondary)] font-mono">
                {{ log.usuarioId.slice(0, 8) }}
              </div>
            </td>
            <td class="py-3 px-2">
              <span :class="getAcaoColor(log.acao)" class="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                {{ getAcaoLabel(log.acao) }}
              </span>
            </td>
            <td class="py-3 px-2">
              <div class="font-medium">{{ log.entidade }}</div>
              <div v-if="log.entidadeId" class="text-xs text-[var(--color-text-secondary)] font-mono">
                {{ log.entidadeId.slice(0, 8) }}
              </div>
            </td>
            <td class="py-3 px-2 max-w-md">
              <div class="text-xs text-[var(--color-text-secondary)] truncate" :title="log.detalhes">
                {{ log.detalhes }}
              </div>
            </td>
            <td class="py-3 px-2 text-xs font-mono">
              {{ log.ipAddress }}
            </td>
          </tr>
          <tr v-if="!store.loading && filteredLogs.length === 0">
            <td colspan="6" class="py-12 text-center">
              <div class="text-[var(--color-text-secondary)]">
                <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-base">Nenhum registro de auditoria encontrado</p>
                <p class="text-sm mt-1">Os logs das ações do sistema aparecerão aqui</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="store.loading" class="text-sm text-[var(--color-text-secondary)] mt-4 text-center py-4">
        Carregando registros de auditoria...
      </div>
      
      <!-- Paginação -->
      <div v-if="store.totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t">
        <div class="text-sm text-[var(--color-text-secondary)]">
          Página {{ currentPage + 1 }} de {{ store.totalPages }} ({{ store.totalElements }} registros)
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
  </div>
</template>
