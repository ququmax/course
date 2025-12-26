import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'
import { usePlaylistStore } from './stores/playlist'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const playlistStore = usePlaylistStore()

// Initialize authentication from storage
authStore.initializeAuth()

// Initialize theme
settingsStore.initializeTheme()

// Initialize playlist data if logged in
if (authStore.isLoggedIn) {
  playlistStore.initialize()
}

app.mount('#app')

// Remove loading state
const appEl = document.getElementById('app')
if (appEl) {
  appEl.classList.remove('app-loading')
}
