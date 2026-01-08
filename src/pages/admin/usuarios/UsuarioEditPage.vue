<template>
  <BaseLayout>
    <div class="max-w-3xl mx-auto space-y-6">
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
            <h1 class="text-2xl font-bold text-gray-900">Editar Usuário</h1>
            <p class="mt-1 text-sm text-gray-600">
              Atualize os dados do usuário
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingUsuario" class="flex items-center justify-center p-12">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p class="mt-4 text-sm text-gray-600">Carregando usuário...</p>
        </div>
      </div>

      <!-- Formulário -->
      <div v-else-if="usuario" class="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <UsuarioForm
          :initial-data="usuario"
          :is-edit="true"
          :loading="loading"
          @submit="handleSubmit"
          @cancel="goBack"
        />
      </div>

      <!-- Erro -->
      <div v-else class="rounded-lg border border-red-200 bg-red-50 p-6">
        <p class="text-sm text-red-800">
          Usuário não encontrado
        </p>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUsuarioStore } from '@/store/usuarios';
import BaseLayout from '@/layouts/BaseLayout.vue';
import UsuarioForm from '@/components/admin/usuarios/UsuarioForm.vue';
import type { UpdateUsuarioDto, Usuario } from '@/types/usuario';

const router = useRouter();
const route = useRoute();
const usuarioStore = useUsuarioStore();

const usuario = ref<Usuario | null>(null);
const loading = ref(false);
const loadingUsuario = ref(true);

onMounted(async () => {
  const id = route.params.id as string;
  
  try {
    usuario.value = await usuarioStore.fetchUsuarioById(id);
  } catch (error) {
    alert('Erro ao carregar usuário');
    router.push({ name: 'Usuarios' });
  } finally {
    loadingUsuario.value = false;
  }
});

const handleSubmit = async (data: UpdateUsuarioDto) => {
  const id = route.params.id as string;
  loading.value = true;
  
  try {
    await usuarioStore.updateUsuario(id, data);
    alert('Usuário atualizado com sucesso!');
    router.push({ name: 'Usuarios' });
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Erro ao atualizar usuário');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push({ name: 'Usuarios' });
};
</script>
