<template>
  <span :class="badgeClass">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  ativo: boolean;
}

const props = defineProps<Props>();

const label = computed(() => (props.ativo ? 'Ativo' : 'Inativo'));

const badgeClass = computed(() => [
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  props.ativo
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800',
]);
</script>
