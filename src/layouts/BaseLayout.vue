<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { useRouter, RouterLink } from 'vue-router'
import { computed, ref } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(false)

// Itens do menu com controle de permissão
const menuItems = computed(() => {
  const items = [
    { path: '/dashboard', label: 'Dashboard', roles: ['ADMIN'], icon: 'chart' },
    { path: '/eventos', label: 'Eventos', roles: ['ADMIN'], icon: 'calendar' },
    { path: '/lotes', label: 'Lotes', roles: ['ADMIN'], icon: 'ticket' },
    { path: '/pedidos', label: 'Pedidos', roles: ['ADMIN'], icon: 'list' },
    { path: '/vendas', label: 'Vendas', roles: ['ADMIN', 'VENDEDOR'], icon: 'cash-register' },
    { path: '/porteiro', label: 'Porteiro', roles: ['ADMIN', 'PORTEIRO'], icon: 'door' },
    { path: '/bilhetes', label: 'Bilhetes', roles: ['ADMIN', 'PORTEIRO'], icon: 'qrcode' },
    { path: '/auditoria', label: 'Auditoria', roles: ['ADMIN'], icon: 'shield' },
  ]
  
  return items.filter(item => auth.canAccessRoute(item.roles))
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
    <!-- Overlay mobile -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 bg-black/50 z-40 md:hidden" 
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 w-64 bg-[var(--color-primary)] text-white z-50 transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <div class="flex items-center justify-between p-4">
        <div class="text-lg font-semibold">ArenaTicket Admin</div>
        <button @click="closeSidebar" class="md:hidden text-white hover:bg-white/10 rounded p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="px-2 space-y-1 text-sm">
        <RouterLink 
          v-for="item in menuItems" 
          :key="item.path"
          class="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors" 
          :to="item.path"
          @click="closeSidebar"
        >
          <!-- Ícones SVG -->
          <svg v-if="item.icon === 'chart'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <svg v-else-if="item.icon === 'calendar'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <svg v-else-if="item.icon === 'ticket'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <svg v-else-if="item.icon === 'list'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <svg v-else-if="item.icon === 'cash-register'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <svg v-else-if="item.icon === 'door'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <svg v-else-if="item.icon === 'qrcode'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <svg v-else-if="item.icon === 'shield'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="md:ml-64">
      <header class="sticky top-0 z-30 h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <!-- Botão hamburguer mobile -->
          <button @click="toggleSidebar" class="md:hidden text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="font-semibold">Painel</div>
        </div>
        <div class="flex items-center gap-2 md:gap-3">
          <span class="hidden sm:inline text-sm text-gray-600 truncate max-w-[120px]">{{ auth.userName }}</span>
          <span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{{ auth.userRole }}</span>
          <button class="btn-primary text-sm px-3 py-1.5" @click="handleLogout">Sair</button>
        </div>
      </header>

      <main class="p-3 sm:p-4 md:p-6 min-h-[calc(100vh-3.5rem)]">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
