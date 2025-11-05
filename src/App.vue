<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import BaseLayout from './layouts/BaseLayout.vue'

const route = useRoute()
</script>

<template>
  <component :is="route.path === '/login' ? 'div' : BaseLayout">
    <RouterView />
  </component>
</template>

<style scoped>
/* vazio */
</style>
