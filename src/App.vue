<script setup lang="ts">
import { useRoute } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'

const route = useRoute()
</script>

<template>
  <component :is="route.path === '/login' ? 'div' : BaseLayout">
    <router-view />
  </component>
</template>

<style scoped>
/* estilos específicos podem ser adicionados aqui caso necessário */
</style>
