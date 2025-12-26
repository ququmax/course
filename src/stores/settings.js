import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // Theme settings
  const theme = ref(localStorage.getItem('theme') || 'light')
  const isDarkMode = computed(() => theme.value === 'dark')

  // Display preferences
  const showNotifications = ref(localStorage.getItem('notifications') !== 'false')
  const compactMode = ref(localStorage.getItem('compactMode') === 'true')

  // Initialize theme on app load
  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      theme.value = savedTheme
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme()
  }

  // Apply theme to document
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  // Toggle theme
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    applyTheme()
  }

  // Set specific theme
  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  // Notifications
  function setShowNotifications(value) {
    showNotifications.value = value
    localStorage.setItem('notifications', value.toString())
  }

  // Compact mode
  function setCompactMode(value) {
    compactMode.value = value
    localStorage.setItem('compactMode', value.toString())
  }

  // Watch theme changes
  watch(theme, () => {
    applyTheme()
  })

  return {
    // State
    theme,
    isDarkMode,
    showNotifications,
    compactMode,
    // Actions
    initializeTheme,
    toggleTheme,
    setTheme,
    setShowNotifications,
    setCompactMode
  }
})
