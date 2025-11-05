<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRoute, useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.replace(redirect)
  } catch (e) {
    error.value = 'Falha na autenticação'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen grid place-items-center bg-background p-4">
    <div class="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6">
      <div class="text-center mb-6">
        <div class="text-xl font-semibold text-text-primary">ArenaTicket Admin</div>
        <p class="text-sm text-text-secondary">Acesse sua conta</p>
      </div>

      <form class="space-y-3" @submit.prevent="submit">
        <div>
          <label class="block text-sm mb-1">Email</label>
          <input v-model="email" type="email" class="input" placeholder="admin@arenaticket.com" required />
        </div>
        <div>
          <label class="block text-sm mb-1">Senha</label>
          <input v-model="password" type="password" class="input" placeholder="••••••••" required />
        </div>
        <button class="btn-primary w-full" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </form>
    </div>
  </div>
</template>
