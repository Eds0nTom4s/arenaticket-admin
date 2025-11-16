<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useEventosStore } from '@/store/eventos'
import type { Evento, EventoCreate } from '@/types/evento'

const store = useEventosStore()
const showForm = ref(false)
const isEditing = ref(false)
const currentId = ref<string | null>(null)
const form = reactive<EventoCreate>({
  titulo: '',
  descricao: '',
  local: '',
  dataInicio: '',
  dataFim: '',
  bannerUrl: '',
  abertoParaVenda: true,
  createdAt: '' as any,
}) as any

function resetForm() {
  form.titulo = ''
  form.descricao = ''
  form.local = ''
  form.dataInicio = ''
  form.dataFim = ''
  form.bannerUrl = ''
  form.abertoParaVenda = true
  currentId.value = null
  isEditing.value = false
}

async function submit() {
  const payload: any = {
    titulo: form.titulo,
    descricao: form.descricao,
    local: form.local,
    dataInicio: form.dataInicio,
    dataFim: form.dataFim,
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
  form.dataInicio = e.dataInicio.slice(0, 16)
  form.dataFim = e.dataFim.slice(0, 16)
  form.bannerUrl = e.bannerUrl || ''
  form.abertoParaVenda = e.abertoParaVenda
}

async function deleteEvento(id: string) {
  if (!confirm('Remover este evento?')) return
  await store.remover(id)
}

const sorted = computed(() =>
  [...store.itens].sort((a, b) => (a.dataInicio > b.dataInicio ? -1 : 1))
)

onMounted(() => store.listar())
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Eventos</h1>
      <button class="btn-primary" @click="newEvento">Novo Evento</button>
    </div>

    <div class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-[var(--color-text-secondary)]">
            <th class="py-2">Título</th>
            <th class="py-2">Local</th>
            <th class="py-2">Início</th>
            <th class="py-2">Fim</th>
            <th class="py-2">Aberto</th>
            <th class="py-2 w-32">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in sorted" :key="e.id" class="border-t border-gray-100">
            <td class="py-2 font-medium">{{ e.titulo }}</td>
            <td class="py-2">{{ e.local }}</td>
            <td class="py-2">{{ new Date(e.dataInicio).toLocaleString() }}</td>
            <td class="py-2">{{ new Date(e.dataFim).toLocaleString() }}</td>
            <td class="py-2">
              <span :class="e.abertoParaVenda ? 'text-green-600' : 'text-red-600'">
                {{ e.abertoParaVenda ? 'Sim' : 'Não' }}
              </span>
            </td>
            <td class="py-2 space-x-2">
              <button class="text-[var(--color-cyan)]" @click="editEvento(e)">Editar</button>
              <button class="text-red-600" @click="deleteEvento(e.id)">Remover</button>
            </td>
          </tr>
          <tr v-if="!store.loading && store.itens.length === 0">
            <td colspan="6" class="py-6 text-center text-[var(--color-text-secondary)]">Nenhum evento</td>
          </tr>
        </tbody>
      </table>
      <div v-if="store.loading" class="text-sm text-[var(--color-text-secondary)] mt-2">Carregando...</div>
      <div v-if="store.error" class="text-sm text-red-600 mt-2">{{ store.error }}</div>
    </div>

    <!-- Modal Form -->
    <div v-if="showForm" class="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div class="w-full max-w-lg bg-white rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold">{{ isEditing ? 'Editar Evento' : 'Novo Evento' }}</h2>
          <button class="text-gray-500" @click="showForm=false">Fechar</button>
        </div>
        <form class="grid grid-cols-1 sm:grid-cols-2 gap-3" @submit.prevent="submit">
          <div class="sm:col-span-2">
            <label class="block text-xs mb-1">Título</label>
            <input v-model="form.titulo" type="text" class="input" required />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs mb-1">Descrição</label>
            <textarea v-model="form.descricao" class="input min-h-[90px]"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs mb-1">Local</label>
            <input v-model="form.local" type="text" class="input" required />
          </div>
          <div>
            <label class="block text-xs mb-1">Início</label>
            <input v-model="form.dataInicio" type="datetime-local" class="input" required />
          </div>
          <div>
            <label class="block text-xs mb-1">Fim</label>
            <input v-model="form.dataFim" type="datetime-local" class="input" required />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs mb-1">Banner URL</label>
            <input v-model="form.bannerUrl" type="url" class="input" placeholder="https://..." />
          </div>
          <div class="sm:col-span-2 flex items-center gap-2">
            <input id="aberto" v-model="form.abertoParaVenda" type="checkbox" class="h-4 w-4" />
            <label for="aberto" class="text-sm">Aberto para venda</label>
          </div>
          <div class="sm:col-span-2 flex items-center justify-end gap-2 mt-2">
            <button type="button" class="text-[var(--color-text-secondary)]" @click="showForm=false">Cancelar</button>
            <button class="btn-primary" type="submit">{{ isEditing ? 'Salvar' : 'Criar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
