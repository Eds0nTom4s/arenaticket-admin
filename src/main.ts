import { createApp } from 'vue'
import './styles/tailwind.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { useAuthStore } from './store/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restaurar autenticação do localStorage
const auth = useAuthStore()
auth.loadFromStorage()

// Iniciar verificação periódica de expiração do token
auth.startTokenExpirationCheck()

app.mount('#app')
