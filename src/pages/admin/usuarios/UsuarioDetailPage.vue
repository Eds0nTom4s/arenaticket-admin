<template>
  <BaseLayout>
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="rounded-md p-2 text-gray-600 hover:bg-gray-100"
            @click="goBack"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Detalhes do Usuário</h1>
            <p class="mt-1 text-sm text-gray-600">
              Informações completas do usuário
            </p>
          </div>
        </div>
        <button
          v-if="usuario"
          type="button"
          class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="goToEdit"
        >
          <svg
            class="-ml-1 mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Editar
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center p-12">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p class="mt-4 text-sm text-gray-600">Carregando usuário...</p>
        </div>
      </div>

      <!-- Conteúdo -->
      <div v-else-if="usuario" class="space-y-6">
        <!-- Informações Principais -->
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Informações Principais
          </h2>
          
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <!-- Nome -->
            <div>
              <dt class="text-sm font-medium text-gray-500">Nome Completo</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ usuario.nome }}</dd>
            </div>

            <!-- Telefone -->
            <div>
              <dt class="text-sm font-medium text-gray-500">Telefone</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatarTelefone(usuario.telefone) }}
              </dd>
            </div>

            <!-- Perfil -->
            <div>
              <dt class="text-sm font-medium text-gray-500">Perfil de Acesso</dt>
              <dd class="mt-1">
                <UsuarioRoleBadge :role="usuario.role" />
              </dd>
            </div>

            <!-- Status -->
            <div>
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1">
                <UsuarioStatusBadge :ativo="usuario.ativo" />
              </dd>
            </div>

            <!-- Data de Criação -->
            <div>
              <dt class="text-sm font-medium text-gray-500">Data de Criação</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatarDataCompleta(usuario.createdAt) }}
              </dd>
            </div>

            <!-- Última Atualização -->
            <div v-if="usuario.updatedAt">
              <dt class="text-sm font-medium text-gray-500">Última Atualização</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatarDataCompleta(usuario.updatedAt) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Ações -->
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Ações</h2>
          
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              @click="goToEdit"
            >
              <svg
                class="-ml-1 mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar Usuário
            </button>

            <button
              v-if="usuario.ativo"
              type="button"
              class="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              @click="confirmDeactivate"
            >
              <svg
                class="-ml-1 mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Desativar Usuário
            </button>

            <button
              v-else
              type="button"
              class="inline-flex items-center rounded-md border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
              @click="confirmActivate"
            >
              <svg
                class="-ml-1 mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Reativar Usuário
            </button>
          </div>
        </div>
      </div>

      <!-- Erro -->
      <div v-else class="rounded-lg border border-red-200 bg-red-50 p-6">
        <p class="text-sm text-red-800">
          Usuário não encontrado
        </p>
      </div>

      <!-- Modal de Confirmação -->
      <ConfirmModal
        v-model="showConfirmModal"
        :title="confirmTitle"
        :message="confirmMessage"
        :confirm-text="confirmText"
        :variant="confirmVariant"
        @confirm="handleConfirm"
      />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUsuarioStore } from '@/store/usuarios';
import BaseLayout from '@/layouts/BaseLayout.vue';
import UsuarioRoleBadge from '@/components/admin/usuarios/UsuarioRoleBadge.vue';
import UsuarioStatusBadge from '@/components/admin/usuarios/UsuarioStatusBadge.vue';
import ConfirmModal from '@/components/admin/usuarios/ConfirmModal.vue';
import type { Usuario } from '@/types/usuario';

const router = useRouter();
const route = useRoute();
const usuarioStore = useUsuarioStore();

const usuario = ref<Usuario | null>(null);
const loading = ref(true);

const showConfirmModal = ref(false);
const confirmAction = ref<'deactivate' | 'activate' | null>(null);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmText = ref('Confirmar');
const confirmVariant = ref<'danger' | 'primary'>('danger');

onMounted(async () => {
  const id = route.params.id as string;
  
  try {
    usuario.value = await usuarioStore.fetchUsuarioById(id);
  } catch (error) {
    alert('Erro ao carregar usuário');
    router.push({ name: 'Usuarios' });
  } finally {
    loading.value = false;
  }
});

const formatarTelefone = (telefone: string): string => {
  const cleaned = telefone.replace(/\D/g, '');
  const numero = cleaned.startsWith('244') ? cleaned.substring(3) : cleaned;
  return `+244 ${numero}`;
};

const formatarDataCompleta = (dataISO: string): string => {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const goBack = () => {
  router.push({ name: 'Usuarios' });
};

const goToEdit = () => {
  if (usuario.value) {
    router.push({ name: 'UsuarioEdit', params: { id: usuario.value.id } });
  }
};

const confirmDeactivate = () => {
  if (!usuario.value) return;
  
  confirmAction.value = 'deactivate';
  confirmTitle.value = 'Desativar Usuário';
  confirmMessage.value = `Tem certeza que deseja desativar o usuário ${usuario.value.nome}?`;
  confirmText.value = 'Desativar';
  confirmVariant.value = 'danger';
  showConfirmModal.value = true;
};

const confirmActivate = () => {
  if (!usuario.value) return;
  
  confirmAction.value = 'activate';
  confirmTitle.value = 'Reativar Usuário';
  confirmMessage.value = `Tem certeza que deseja reativar o usuário ${usuario.value.nome}?`;
  confirmText.value = 'Reativar';
  confirmVariant.value = 'primary';
  showConfirmModal.value = true;
};

const handleConfirm = async () => {
  if (!usuario.value || !confirmAction.value) return;

  try {
    if (confirmAction.value === 'deactivate') {
      await usuarioStore.deactivateUsuario(usuario.value.id);
      usuario.value.ativo = false;
      alert('Usuário desativado com sucesso');
    } else if (confirmAction.value === 'activate') {
      await usuarioStore.activateUsuario(usuario.value.id);
      usuario.value.ativo = true;
      alert('Usuário reativado com sucesso');
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Erro ao processar ação');
  }
};
</script>
