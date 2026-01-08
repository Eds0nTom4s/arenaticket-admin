<template>
  <span :class="badgeClass">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getRoleLabel, getRoleColor, type UserRole } from '@/types/usuario';

interface Props {
  role: UserRole;
}

const props = defineProps<Props>();

const label = computed(() => getRoleLabel(props.role));

const colorMap = {
  blue: 'bg-blue-100 text-blue-800',
  orange: 'bg-orange-100 text-orange-800',
  purple: 'bg-purple-100 text-purple-800',
  gray: 'bg-gray-100 text-gray-800',
};

const badgeClass = computed(() => {
  const color = getRoleColor(props.role);
  const colorClass = colorMap[color as keyof typeof colorMap] || colorMap.gray;
  
  return [
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    colorClass,
  ];
});
</script>
