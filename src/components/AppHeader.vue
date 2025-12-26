<template>
  <header class="app-header" role="banner">
    <div class="header-left">
      <router-link to="/" class="logo" aria-label="返回首页">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>音乐</span>
      </router-link>
    </div>

    <nav class="header-nav" role="navigation" aria-label="主导航">
      <router-link to="/" class="nav-link">首页</router-link>
      <router-link to="/charts" class="nav-link">排行榜</router-link>
      <router-link v-if="isLoggedIn" to="/my-playlists" class="nav-link">我的歌单</router-link>
      <router-link v-if="isLoggedIn" to="/favorites" class="nav-link">我的收藏</router-link>
      <router-link to="/history" class="nav-link">播放历史</router-link>
    </nav>

    <div class="header-right">
      <!-- Search -->
      <div class="search-box" role="search">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="search" 
          v-model="searchQuery" 
          placeholder="搜索歌曲..."
          @keyup.enter="handleSearch"
          @keydown="handleKeydown"
          @focus="showSearchResults = true"
          aria-label="搜索歌曲"
          autocomplete="off"
        />
        <!-- Loading indicator -->
        <div v-if="isSearching" class="search-spinner"></div>
        <!-- Search results dropdown -->
        <div v-if="showSearchResults && searchResults.length > 0" class="search-results" role="listbox" aria-label="搜索结果">
          <div 
            v-for="(song, index) in searchResults.slice(0, 6)" 
            :key="song.id" 
            class="search-result-item"
            :class="{ 'highlighted': highlightedIndex === index }"
            @click="playSong(song)"
            @mouseenter="highlightedIndex = index"
            role="option"
            tabindex="0"
            @keydown.enter="playSong(song)"
          >
            <img 
              :src="song.coverSmall || song.cover" 
              :alt="song.title" 
              class="result-cover" 
              loading="lazy"
              width="40"
              height="40"
            />
            <div class="result-info">
              <span class="result-title">{{ song.title }}</span>
              <span class="result-artist">{{ song.artist }}</span>
            </div>
          </div>
          <div v-if="searchResults.length > 6" class="search-more" @click="handleSearch" tabindex="0" @keydown.enter="handleSearch">
            查看全部结果
          </div>
        </div>
      </div>

      <!-- Theme toggle -->
      <button class="btn-icon" @click="toggleTheme" :aria-label="isDarkMode ? '切换到亮色模式' : '切换到暗色模式'">
        <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <!-- User menu -->
      <div class="user-menu" v-if="isLoggedIn">
        <button class="user-btn" @click="showUserMenu = !showUserMenu">
          <div class="user-avatar">
            {{ username.charAt(0).toUpperCase() }}
          </div>
          <span class="username">{{ username }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div v-if="showUserMenu" class="user-dropdown">
          <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            个人中心
          </router-link>
          <router-link to="/settings" class="dropdown-item" @click="showUserMenu = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            设置
          </router-link>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            退出登录
          </button>
        </div>
      </div>
      <div class="auth-buttons" v-else>
        <router-link to="/login" class="btn btn-secondary">登录</router-link>
        <router-link to="/register" class="btn btn-primary">注册</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { usePlayerStore } from '@/stores/player'
import { musicService } from '@/services/music'
import { storeToRefs } from 'pinia'
import { debounce } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const playerStore = usePlayerStore()

const { isLoggedIn, username } = storeToRefs(authStore)
const { isDarkMode } = storeToRefs(settingsStore)

const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const showUserMenu = ref(false)
const isSearching = ref(false)
const highlightedIndex = ref(-1)

// Debounced search with loading state
const debouncedSearch = debounce(async (query) => {
  if (query.length < 2) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  isSearching.value = true
  try {
    // Use autocomplete function from music service
    searchResults.value = await musicService.searchAutocomplete(query, 6)
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isSearching.value = false
  }
}, 200)

watch(searchQuery, (newQuery) => {
  highlightedIndex.value = -1
  if (newQuery.length >= 2) {
    isSearching.value = true
  }
  debouncedSearch(newQuery)
})

function handleSearch() {
  if (searchQuery.value.trim()) {
    // Navigate to search results page
    router.push({ name: 'Search', query: { q: searchQuery.value.trim() } })
    showSearchResults.value = false
    searchQuery.value = ''
    searchResults.value = []
  }
}

function handleKeydown(e) {
  if (!showSearchResults.value || searchResults.value.length === 0) return
  
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, searchResults.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
  } else if (e.key === 'Enter' && highlightedIndex.value >= 0) {
    e.preventDefault()
    playSong(searchResults.value[highlightedIndex.value])
  } else if (e.key === 'Escape') {
    showSearchResults.value = false
  }
}

function playSong(song) {
  playerStore.playSong(song, 0, [song])
  showSearchResults.value = false
  searchQuery.value = ''
  searchResults.value = []
}

function viewSong(song) {
  router.push({ name: 'SongDetail', params: { id: song.id } })
  showSearchResults.value = false
  searchQuery.value = ''
  searchResults.value = []
}

function toggleTheme() {
  settingsStore.toggleTheme()
}

function handleLogout() {
  authStore.logout()
  showUserMenu.value = false
  router.push('/')
}

// Close dropdowns when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest('.user-menu')) {
    showUserMenu.value = false
  }
  if (!event.target.closest('.search-box')) {
    showSearchResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text);
  font-weight: 700;
  font-size: 20px;
}

.logo svg {
  color: var(--color-primary);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--color-text);
  background: var(--color-background-soft);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Search */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-background-soft);
  border-radius: 20px;
  padding: 8px 16px;
  gap: 8px;
}

.search-box svg {
  color: var(--color-text-secondary);
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  width: 200px;
  font-size: 14px;
  color: var(--color-text);
}

.search-box input::placeholder {
  color: var(--color-text-muted);
}

.search-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover,
.search-result-item.highlighted {
  background: var(--color-background-soft);
}

.result-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.result-title {
  font-size: 13px;
  font-weight: 500;
}

.result-artist {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.search-more {
  padding: 12px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-primary);
  cursor: pointer;
  border-top: 1px solid var(--color-border);
  transition: background 0.2s;
}

.search-more:hover {
  background: var(--color-background-soft);
}

/* Theme toggle */
.btn-icon {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--color-background-soft);
  color: var(--color-primary);
}

/* User menu */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background 0.2s;
}

.user-btn:hover {
  background: var(--color-background-soft);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  min-width: 180px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--color-background-soft);
}

.dropdown-item.logout {
  color: #ff4757;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}

/* Auth buttons */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-background-soft);
}

/* Responsive */
@media (max-width: 768px) {
  .header-nav {
    display: none;
  }

  .search-box input {
    width: 120px;
  }

  .username {
    display: none;
  }
}
</style>
