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
            <h1 class="text-2xl font-bold text-gray-900">Novo Usuário</h1>
            <p class="mt-1 text-sm text-gray-600">
              Preencha os dados para criar um novo usuário
            </p>
          </div>
        </div>
      </div>

      <!-- Formulário -->
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <UsuarioForm
          :loading="loading"
          @submit="handleSubmit"
          @cancel="goBack"
        />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUsuarioStore } from '@/store/usuarios';
import BaseLayout from '@/layouts/BaseLayout.vue';
import UsuarioForm from '@/components/admin/usuarios/UsuarioForm.vue';
import type { CreateUsuarioDto } from '@/types/usuario';

const router = useRouter();
const usuarioStore = useUsuarioStore();

const loading = ref(false);

const handleSubmit = async (data: CreateUsuarioDto) => {
  loading.value = true;
  
  try {
    await usuarioStore.createUsuario(data);
    alert('Usuário criado com sucesso!');
    router.push({ name: 'Usuarios' });
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Erro ao criar usuário');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push({ name: 'Usuarios' });
};
</script>
