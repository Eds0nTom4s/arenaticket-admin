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
  const expiresAt = ref<number | null>(null)

  const isAuthenticated = computed(() => {
    // Verificar se há token e se não expirou
    if (!user.value || !token.value) return false
    if (expiresAt.value && Date.now() >= expiresAt.value) {
      console.warn('⚠️ Token expirado detectado no computed')
      logout()
      return false
    }
    return true
  })
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
      
      // Calcular timestamp de expiração (expiresIn está em segundos)
      const expirationTime = Date.now() + (data.expiresIn * 1000)
      expiresAt.value = expirationTime
      
      // Salvar no localStorage para persistência
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.usuario))
      localStorage.setItem('auth_expires', expirationTime.toString())
      
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  function logout() {
    user.value = null
    token.value = null
    expiresAt.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_expires')
  }

  function loadFromStorage() {
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      const savedExpires = localStorage.getItem('auth_expires')
      
      if (savedToken && savedUser) {
        // Verificar se o token não expirou
        if (savedExpires) {
          const expirationTime = parseInt(savedExpires, 10)
          if (Date.now() >= expirationTime) {
            console.warn('⚠️ Token expirado no localStorage - Limpando...')
            logout()
            return
          }
          expiresAt.value = expirationTime
        }
        
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error)
      // Limpar localStorage corrompido
      logout()
    }
  }

  // Verificação periódica de expiração (a cada minuto)
  function startTokenExpirationCheck() {
    setInterval(() => {
      if (expiresAt.value && Date.now() >= expiresAt.value) {
        console.warn('⚠️ Token expirado detectado na verificação periódica')
        logout()
        // Redirecionar para login se estiver em uma página autenticada
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }, 60000) // Verificar a cada 60 segundos
  }

  return { 
    user, 
    token, 
    expiresAt,
    isAuthenticated, 
    userName, 
    userRole, 
    authHeader, 
    isAdmin, 
    isPorteiro, 
    isVendedor, 
    canAccessRoute, 
    login, 
    logout, 
    loadFromStorage,
    startTokenExpirationCheck
  }
})
