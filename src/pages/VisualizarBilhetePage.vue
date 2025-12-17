<template>
  <div class="space-y-4 sm:space-y-6">
    <header>
      <h1 class="text-xl sm:text-2xl font-bold">Visualização de Bilhete</h1>
      <p class="text-xs sm:text-sm text-gray-600">Consulte os detalhes completos de um bilhete pelo código</p>
    </header>

    <div class="card space-y-4">
      <form @submit.prevent="onBuscar" class="flex flex-col gap-3 md:flex-row md:items-end">
        <div class="flex-1">
          <label class="text-xs font-medium text-gray-600">Código do Bilhete</label>
          <input v-model="codigo" type="text" required placeholder="EX: ATK-ABC123XYZ" class="input w-full" />
        </div>
        <button :disabled="loading" class="btn-primary w-full md:w-40">
          <span v-if="!loading">Buscar</span>
          <span v-else>Buscando...</span>
        </button>
      </form>

      <div v-if="error" class="p-3 rounded bg-red-50 text-red-700 text-xs sm:text-sm">{{ error }}</div>

      <div v-if="bilhete" class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        <!-- Dados principais -->
        <div class="md:col-span-7 space-y-4">
          <h2 class="text-base sm:text-lg font-semibold">Informações do Bilhete</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-xs text-gray-500">Código</div>
              <div class="font-mono font-semibold text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span class="break-all">{{ bilhete.codigoTicketCompact }}</span>
                <button @click="copiar(bilhete.codigoTicketCompact)" class="text-xs text-blue-600 hover:underline whitespace-nowrap">Copiar</button>
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Status</div>
              <div :class="statusClass(bilhete.status)" class="px-2 py-1 rounded text-xs font-semibold inline-block">{{ statusLabel(bilhete.status) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Comprador</div>
              <div class="font-medium text-xs sm:text-sm">{{ bilhete.compradorNome }}</div>
              <div class="text-xs text-gray-600">{{ bilhete.compradorTelefone }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Venda</div>
              <div class="text-xs sm:text-sm">{{ formatDate(bilhete.vendidoEm) }}</div>
            </div>
            <div v-if="bilhete.utilizadoEm">
              <div class="text-xs text-gray-500">Utilizado Em</div>
              <div class="text-xs sm:text-sm">{{ formatDate(bilhete.utilizadoEm) }}</div>
            </div>
          </div>
          <div class="text-xs text-gray-400">ID interno: {{ bilhete.id }}</div>
        </div>

        <!-- QR Code -->
        <div class="md:col-span-5 space-y-4">
          <h2 class="text-base sm:text-lg font-semibold">QR Code</h2>
          <div class="border rounded p-4 flex items-center justify-center bg-white">
            <img v-if="bilhete.codigoQR" :src="bilhete.codigoQR" alt="QR Code" class="w-40 h-40 sm:w-56 sm:h-56 object-contain" />
            <div v-else class="text-xs sm:text-sm text-gray-500">QR Code não disponível</div>
          </div>
          <button @click="limpar" class="btn-secondary w-full">Limpar</button>
        </div>
      </div>

      <div v-if="!bilhete && !loading && !error" class="text-xs text-gray-500">
        Informe o código completo ou compacto do bilhete para visualizar.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCheckInStore } from '@/store/checkin'
import type { Bilhete } from '@/types/evento'
import { useRoute, useRouter } from 'vue-router'

const store = useCheckInStore()
const route = useRoute()
const router = useRouter()

const codigo = ref<string>((route.params.codigo as string) || '')
const bilhete = ref<Bilhete | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

/**
 * Extrai o código do bilhete de uma URL ou retorna o texto original
 */
function extrairCodigoDoBilhete(texto: string): string {
  const textoTrimmed = texto.trim()
  
  try {
    const match = textoTrimmed.match(/\/bilhetes?\/([A-Z0-9]+)/i)
    if (match && match[1]) {
      return match[1].toUpperCase()
    }
    
    const url = new URL(textoTrimmed)
    const pathParts = url.pathname.split('/').filter(p => p.length > 0)
    const ultimoSegmento = pathParts[pathParts.length - 1]
    if (ultimoSegmento && /^[A-Z0-9]+$/i.test(ultimoSegmento)) {
      return ultimoSegmento.toUpperCase()
    }
  } catch (e) {
    // Não é URL
  }
  
  return textoTrimmed.toUpperCase()
}

async function onBuscar() {
  if (!codigo.value.trim()) return
  loading.value = true
  error.value = null
  bilhete.value = null
  
  // Extrair código do bilhete (caso seja URL do QR Code)
  const codigoExtraido = extrairCodigoDoBilhete(codigo.value)
  console.log('Código original:', codigo.value)
  console.log('Código extraído:', codigoExtraido)
  
  // Usar GET público para CONSULTA (não faz check-in)
  const resultado = await store.consultarBilhete(codigoExtraido)
  if (resultado) {
    bilhete.value = resultado
    router.replace({ params: { codigo: codigoExtraido } })
  } else {
    error.value = store.error
  }
  loading.value = false
}

function limpar() {
  bilhete.value = null
  error.value = null
  codigo.value = ''
  router.replace({ params: { codigo: undefined } })
}

function copiar(texto: string) {
  navigator.clipboard.writeText(texto)
}

function formatDate(d: string | null | undefined) {
  if (!d) return '-'
  try {
    const date = new Date(d)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

function statusLabel(s: Bilhete['status']) {
  switch (s) {
    case 'VALID': return 'Válido'
    case 'USED': return 'Utilizado'
    case 'CANCELLED': return 'Cancelado'
    case 'EXPIRED': return 'Expirado'
    default: return s
  }
}
function statusClass(s: Bilhete['status']) {
  switch (s) {
    case 'VALID': return 'bg-green-100 text-green-700'
    case 'USED': return 'bg-blue-100 text-blue-700'
    case 'CANCELLED': return 'bg-red-100 text-red-700'
    case 'EXPIRED': return 'bg-gray-200 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

if (codigo.value) {
  onBuscar()
}
</script>

<style scoped>
.card { @apply bg-white rounded-lg shadow-sm border border-gray-200 p-5; }
.input { @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500; }
.btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50; }
.btn-secondary { @apply bg-gray-100 text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-200; }
</style>
