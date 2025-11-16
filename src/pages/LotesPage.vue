<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventosStore } from '@/store/eventos'
import { useLotesStore } from '@/store/lotes'
import type { LoteBilhete, LoteCreate } from '@/types/evento'

const route = useRoute()
const router = useRouter()
const eventosStore = useEventosStore()
const lotesStore = useLotesStore()

const eventoId = computed(() => route.params.eventoId as string)
const evento = computed(() => eventosStore.itens.find((e) => e.id === eventoId.value))

const showForm = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)
const submitting = ref(false)

const form = reactive({
  nome: '',
  preco: 0,
  quantidadeTotal: 0,
  dataInicio: '',
  horaInicio: '',
  dataFim: '',
  horaFim: '',
})

function resetForm() {
  form.nome = ''
  form.preco = 0
  form.quantidadeTotal = 0
  form.dataInicio = ''
  form.horaInicio = ''
  form.dataFim = ''
  form.horaFim = ''
  currentId.value = null
  isEditing.value = false
}

// Converter data/hora para ISO 8601 com timezone de Angola (+01:00)
function toISO8601(data: string, hora: string): string {
  // data formato: dd/MM/yyyy
  // hora formato: HH:mm
  const [dia, mes, ano] = data.split('/')
  return `${ano}-${mes}-${dia}T${hora}:00+01:00`
}

// Converter ISO 8601 para formato europeu dd/MM/yyyy e hora HH:mm
function fromISO8601(isoString: string): { data: string; hora: string } {
  const date = new Date(isoString)
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const ano = date.getFullYear()
  const hora = String(date.getHours()).padStart(2, '0')
  const minuto = String(date.getMinutes()).padStart(2, '0')
  
  return {
    data: `${dia}/${mes}/${ano}`,
    hora: `${hora}:${minuto}`
  }
}

// Máscara para data dd/MM/yyyy
function maskDate(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '') // Remove não-dígitos
  
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  if (value.length >= 5) {
    value = value.slice(0, 5) + '/' + value.slice(5, 9)
  }
  
  input.value = value
  
  // Atualizar o modelo reativo
  const field = input.getAttribute('data-field')
  if (field === 'dataInicio') form.dataInicio = value
  if (field === 'dataFim') form.dataFim = value
}

async function submit() {
  submitting.value = true
  try {
    // Validar que fim é posterior ao início
    const inicioDate = toISO8601(form.dataInicio, form.horaInicio)
    const fimDate = toISO8601(form.dataFim, form.horaFim)
    
    if (new Date(fimDate) <= new Date(inicioDate)) {
      alert('A data/hora de fim deve ser posterior à data/hora de início')
      submitting.value = false
      return
    }

    const payload: LoteCreate = {
      nome: form.nome,
      preco: form.preco,
      quantidadeTotal: form.quantidadeTotal,
      inicioVenda: inicioDate,
      fimVenda: fimDate,
    }

    if (isEditing.value && currentId.value) {
      await lotesStore.atualizar(eventoId.value, currentId.value, payload)
    } else {
      await lotesStore.criar(eventoId.value, payload)
    }

    resetForm()
    showForm.value = false
  } catch (error: any) {
    alert(error.message || 'Erro ao salvar lote')
  } finally {
    submitting.value = false
  }
}

function newLote() {
  resetForm()
  showForm.value = true
}

function editLote(lote: LoteBilhete) {
  currentId.value = lote.id
  isEditing.value = true
  showForm.value = true
  form.nome = lote.nome
  form.preco = lote.preco
  form.quantidadeTotal = lote.quantidadeTotal
  
  const inicio = fromISO8601(lote.inicioVenda)
  const fim = fromISO8601(lote.fimVenda)
  
  form.dataInicio = inicio.data
  form.horaInicio = inicio.hora
  form.dataFim = fim.data
  form.horaFim = fim.hora
}

