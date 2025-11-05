<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary">
    <aside class="fixed inset-y-0 left-0 w-64 bg-primary text-white hidden md:block">
      <div class="p-4 text-lg font-semibold">ArenaTicket Admin</div>
      <nav class="px-2 space-y-1 text-sm">
        <RouterLink class="block px-3 py-2 hover:bg-white/10 rounded-lg" to="/dashboard">Dashboard</RouterLink>
        <RouterLink class="block px-3 py-2 hover:bg-white/10 rounded-lg" to="/eventos">Eventos</RouterLink>
        <RouterLink class="block px-3 py-2 hover:bg-white/10 rounded-lg" to="/lotes">Lotes</RouterLink>
        <RouterLink class="block px-3 py-2 hover:bg-white/10 rounded-lg" to="/pedidos">Pedidos</RouterLink>
        <RouterLink class="block px-3 py-2 hover:bg-white/10 rounded-lg" to="/auditoria">Auditoria</RouterLink>
      </nav>
    </aside>

    <div class="md:ml-64">
      <header class="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
        <div class="font-semibold">Painel</div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">{{ auth.userName }}</span>
          <button class="btn-primary" @click="handleLogout">Sair</button>
        </div>
      </header>

      <main class="p-4 bg-background min-h-[calc(100vh-3.5rem)]">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
