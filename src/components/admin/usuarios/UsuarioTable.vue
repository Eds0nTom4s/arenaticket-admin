<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center p-12">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p class="mt-4 text-sm text-gray-600">Carregando usuários...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="usuarios.length === 0" class="flex items-center justify-center p-12">
      <div class="text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
        <p class="mt-1 text-sm text-gray-500">
          Tente ajustar os filtros ou criar um novo usuário
        </p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Nome
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Telefone
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Perfil
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Status
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Data de Criação
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr
            v-for="usuario in usuarios"
            :key="usuario.id"
            class="transition-colors hover:bg-gray-50"
          >
            <!-- Nome -->
            <td class="whitespace-nowrap px-6 py-4">
              <div class="text-sm font-medium text-gray-900">
                {{ usuario.nome }}
              </div>
            </td>

            <!-- Telefone -->
            <td class="whitespace-nowrap px-6 py-4">
              <div class="text-sm text-gray-600">
                {{ formatarTelefone(usuario.telefone) }}
              </div>
            </td>

            <!-- Perfil (Role) -->
            <td class="whitespace-nowrap px-6 py-4">
              <UsuarioRoleBadge :role="usuario.role" />
            </td>

            <!-- Status -->
            <td class="whitespace-nowrap px-6 py-4">
              <UsuarioStatusBadge :ativo="usuario.ativo" />
            </td>

            <!-- Data de Criação -->
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
              {{ formatarData(usuario.createdAt) }}
            </td>

            <!-- Ações -->
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                <!-- Ver -->
                <button
                  type="button"
                  class="text-blue-600 hover:text-blue-900"
                  title="Ver detalhes"
                  @click="$emit('view', usuario)"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>

                <!-- Editar -->
                <button
                  type="button"
                  class="text-indigo-600 hover:text-indigo-900"
                  title="Editar"
                  @click="$emit('edit', usuario)"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                <!-- Desativar/Ativar -->
                <button
                  v-if="usuario.ativo"
                  type="button"
                  :disabled="!podeDesativar(usuario)"
                  :class="[
                    'transition-colors',
                    podeDesativar(usuario)
                      ? 'text-red-600 hover:text-red-900 cursor-pointer'
                      : 'text-gray-300 cursor-not-allowed'
                  ]"
                  :title="tooltipDesativar(usuario)"
                  @click="podeDesativar(usuario) && emit('deactivate', usuario)"
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
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </button>
                <button
                  v-else
                  type="button"
                  class="text-green-600 hover:text-green-900"
                  title="Reativar"
                  @click="emit('activate', usuario)"
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Usuario } from '@/types/usuario';
import UsuarioRoleBadge from './UsuarioRoleBadge.vue';
import UsuarioStatusBadge from './UsuarioStatusBadge.vue';

interface Props {
  usuarios: Usuario[];
  loading?: boolean;
}

interface Emits {
  (e: 'view', usuario: Usuario): void;
  (e: 'edit', usuario: Usuario): void;
  (e: 'deactivate', usuario: Usuario): void;
  (e: 'activate', usuario: Usuario): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

// Contar quantos ADMINs ativos existem
const adminsAtivos = computed(() => {
  return props.usuarios.filter((u) => u.role === 'ADMIN' && u.ativo).length;
});

// Verificar se pode desativar um usuário
const podeDesativar = (usuario: Usuario): boolean => {
  // Se não for ADMIN, pode desativar
  if (usuario.role !== 'ADMIN') {
    return true;
  }
  
  // Se for ADMIN, só pode desativar se houver mais de 1 ADMIN ativo
  return adminsAtivos.value > 1;
};

// Tooltip para botão de desativar
const tooltipDesativar = (usuario: Usuario): string => {
  if (!podeDesativar(usuario)) {
    return 'Não é possível desativar o último administrador do sistema';
  }
  return 'Desativar';
};

const formatarTelefone = (telefone: string): string => {
  // Remover tudo que não é número
  const cleaned = telefone.replace(/\D/g, '');
  
  // Se começar com 244, remover
  const numero = cleaned.startsWith('244') ? cleaned.substring(3) : cleaned;
  
  return `+244 ${numero}`;
};

const formatarData = (dataISO: string): string => {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
</script>
