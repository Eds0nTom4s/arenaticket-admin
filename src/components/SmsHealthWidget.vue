<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { notificationService } from '@/utils/notificationService'
import type { SmsHealthStatus } from '@/types/notification'

const health = ref<SmsHealthStatus | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const expanded = ref(false)

const statusColor = computed(() => {
  if (!health.value) return 'gray'
  if (health.value.consecutiveFailures >= 5) return 'red'
  if (health.value.successRate < 95) return 'amber'
  return 'green'
})

const statusText = computed(() => {
  if (!health.value) return 'Verificando...'
  if (health.value.consecutiveFailures >= 5) return 'CRÍTICO'
  if (health.value.successRate < 95) return 'ALERTA'
  return 'OPERACIONAL'
})

const getHealthClass = () => {
  switch (statusColor.value) {
    case 'red':
      return 'from-red-50 to-red-100 border-red-200'
    case 'amber':
      return 'from-amber-50 to-amber-100 border-amber-200'
    case 'green':
      return 'from-green-50 to-green-100 border-green-200'
    default:
      return 'from-gray-50 to-gray-100 border-gray-200'
  }
}

const getBadgeClass = () => {
  switch (statusColor.value) {
    case 'red':
      return 'bg-red-600 text-white animate-pulse'
    case 'amber':
      return 'bg-amber-600 text-white'
    case 'green':
      return 'bg-green-600 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
}

async function fetchHealth() {
  loading.value = true
  error.value = null
  try {
    health.value = await notificationService.getSmsHealth()
  } catch (e: any) {
    error.value = 'Erro ao carregar saúde do SMS'
    console.error('Erro:', e)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Luanda'
    }).format(date)
  } catch {
    return dateString
  }
}

onMounted(() => {
  fetchHealth()
  // Recarregar a cada 1 minuto
  setInterval(fetchHealth, 60000)
})
</script>

<template>
  <div :class="['rounded-lg border-2 bg-gradient-to-br transition-all', getHealthClass()]">
    <!-- Header -->
    <div
      class="px-4 py-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-3">
        <div
          :class="[
            'w-3 h-3 rounded-full',
            statusColor === 'red' ? 'bg-red-600 animate-pulse' : statusColor === 'amber' ? 'bg-amber-600' : 'bg-green-600'
          ]"
        ></div>
        <h3 class="text-lg font-semibold text-gray-900">Saúde do Sistema SMS</h3>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="!loading" :class="['px-3 py-1 rounded-full text-sm font-bold text-white', getBadgeClass()]">
          {{ statusText }}
        </span>
        <svg
          :class="[
            'w-5 h-5 text-gray-600 transform transition-transform',
            expanded ? 'rotate-180' : ''
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div v-if="expanded" class="px-4 py-4 border-t divide-y">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-6">
        <svg class="w-8 h-8 animate-spin mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <p class="text-gray-600 mt-2">Carregando dados...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-6">
        <p class="text-red-600 font-semibold">{{ error }}</p>
        <button
          @click="fetchHealth"
          class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          Tentar novamente
        </button>
      </div>

      <!-- Health metrics -->
      <div v-else-if="health" class="space-y-4">
        <!-- Alerta crítico -->
        <div
          v-if="health.consecutiveFailures >= 5"
          class="p-4 bg-red-100 border-l-4 border-red-600 rounded"
        >
          <p class="text-red-800 font-bold">⚠️ ALERTA CRÍTICO</p>
          <p class="text-red-700 text-sm mt-1">{{ health.consecutiveFailures }} falhas consecutivas detectadas</p>
        </div>

        <!-- Taxa de sucesso -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Taxa de Sucesso</span>
            <span
              :class="[
                'text-lg font-bold',
                health.successRate >= 99 ? 'text-green-600' : health.successRate >= 95 ? 'text-amber-600' : 'text-red-600'
              ]"
            >
              {{ health.successRate.toFixed(2) }}%
            </span>
          </div>
          <div class="w-full bg-gray-300 rounded-full h-2">
            <div
              :class="[
                'h-2 rounded-full transition-all',
                health.successRate >= 99 ? 'bg-green-500' : health.successRate >= 95 ? 'bg-amber-500' : 'bg-red-500'
              ]"
              :style="{ width: health.successRate + '%' }"
            ></div>
          </div>
        </div>

        <!-- Grid de métricas -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white p-3 rounded border">
            <p class="text-xs text-gray-600">Sucessos</p>
            <p class="text-2xl font-bold text-green-600">{{ health.totalSuccess }}</p>
          </div>
          <div class="bg-white p-3 rounded border">
            <p class="text-xs text-gray-600">Falhas Totais</p>
            <p class="text-2xl font-bold text-red-600">{{ health.totalFailures }}</p>
          </div>
          <div class="bg-white p-3 rounded border">
            <p class="text-xs text-gray-600">Falhas Consecutivas</p>
            <p :class="['text-2xl font-bold', health.consecutiveFailures >= 5 ? 'text-red-600 animate-pulse' : 'text-amber-600']">
              {{ health.consecutiveFailures }}
            </p>
          </div>
          <div class="bg-white p-3 rounded border">
            <p class="text-xs text-gray-600">Taxa Global</p>
            <p class="text-2xl font-bold text-blue-600">{{ (health.totalSuccess + health.totalFailures) }}</p>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="space-y-2 pt-3 border-t">
          <div v-if="health.lastSuccessTimestamp" class="flex items-center justify-between text-sm">
            <span class="text-gray-600">✓ Último sucesso:</span>
            <span class="font-mono text-gray-800">{{ formatDate(health.lastSuccessTimestamp) }}</span>
          </div>
          <div v-if="health.lastFailureTimestamp" class="flex items-center justify-between text-sm">
            <span class="text-gray-600">✕ Última falha:</span>
            <span class="font-mono text-gray-800">{{ formatDate(health.lastFailureTimestamp) }}</span>
          </div>
          <div v-if="health.lastFailureReason" class="flex items-start gap-2 text-sm mt-2 p-2 bg-red-50 rounded">
            <span class="text-gray-600 flex-shrink-0">Motivo:</span>
            <span class="text-red-700 font-mono">{{ health.lastFailureReason }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
