import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const LoginPage = () => import('@/pages/LoginPage.vue')
const DashboardPage = () => import('@/pages/DashboardPage.vue')
const EventosPage = () => import('@/pages/EventosPage.vue')
const EventosListaLotesPage = () => import('@/pages/EventosListaLotesPage.vue')
const LotesPage = () => import('@/pages/LotesPage.vue')
const PedidosPage = () => import('@/pages/PedidosPage.vue')
const AuditoriaPage = () => import('@/pages/AuditoriaPage.vue')
const VisualizarBilhetePage = () => import('@/pages/VisualizarBilhetePage.vue')
const PorteiroPage = () => import('@/pages/PorteiroPage.vue')
const VendasPage = () => import('@/pages/VendasPage.vue')
const RelatoriosVendasPage = () => import('@/pages/RelatoriosVendasPage.vue')

// Gestão de Usuários
const UsuariosListPage = () => import('@/pages/admin/usuarios/UsuariosListPage.vue')
const UsuarioCreatePage = () => import('@/pages/admin/usuarios/UsuarioCreatePage.vue')
const UsuarioEditPage = () => import('@/pages/admin/usuarios/UsuarioEditPage.vue')
const UsuarioDetailPage = () => import('@/pages/admin/usuarios/UsuarioDetailPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginPage },
    { 
      path: '/dashboard', 
      component: DashboardPage, 
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } 
    },
    { 
      path: '/eventos', 
      component: EventosPage, 
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } 
    },
    { 
      path: '/lotes', 
      component: EventosListaLotesPage, 
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } 
    },
    { 
      path: '/eventos/:eventoId/lotes', 
      component: LotesPage, 
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } 
    },
    { 
      path: '/pedidos', 
      component: PedidosPage, 
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } 
    },
    { 
      path: '/auditoria', 
      component: AuditoriaPage, 
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'] } 
    },
    { 
      path: '/bilhetes/:codigo?', 
      component: VisualizarBilhetePage, 
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'PORTEIRO'] } 
    },
    { 
      path: '/porteiro', 
      component: PorteiroPage, 
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'PORTEIRO'] } 
    },
    { 
      path: '/vendas', 
      component: VendasPage, 
      meta: { requiresAuth: true, allowedRoles: ['VENDEDOR'] } 
    },
    { 
      path: '/relatorios/vendas', 
      component: RelatoriosVendasPage, 
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'], title: 'Relatórios de Vendas' } 
    },
    // Gestão de Usuários
    { 
      path: '/admin/usuarios',
      name: 'Usuarios',
      component: UsuariosListPage,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'], title: 'Gestão de Usuários' }
    },
    { 
      path: '/admin/usuarios/novo',
      name: 'UsuarioCreate',
      component: UsuarioCreatePage,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'], title: 'Novo Usuário' }
    },
    { 
      path: '/admin/usuarios/:id',
      name: 'UsuarioDetail',
      component: UsuarioDetailPage,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'], title: 'Detalhes do Usuário' }
    },
    { 
      path: '/admin/usuarios/:id/editar',
      name: 'UsuarioEdit',
      component: UsuarioEditPage,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'], title: 'Editar Usuário' }
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  
  // Garantir que o estado foi carregado do localStorage
  if (!auth.user && !auth.token) {
    auth.loadFromStorage()
  }
  
  // Permitir acesso à página de login sem autenticação
  if (to.path === '/login') {
    // Se já estiver autenticado, redirecionar para página apropriada por role
    if (auth.isAuthenticated) {
      if (auth.userRole === 'VENDEDOR') {
        return { path: '/vendas' }
      }
      if (auth.userRole === 'PORTEIRO') {
        return { path: '/porteiro' }
      }
      return { path: '/dashboard' }
    }
    return true
  }
  
  // Todas as outras rotas requerem autenticação
  if (!auth.isAuthenticated) {
    console.warn('Acesso negado: usuário não autenticado')
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // Redirect automático para VENDEDOR na rota raiz
  if (to.path === '/' || to.path === '/dashboard') {
    if (auth.userRole === 'VENDEDOR') {
      return { path: '/vendas' }
    }
    if (auth.userRole === 'PORTEIRO') {
      return { path: '/porteiro' }
    }
  }

  // VENDEDOR só pode acessar /vendas
  if (auth.userRole === 'VENDEDOR' && to.path !== '/vendas') {
    console.warn('Vendedor tentando acessar área restrita, redirecionando para /vendas')
    return { path: '/vendas' }
  }

  // Verificar permissões por role
  const allowedRoles = to.meta.allowedRoles as string[] | undefined
  if (allowedRoles && allowedRoles.length > 0 && !auth.canAccessRoute(allowedRoles)) {
    console.warn(`Acesso negado: role ${auth.userRole} não tem permissão para ${to.path}`)
    // Redirecionar para página apropriada de acordo com role
    if (auth.userRole === 'VENDEDOR') {
      return { path: '/vendas' }
    }
    if (auth.userRole === 'PORTEIRO') {
      return { path: '/porteiro' }
    }
    return { path: '/dashboard' }
  }
  
  return true
})

export default router
