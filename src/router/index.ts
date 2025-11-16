import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const LoginPage = () => import('@/pages/LoginPage.vue')
const DashboardPage = () => import('@/pages/DashboardPage.vue')
const EventosPage = () => import('@/pages/EventosPage.vue')
const EventosListaLotesPage = () => import('@/pages/EventosListaLotesPage.vue')
const LotesPage = () => import('@/pages/LotesPage.vue')
const PedidosPage = () => import('@/pages/PedidosPage.vue')
const AuditoriaPage = () => import('@/pages/AuditoriaPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginPage },
    { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } },
    { path: '/eventos', component: EventosPage, meta: { requiresAuth: true } },
    { path: '/lotes', component: EventosListaLotesPage, meta: { requiresAuth: true } },
    { path: '/eventos/:eventoId/lotes', component: LotesPage, meta: { requiresAuth: true } },
    { path: '/pedidos', component: PedidosPage, meta: { requiresAuth: true } },
    { path: '/auditoria', component: AuditoriaPage, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
