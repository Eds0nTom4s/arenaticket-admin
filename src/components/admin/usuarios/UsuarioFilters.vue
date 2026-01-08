<template>
  <div class="space-y-4">
    <!-- Barra de busca -->
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          class="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        :value="search"
        type="text"
        class="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Buscar por nome ou telefone..."
        @input="handleSearchInput"
      />
    </div>

    <!-- Tabs de status -->
    <div class="flex gap-2 border-b border-gray-200">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        type="button"
        :class="statusTabClass(tab.value)"
        @click="$emit('update:status', tab.value)"
      >
        {{ tab.label }}
        <span
          v-if="tab.count !== undefined"
          :class="statusCountClass(tab.value)"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Filtros adicionais -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Filtro de Role -->
      <div class="flex-1 min-w-[200px]">
        <label for="role-filter" class="block text-sm font-medium text-gray-700 mb-1">
          Perfil
        </label>
        <select
          id="role-filter"
          :value="role || ''"
          class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleRoleChange"
        >
          <option value="">Todos os perfis</option>
          <option
            v-for="option in roleOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Botão Limpar Filtros -->
      <div class="flex items-end">
        <button
          v-if="hasActiveFilters"
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="$emit('clear')"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ROLE_OPTIONS, type UserRole } from '@/types/usuario';

interface Props {
  search: string;
  status: 'todos' | 'ativos' | 'inativos';
  role: UserRole | null;
  totalTodos?: number;
  totalAtivos?: number;
  totalInativos?: number;
}

interface Emits {
  (e: 'update:search', value: string): void;
  (e: 'update:status', value: 'todos' | 'ativos' | 'inativos'): void;
  (e: 'update:role', value: UserRole | null): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  totalTodos: 0,
  totalAtivos: 0,
  totalInativos: 0,
});

const emit = defineEmits<Emits>();

const roleOptions = ROLE_OPTIONS;

// Debounce para busca
const searchTimeout = ref<NodeJS.Timeout | null>(null);

const statusTabs = computed(() => [
  {
    value: 'todos' as const,
    label: 'Todos',
    count: props.totalTodos,
  },
  {
    value: 'ativos' as const,
    label: 'Ativos',
    count: props.totalAtivos,
  },
  {
    value: 'inativos' as const,
    label: 'Inativos',
    count: props.totalInativos,
  },
]);

const hasActiveFilters = computed(() => {
  return props.search !== '' || props.status !== 'todos' || props.role !== null;
});

const statusTabClass = (value: string) => [
  'relative px-4 py-2 text-sm font-medium transition-colors',
  props.status === value
    ? 'border-b-2 border-blue-500 text-blue-600'
    : 'text-gray-600 hover:text-gray-900',
];

const statusCountClass = (value: string) => [
  'ml-2 rounded-full px-2 py-0.5 text-xs',
  props.status === value
    ? 'bg-blue-100 text-blue-600'
    : 'bg-gray-100 text-gray-600',
];

const handleSearchInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  
  // Limpar timeout anterior
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // Criar novo timeout (debounce de 300ms)
  searchTimeout.value = setTimeout(() => {
    emit('update:search', value);
  }, 300);
};

const handleRoleChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  emit('update:role', value ? (value as UserRole) : null);
};
</script>
