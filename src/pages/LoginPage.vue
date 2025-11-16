<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRoute, useRouter } from 'vue-router'

const telefone = ref('')
const senha = ref('')
const loading = ref(false)
const error = ref('')

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

async function submit() {
  loading.value = true
  error.value = ''
  try {
    console.log('Tentando login com:', { telefone: telefone.value })
    await auth.login(telefone.value, senha.value)
    console.log('Login bem-sucedido, redirecionando...')
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.replace(redirect)
  } catch (e: any) {
    console.error('Erro no login:', e)
    error.value = e.message || 'Falha na autenticação'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen grid place-items-center bg-[var(--color-bg)] p-4">
    <div class="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6">
      <div class="text-center mb-6">
        <div class="text-xl font-semibold text-[var(--color-text)]">ArenaTicket Admin</div>
        <p class="text-sm text-[var(--color-text-secondary)]">Acesse sua conta</p>
      </div>

      <form class="space-y-3" @submit.prevent="submit">
        <div>
          <label class="block text-sm mb-1">Telefone</label>
          <input v-model="telefone" type="tel" class="input" placeholder="923456789" required />
        </div>
        <div>
          <label class="block text-sm mb-1">Senha</label>
          <input v-model="senha" type="password" class="input" placeholder="••••••••" required />
        </div>
        <button class="btn-primary w-full" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </form>
    </div>
  </div>
</template>
