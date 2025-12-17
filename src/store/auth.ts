import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface LoginResponse {
  token: string
  type: string
  expiresIn: number
  refreshToken: string
  usuario: {
    id: string
    telefone: string
    nome: string
    role: string
    ativo: boolean
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string; telefone: string; nome: string; role: string; ativo: boolean } | null>(null)
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userName = computed(() => user.value?.nome ?? 'Administrador')
  const userRole = computed(() => user.value?.role ?? 'ADMIN')
  const authHeader = computed(() => (token.value ? { Authorization: `Bearer ${token.value}` } : {}))

  // Funções de verificação de permissão
  const isAdmin = computed(() => userRole.value === 'ADMIN')
  const isPorteiro = computed(() => userRole.value === 'PORTEIRO')
  const isVendedor = computed(() => userRole.value === 'VENDEDOR')
  const canAccessRoute = (allowedRoles: string[]) => {
    if (!user.value) return false
    return allowedRoles.includes(user.value.role)
  }

  async function login(telefone: string, senha: string) {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone, senha }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Falha na autenticação' }))
        throw new Error(error.message || 'Falha na autenticação')
      }

      const data: LoginResponse = await response.json()
      
      console.log('Login response:', data) // Debug
      
      user.value = data.usuario
      token.value = data.token
      
      // Salvar no localStorage para persistência
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.usuario))
      
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  function loadFromStorage() {
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error)
      // Limpar localStorage corrompido
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      token.value = null
      user.value = null
    }
  }

  return { user, token, isAuthenticated, userName, userRole, authHeader, isAdmin, isPorteiro, isVendedor, canAccessRoute, login, logout, loadFromStorage }
})
