<script setup lang="ts">
const metrics = [
  { label: 'Eventos Ativos', value: 12 },
  { label: 'Bilhetes Vendidos', value: 3274 },
  { label: 'Vendas (Kz)', value: '5.3M' },
  { label: 'Próximos Eventos', value: 4 },
]
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div v-for="m in metrics" :key="m.label" class="card">
      <div class="text-sm text-[var(--color-text-secondary)]">{{ m.label }}</div>
      <div class="text-2xl font-semibold mt-1 text-[var(--color-text)]">{{ m.value }}</div>
    </div>
  </div>
</template>
