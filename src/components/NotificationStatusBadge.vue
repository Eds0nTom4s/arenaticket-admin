<script setup lang="ts">
import type { NotificationStatus } from '@/types/notification'

interface Props {
  status: NotificationStatus
  failureCount?: number
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  failureCount: 0,
  compact: false
})

const getStatusIcon = (status: NotificationStatus) => {
  switch (status) {
    case 'SUCCESS':
      return '✓'
    case 'FAILED':
      return '✕'
    case 'PENDING':
      return '⏱'
  }
}

const getStatusText = (status: NotificationStatus) => {
  switch (status) {
    case 'SUCCESS':
      return 'Entregue'
    case 'FAILED':
      return 'Falha'
    case 'PENDING':
      return 'Pendente'
  }
}

const getStatusClass = (status: NotificationStatus, failureCount: number = 0) => {
  // Múltiplas falhas - destaque vermelho piscante
  if (status === 'FAILED' && failureCount >= 2) {
    return 'bg-red-600 text-white border-red-800 animate-pulse'
  }

  switch (status) {
    case 'SUCCESS':
      return 'bg-green-500 text-white border-green-600'
    case 'FAILED':
      return 'bg-red-500 text-white border-red-600'
    case 'PENDING':
      return 'bg-amber-500 text-white border-amber-600'
  }
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold border text-xs transition-all',
      getStatusClass(status, failureCount)
    ]"
  >
    <span class="text-lg">{{ getStatusIcon(status) }}</span>
    <span v-if="!compact">{{ getStatusText(status) }}</span>
    <span v-if="failureCount >= 2 && !compact" class="ml-1 font-bold">({{ failureCount }})</span>
  </span>
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

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