async function deleteLote(id: string) {
  if (!confirm('Remover este lote? Esta ação não pode ser desfeita.')) return
  try {
    await lotesStore.remover(eventoId.value, id)
  } catch (error: any) {
    alert(error.message || 'Erro ao remover lote')
  }
}

const sorted = computed(() =>
  [...lotesStore.itens].sort((a, b) => a.preco - b.preco)
)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(value)
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

function getStatusColor(lote: LoteBilhete) {
  const now = new Date()
  const inicio = new Date(lote.inicioVenda)
  const fim = new Date(lote.fimVenda)
  
  if (now < inicio) return 'text-gray-500'
  if (now > fim) return 'text-red-600'
  if (lote.quantidadeDisponivel === 0) return 'text-orange-600'
  return 'text-green-600'
}

function getStatusText(lote: LoteBilhete) {
  const now = new Date()
  const inicio = new Date(lote.inicioVenda)
  const fim = new Date(lote.fimVenda)
  
  if (now < inicio) return 'Aguardando'
  if (now > fim) return 'Encerrado'
  if (lote.quantidadeDisponivel === 0) return 'Esgotado'
  return 'Ativo'
}

onMounted(async () => {
  if (!eventosStore.itens.length) {
    await eventosStore.listar()
  }
  await lotesStore.listarPorEvento(eventoId.value)
})
</script>

