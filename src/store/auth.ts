import { defineStore } from 'pinia'

interface State {
  user: { name: string; email: string } | null
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    userName: (state) => state.user?.name ?? 'Administrador',
  },
  actions: {
    async login(email: string, _password: string) {
      // Mock simples: aceita qualquer email/senha e define usuário
      this.user = { name: 'Admin', email }
      return true
    },
    logout() {
      this.user = null
    },
  },
})
