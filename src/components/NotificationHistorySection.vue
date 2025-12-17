<script setup lang="ts">
import { ref } from 'vue'
import type { Notification } from '@/types/notification'

interface Props {
  notifications: Notification[]
  onResend: () => void
  isResending?: boolean
}

defineProps<Props>()

const expanded = ref(false)

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Africa/Luanda'
    }).format(date)
  } catch {
    return dateString
  }
}

function formatDestinario(destinatario: string) {
  return destinatario
}
</script>

<template>
  <div class="border rounded-lg overflow-hidden bg-white shadow-sm">
    <!-- Header -->
    <div
      class="bg-gradient-to-r from-blue-50 to-blue-100 border-b px-4 py-3 flex items-center justify-between cursor-pointer hover:from-blue-100 hover:to-blue-150 transition-colors"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900">📱 Histórico de Notificações</h3>
        <span
          v-if="notifications.length > 0"
          class="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full"
        >
          {{ notifications.length }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click.stop="onResend"
          :disabled="isResending"
          class="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all text-sm font-semibold flex items-center gap-2"
        >
          <svg v-if="!isResending" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ isResending ? 'Reenviando...' : 'Reenviar' }}</span>
        </button>
        <svg
          :class="[
            'w-5 h-5 text-blue-600 transform transition-transform',
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
    <div v-if="expanded" class="divide-y">
      <div v-if="notifications.length === 0" class="p-6 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Nenhuma notificação registrada
      </div>

      <div v-else class="space-y-0">
        <div v-for="(notification, index) in notifications" :key="notification.id" class="p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0">
          <!-- Timeline visual -->
          <div class="flex gap-4">
            <!-- Timeline dot -->
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all',
                  notification.status === 'SUCCESS'
                    ? 'bg-green-500'
                    : notification.status === 'FAILED'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                ]"
              >
                <span v-if="notification.status === 'SUCCESS'">✓</span>
                <span v-else-if="notification.status === 'FAILED'">✕</span>
                <span v-else>⏱</span>
              </div>
              <div
                v-if="index < notifications.length - 1"
                :class="[
                  'w-0.5 flex-1 mt-2 mb-2',
                  notification.status === 'SUCCESS' ? 'bg-green-300' : 'bg-red-300'
                ]"
              ></div>
            </div>

            <!-- Conteúdo -->
            <div class="flex-1 min-w-0">
              <!-- Header com status e data -->
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-semibold text-gray-900">
                    <span v-if="notification.status === 'SUCCESS'" class="text-green-600">SMS enviado com sucesso</span>
                    <span v-else-if="notification.status === 'FAILED'" class="text-red-600">Falha ao enviar SMS</span>
                    <span v-else class="text-amber-600">Envio pendente</span>
                  </p>
                </div>
                <div class="text-right flex-shrink-0 ml-2">
                  <p class="text-xs text-gray-600 font-medium">{{ formatDate(notification.dataTentativa) }}</p>
                </div>
              </div>

              <!-- Detalhes -->
              <div class="space-y-1 text-sm text-gray-700">
                <p class="text-gray-600">
                  <span class="font-semibold">Tentativa:</span> #{{ notification.tentativa }}
                </p>
                <p class="text-gray-600">
                  <span class="font-semibold">Destinatário:</span> {{ formatDestinario(notification.destinatario) }}
                </p>

                <!-- Motivo da falha (se houver) -->
                <p v-if="notification.motivo" class="text-red-700 font-medium mt-2 p-2 bg-red-50 rounded border border-red-200">
                  ⚠️ Motivo: {{ notification.motivo }}
                </p>

                <!-- Info de admin que solicitou resend -->
                <p v-if="notification.usuarioId" class="text-blue-700 text-xs mt-2 p-1.5 bg-blue-50 rounded border border-blue-200">
                  🔄 Reenviado por administrador
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
