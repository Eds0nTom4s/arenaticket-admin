<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useEventosStore } from '@/store/eventos'
import { uploadBanner } from '@/utils/upload'
import type { Evento, EventoCreate } from '@/types/evento'

const store = useEventosStore()
const showForm = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)
const uploading = ref(false)
const bannerFile = ref<File | null>(null)

const form = reactive({
  titulo: '',
  descricao: '',
  local: '',
  dataEvento: '',
  duracaoMinutos: 90,
  bannerUrl: '',
  abertoParaVenda: true,
})

function resetForm() {
  form.titulo = ''
  form.descricao = ''
  form.local = ''
  form.dataEvento = ''
  form.duracaoMinutos = 90
  form.bannerUrl = ''
  form.abertoParaVenda = true
  bannerFile.value = null
  currentId.value = null
  isEditing.value = false
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    bannerFile.value = target.files[0]
  }
}

async function submit() {
  try {
    // Upload do banner se foi selecionado
    if (bannerFile.value) {
      uploading.value = true
      form.bannerUrl = await uploadBanner(bannerFile.value)
    }

    const payload: EventoCreate = {
      titulo: form.titulo,
      descricao: form.descricao,
      local: form.local,
      dataEvento: form.dataEvento,
      duracaoMinutos: form.duracaoMinutos || 90,
      bannerUrl: form.bannerUrl || undefined,
      abertoParaVenda: form.abertoParaVenda,
    }

    if (isEditing.value && currentId.value) {
      await store.atualizar(currentId.value, payload)
    } else {
      await store.criar(payload)
    }
    
    resetForm()
    showForm.value = false
  } catch (error: any) {
    alert(error.message || 'Erro ao salvar evento')
  } finally {
    uploading.value = false
  }
}

function newEvento() {
  resetForm()
  showForm.value = true
}

function editEvento(e: Evento) {
  currentId.value = e.id
  isEditing.value = true
  showForm.value = true
  form.titulo = e.titulo
  form.descricao = e.descricao
  form.local = e.local
  form.dataEvento = e.dataEvento.slice(0, 16)
  form.duracaoMinutos = e.duracaoMinutos
  form.bannerUrl = e.bannerUrl || ''
  form.abertoParaVenda = e.abertoParaVenda
}

async function deleteEvento(id: string) {
  if (!confirm('Remover este evento?')) return
  try {
    await store.remover(id)
  } catch (error: any) {
    alert(error.message || 'Erro ao remover evento')
  }
}

const sorted = computed(() =>
  [...store.itens].sort((a, b) => (a.dataEvento > b.dataEvento ? -1 : 1))
)

onMounted(() => store.listar())
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Eventos</h1>
      <button class="btn-primary w-full sm:w-auto" @click="newEvento">Novo Evento</button>
    </div>

    <div v-if="store.error" class="card bg-red-50 border-red-200 text-red-600">
      {{ store.error }}
    </div>

    <!-- Tabela responsiva -->
    <div class="card overflow-x-auto">
      <div class="min-w-[800px]">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-[var(--color-text-secondary)]">
              <th class="py-2 px-2">Título</th>
              <th class="py-2 px-2">Local</th>
              <th class="py-2 px-2">Data do Evento</th>
              <th class="py-2 px-2">Duração</th>
              <th class="py-2 px-2">Aberto</th>
              <th class="py-2 px-2 w-48">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in sorted" :key="e.id" class="border-t border-gray-100">
              <td class="py-2 px-2 font-medium">{{ e.titulo }}</td>
              <td class="py-2 px-2">{{ e.local }}</td>
              <td class="py-2 px-2">{{ new Date(e.dataEvento).toLocaleString('pt-AO') }}</td>
              <td class="py-2 px-2">{{ e.duracaoMinutos }} min</td>
              <td class="py-2 px-2">
                <span :class="e.abertoParaVenda ? 'text-green-600' : 'text-red-600'">
                  {{ e.abertoParaVenda ? 'Sim' : 'Não' }}
                </span>
              </td>
              <td class="py-2 px-2 space-x-2">
                <button class="text-[var(--color-cyan)] hover:underline" @click="$router.push(`/eventos/${e.id}/lotes`)">
                  Lotes
                </button>
                <button class="text-[var(--color-cyan)] hover:underline" @click="editEvento(e)">Editar</button>
                <button class="text-red-600 hover:underline" @click="deleteEvento(e.id)">Remover</button>
              </td>
            </tr>
            <tr v-if="!store.loading && store.itens.length === 0">
              <td colspan="6" class="py-6 text-center text-[var(--color-text-secondary)]">Nenhum evento</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="store.loading" class="text-sm text-[var(--color-text-secondary)] mt-2 px-2">Carregando...</div>
      <div class="text-xs text-gray-500 mt-2 px-2 sm:hidden">
        Deslize horizontalmente para ver todas as colunas →
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showForm" class="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50">
      <div class="w-full max-w-2xl bg-white rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">{{ isEditing ? 'Editar Evento' : 'Novo Evento' }}</h2>
          <button class="text-gray-500 hover:text-gray-700" @click="showForm=false">✕</button>
        </div>
        <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="submit">
          <div class="sm:col-span-2">
            <label class="block text-sm mb-1">Título *</label>
            <input v-model="form.titulo" type="text" class="input" required />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm mb-1">Descrição</label>
            <textarea v-model="form.descricao" class="input min-h-[90px]"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm mb-1">Local *</label>
            <input v-model="form.local" type="text" class="input" required />
          </div>
          <div>
            <label class="block text-sm mb-1">Data do Evento *</label>
            <input v-model="form.dataEvento" type="datetime-local" class="input" required />
          </div>
          <div>
            <label class="block text-sm mb-1">Duração (minutos)</label>
            <input v-model.number="form.duracaoMinutos" type="number" min="1" class="input" placeholder="90" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm mb-1">Banner (imagem)</label>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml" 
              class="input" @change="handleFileChange" />
            <p class="text-xs text-gray-500 mt-1">Máximo 5 MB. Formatos: jpg, png, gif, webp, svg</p>
            <p v-if="form.bannerUrl" class="text-xs text-green-600 mt-1">Banner atual: {{ form.bannerUrl }}</p>
          </div>
          <div class="sm:col-span-2 flex items-center gap-2">
            <input id="aberto" v-model="form.abertoParaVenda" type="checkbox" class="h-4 w-4" />
            <label for="aberto" class="text-sm">Aberto para venda</label>
          </div>
          <div class="sm:col-span-2 flex items-center justify-end gap-2 mt-2">
            <button type="button" class="px-4 py-2 text-sm text-gray-600" @click="showForm=false">Cancelar</button>
            <button class="btn-primary" type="submit" :disabled="uploading">
              {{ uploading ? 'Fazendo upload...' : (isEditing ? 'Salvar' : 'Criar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
