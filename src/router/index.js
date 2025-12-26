import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/song/:id',
    name: 'SongDetail',
    component: () => import('@/views/SongDetailView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/playlist/:id',
    name: 'PlaylistDetail',
    component: () => import('@/views/PlaylistDetailView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/my-playlists',
    name: 'MyPlaylists',
    component: () => import('@/views/MyPlaylistsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/HistoryView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/charts',
    name: 'Charts',
    component: () => import('@/views/ChartsView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/genre/:genre',
    name: 'Genre',
    component: () => import('@/views/GenreView.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  // 使用 hash 模式以支持 GitHub Pages 静态托管
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // Redirect to login with return URL
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Redirect logged-in users away from login/register pages
  if (to.meta.hideForAuth && authStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router
