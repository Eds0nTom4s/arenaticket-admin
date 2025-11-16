<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useEventosStore } from '@/store/eventos'
import { useRouter } from 'vue-router'

const store = useEventosStore()
const router = useRouter()

const sorted = computed(() =>
  [...store.itens]
    .filter(e => e.abertoParaVenda) // Mostrar apenas eventos abertos
    .sort((a, b) => (a.dataEvento > b.dataEvento ? 1 : -1))
)

function gerenciarLotes(eventoId: string) {
  router.push(`/eventos/${eventoId}/lotes`)
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

onMounted(() => {
  if (!store.itens.length) {
    store.listar()
  }
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Gerenciar Lotes de Bilhetes</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-1">
          Selecione um evento para gerenciar seus lotes de bilhetes
        </p>
      </div>
    </div>

    <div v-if="store.error" class="card bg-red-50 border-red-200 text-red-600">
      {{ store.error }}
    </div>

    <div v-if="store.loading" class="card">
      <div class="text-sm text-[var(--color-text-secondary)]">Carregando eventos...</div>
    </div>

    <div v-else-if="sorted.length === 0" class="card text-center py-12">
      <div class="text-[var(--color-text-secondary)] mb-4">
        <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-base">Nenhum evento disponível</p>
        <p class="text-sm mt-1">Crie eventos na página de Eventos primeiro</p>
      </div>
      <button class="btn-primary" @click="$router.push('/eventos')">
        Ir para Eventos
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="evento in sorted"
        :key="evento.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer group"
        @click="gerenciarLotes(evento.id)"
      >
        <div class="relative">
          <div 
            v-if="evento.bannerUrl" 
            class="w-full h-40 bg-cover bg-center rounded-lg mb-3"
            :style="{ backgroundImage: `url(${evento.bannerUrl})` }"
          >
            <div class="w-full h-full bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
          </div>
          <div v-else class="w-full h-40 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-cyan)] rounded-lg mb-3 flex items-center justify-center">
            <svg class="w-16 h-16 text-white/30" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v8h12V6H4z"/>
              <path d="M6 8a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h3a1 1 0 110 2H7a1 1 0 01-1-1z"/>
            </svg>
          </div>
        </div>

        <h3 class="font-semibold text-lg mb-2 group-hover:text-[var(--color-cyan)] transition-colors">
          {{ evento.titulo }}
        </h3>
        
        <div class="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ evento.local }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formatDate(evento.dataEvento) }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ evento.duracaoMinutos }} minutos</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span class="text-xs text-[var(--color-text-secondary)]">
            Status: <span class="text-green-600 font-medium">Aberto</span>
          </span>
          <svg class="w-5 h-5 text-[var(--color-cyan)] group-hover:translate-x-1 transition-transform" 
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
