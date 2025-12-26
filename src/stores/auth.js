import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const rememberMe = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const username = computed(() => user.value?.username || 'Guest')
  const userId = computed(() => user.value?.id || null)

  // Initialize from storage
  function initializeAuth() {
    const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
    const storedRemember = localStorage.getItem('auth_remember') === 'true'

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      rememberMe.value = storedRemember
    }
  }

  // Login action
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      // Simulate API call - Replace with real API
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock user data (in real app, this comes from API)
      const mockUsers = {
        'demo': { id: 1, username: 'demo', email: 'demo@example.com', avatar: null },
        'admin': { id: 2, username: 'admin', email: 'admin@example.com', avatar: null }
      }

      if (credentials.username in mockUsers && credentials.password === '123456') {
        const userData = mockUsers[credentials.username]
        const tokenValue = 'mock_token_' + Date.now()

        user.value = userData
        token.value = tokenValue
        rememberMe.value = credentials.rememberMe || false

        // Store in appropriate storage
        const storage = credentials.rememberMe ? localStorage : sessionStorage
        storage.setItem('auth_token', tokenValue)
        storage.setItem('auth_user', JSON.stringify(userData))
        
        if (credentials.rememberMe) {
          localStorage.setItem('auth_remember', 'true')
        }

        return { success: true }
      } else {
        throw new Error('Invalid username or password')
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Register action
  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock registration (in real app, call API)
      const newUser = {
        id: Date.now(),
        username: userData.username,
        email: userData.email,
        avatar: null
      }
      const tokenValue = 'mock_token_' + Date.now()

      user.value = newUser
      token.value = tokenValue

      sessionStorage.setItem('auth_token', tokenValue)
      sessionStorage.setItem('auth_user', JSON.stringify(newUser))

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Logout action
  function logout(keepLocalHistory = false) {
    user.value = null
    token.value = null
    rememberMe.value = false

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_remember')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')

    if (!keepLocalHistory) {
      // Clear user-specific data from other stores if needed
      localStorage.removeItem('listening_history')
      localStorage.removeItem('favorites')
      localStorage.removeItem('playlists')
    }
  }

  // Validate token (for session refresh)
  async function validateToken() {
    if (!token.value) return false

    try {
      // Simulate token validation API call
      await new Promise(resolve => setTimeout(resolve, 200))
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    // State
    user,
    token,
    rememberMe,
    loading,
    error,
    // Getters
    isLoggedIn,
    username,
    userId,
    // Actions
    initializeAuth,
    login,
    register,
    logout,
    validateToken
  }
})