<template>
  <div class="space-y-4">
    <!-- Breadcrumb e Header -->
    <div class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
      <button @click="router.push('/lotes')" class="hover:text-[var(--color-cyan)] transition-colors">
        Eventos
      </button>
      <span>/</span>
      <span class="text-[var(--color-text)]">Lotes</span>
    </div>

    <div class="card bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-cyan)] text-white">
      <div v-if="evento" class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-semibold mb-2">{{ evento.titulo }}</h1>
          <div class="flex items-center gap-4 text-sm text-white/90">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{{ evento.local }}</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatDate(evento.dataEvento) }}</span>
            </div>
          </div>
        </div>
        <button class="px-4 py-2 bg-white text-[var(--color-primary)] rounded-lg font-medium hover:bg-gray-100 transition-colors" @click="newLote">
          + Novo Lote
        </button>
      </div>
      <div v-else class="text-center py-4">
        <p>Carregando informações do evento...</p>
      </div>
    </div>

    <div v-if="lotesStore.error" class="card bg-red-50 border-red-200 text-red-600">
      {{ lotesStore.error }}
    </div>

    <!-- Tabela de Lotes -->
    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-[var(--color-text-secondary)] border-b border-gray-200">
            <th class="py-3 px-2">Nome do Lote</th>
            <th class="py-3 px-2">Preço</th>
            <th class="py-3 px-2">Total</th>
            <th class="py-3 px-2">Vendidos</th>
            <th class="py-3 px-2">Disponíveis</th>
            <th class="py-3 px-2">Início Venda</th>
            <th class="py-3 px-2">Fim Venda</th>
            <th class="py-3 px-2">Status</th>
            <th class="py-3 px-2 w-40">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lote in sorted" :key="lote.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-2">
              <div class="font-medium">{{ lote.nome }}</div>
            </td>
            <td class="py-3 px-2 font-semibold text-[var(--color-primary)]">
              {{ formatCurrency(lote.preco) }}
            </td>
            <td class="py-3 px-2">{{ lote.quantidadeTotal }}</td>
            <td class="py-3 px-2">
              <span class="text-blue-600 font-medium">{{ lote.quantidadeVendida }}</span>
            </td>
            <td class="py-3 px-2">
              <span :class="lote.quantidadeDisponivel > 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
                {{ lote.quantidadeDisponivel }}
              </span>
            </td>
            <td class="py-3 px-2 text-xs">{{ formatDate(lote.inicioVenda) }}</td>
            <td class="py-3 px-2 text-xs">{{ formatDate(lote.fimVenda) }}</td>
            <td class="py-3 px-2">
              <span :class="getStatusColor(lote)" class="text-xs font-semibold">
                {{ getStatusText(lote) }}
              </span>
            </td>
            <td class="py-3 px-2">
              <div class="flex items-center gap-2">
                <button class="text-[var(--color-cyan)] hover:underline text-xs font-medium" @click="editLote(lote)">
                  Editar
                </button>
                <button class="text-red-600 hover:underline text-xs font-medium" @click="deleteLote(lote.id)">
                  Remover
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!lotesStore.loading && sorted.length === 0">
            <td colspan="9" class="py-12 text-center">
              <div class="text-[var(--color-text-secondary)]">
                <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p class="text-base mb-2">Nenhum lote criado ainda</p>
                <p class="text-sm mb-4">Crie o primeiro lote de bilhetes para este evento</p>
                <button class="btn-primary" @click="newLote">Criar Primeiro Lote</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="lotesStore.loading" class="text-sm text-[var(--color-text-secondary)] mt-4 text-center py-4">
        Carregando lotes...
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showForm" class="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50" @click.self="showForm=false">
      <div class="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ isEditing ? 'Editar Lote' : 'Novo Lote de Bilhetes' }}</h2>
          <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="showForm=false">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form class="p-6 space-y-4" @submit.prevent="submit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium mb-2">Nome do Lote *</label>
              <input 
                v-model="form.nome" 
                type="text" 
                class="input" 
                placeholder="Ex: VIP, Geral, Pista, Camarote"
                required 
              />
              <p class="text-xs text-gray-500 mt-1">Identificação do tipo de bilhete</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Preço (Kz) *</label>
              <input 
                v-model.number="form.preco" 
                type="number" 
                min="0" 
                step="0.01"
                class="input" 
                placeholder="5000.00"
                required 
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Quantidade Total *</label>
              <input 
                v-model.number="form.quantidadeTotal" 
                type="number" 
                min="1"
                class="input" 
                placeholder="100"
                required 
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Início de Venda - Data *</label>
              <input 
                v-model="form.dataInicio" 
                type="text" 
                class="input" 
                placeholder="dd/MM/yyyy"
                maxlength="10"
                data-field="dataInicio"
                @input="maskDate"
                required 
              />
              <p class="text-xs text-gray-500 mt-1">Formato: dd/MM/yyyy (ex: 20/11/2025)</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Início de Venda - Hora *</label>
              <input 
                v-model="form.horaInicio" 
                type="time" 
                class="input" 
                required 
              />
              <p class="text-xs text-gray-500 mt-1">Formato: HH:mm (ex: 08:00)</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Fim de Venda - Data *</label>
              <input 
                v-model="form.dataFim" 
                type="text" 
                class="input" 
                placeholder="dd/MM/yyyy"
                maxlength="10"
                data-field="dataFim"
                @input="maskDate"
                required 
              />
              <p class="text-xs text-gray-500 mt-1">Formato: dd/MM/yyyy (ex: 15/12/2025)</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Fim de Venda - Hora *</label>
              <input 
                v-model="form.horaFim" 
                type="time" 
                class="input" 
                required 
              />
              <p class="text-xs text-gray-500 mt-1">Formato: HH:mm (ex: 23:59)</p>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <div class="flex gap-2">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="font-medium mb-1">Dicas:</p>
                <ul class="space-y-1 text-xs">
                  <li>• Use formato europeu: dd/MM/yyyy (ex: 20/11/2025)</li>
                  <li>• Configure datas de venda dentro do período do evento</li>
                  <li>• Use nomes claros para facilitar identificação pelos compradores</li>
                  <li>• A data/hora de fim deve ser posterior à de início</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              class="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" 
              @click="showForm=false"
            >
              Cancelar
            </button>
            <button 
              class="btn-primary px-6 py-2.5" 
              type="submit" 
              :disabled="submitting"
            >
              {{ submitting ? 'Salvando...' : (isEditing ? 'Atualizar Lote' : 'Criar Lote') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
