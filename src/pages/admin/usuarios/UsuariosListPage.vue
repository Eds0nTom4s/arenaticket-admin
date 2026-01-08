<template>
  <BaseLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p class="mt-1 text-sm text-gray-600">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="goToCreate"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Novo Usuário
        </button>
      </div>

      <!-- Filtros -->
      <UsuarioFilters
        v-model:search="filters.search"
        v-model:status="filters.status"
        v-model:role="filters.role"
        :total-todos="totalUsuarios"
        :total-ativos="totalAtivos"
        :total-inativos="totalInativos"
        @clear="clearFilters"
      />

      <!-- Tabela -->
      <UsuarioTable
        :usuarios="usuariosFiltrados"
        :loading="loading"
        @view="goToView"
        @edit="goToEdit"
        @deactivate="confirmDeactivate"
        @activate="confirmActivate"
      />

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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUsuarioStore } from '@/store/usuarios';
import BaseLayout from '@/layouts/BaseLayout.vue';
import UsuarioFilters from '@/components/admin/usuarios/UsuarioFilters.vue';
import UsuarioTable from '@/components/admin/usuarios/UsuarioTable.vue';
import ConfirmModal from '@/components/admin/usuarios/ConfirmModal.vue';
import type { Usuario } from '@/types/usuario';

const router = useRouter();
const usuarioStore = useUsuarioStore();

const loading = computed(() => usuarioStore.loading);
const usuariosFiltrados = computed(() => usuarioStore.usuariosFiltrados);
const totalUsuarios = computed(() => usuarioStore.totalUsuarios);
const totalAtivos = computed(() => usuarioStore.totalAtivos);
const totalInativos = computed(() => usuarioStore.totalInativos);

const filters = computed({
  get: () => usuarioStore.filters,
  set: (value) => {
    Object.entries(value).forEach(([key, val]) => {
      usuarioStore.setFilter(key as any, val);
    });
  },
});

const showConfirmModal = ref(false);
const confirmAction = ref<'deactivate' | 'activate' | null>(null);
const confirmUserId = ref<string | null>(null);
const confirmUserName = ref<string>('');
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmText = ref('Confirmar');
const confirmVariant = ref<'danger' | 'primary'>('danger');

onMounted(async () => {
  try {
    await usuarioStore.fetchUsuarios();
  } catch (error) {
    alert('Erro ao carregar usuários. Por favor, tente novamente.');
  }
});

const goToCreate = () => {
  router.push({ name: 'UsuarioCreate' });
};

const goToView = (usuario: Usuario) => {
  router.push({ name: 'UsuarioDetail', params: { id: usuario.id } });
};

const goToEdit = (usuario: Usuario) => {
  router.push({ name: 'UsuarioEdit', params: { id: usuario.id } });
};

const confirmDeactivate = (usuario: Usuario) => {
  confirmAction.value = 'deactivate';
  confirmUserId.value = usuario.id;
  confirmUserName.value = usuario.nome;
  confirmTitle.value = 'Desativar Usuário';
  confirmMessage.value = `Tem certeza que deseja desativar o usuário ${usuario.nome}?`;
  confirmText.value = 'Desativar';
  confirmVariant.value = 'danger';
  showConfirmModal.value = true;
};

const confirmActivate = (usuario: Usuario) => {
  confirmAction.value = 'activate';
  confirmUserId.value = usuario.id;
  confirmUserName.value = usuario.nome;
  confirmTitle.value = 'Reativar Usuário';
  confirmMessage.value = `Tem certeza que deseja reativar o usuário ${usuario.nome}?`;
  confirmText.value = 'Reativar';
  confirmVariant.value = 'primary';
  showConfirmModal.value = true;
};

const handleConfirm = async () => {
  if (!confirmUserId.value || !confirmAction.value) return;

  try {
    if (confirmAction.value === 'deactivate') {
      await usuarioStore.deactivateUsuario(confirmUserId.value);
      alert(`Usuário ${confirmUserName.value} desativado com sucesso`);
    } else if (confirmAction.value === 'activate') {
      await usuarioStore.activateUsuario(confirmUserId.value);
      alert(`Usuário ${confirmUserName.value} reativado com sucesso`);
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Erro ao processar ação');
  }
};

const clearFilters = () => {
  usuarioStore.clearFilters();
};
</script>
