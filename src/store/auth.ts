import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ name: string; email: string } | null>(null)
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => user.value?.name ?? 'Administrador')
  const authHeader = computed(() => (token.value ? { Authorization: `Bearer ${token.value}` } : {}))

  async function login(email: string, _password: string) {
    user.value = { name: 'Admin', email }
    token.value = 'mock-token'
    return true
  }

  function logout() {
    user.value = null
    token.value = null
  }

  return { user, token, isAuthenticated, userName, authHeader, login, logout }
})
