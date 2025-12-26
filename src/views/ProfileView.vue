<template>
  <div class="profile-view">
    <div class="profile-header">
      <div class="user-avatar">
        {{ username.charAt(0).toUpperCase() }}
      </div>
      <div class="user-info">
        <h1>{{ username }}</h1>
        <p>{{ user?.email }}</p>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="stats-section">
      <h2>你的音乐统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalListeningTime }}</span>
            <span class="stat-label">总收听时长</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ favorites.length }}</span>
            <span class="stat-label">收藏歌曲</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ playlists.length }}</span>
            <span class="stat-label">创建的歌单</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.songsPlayed }}</span>
            <span class="stat-label">播放歌曲</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top artists -->
    <div class="top-section">
      <h2>最常听的艺人</h2>
      <div class="top-artists">
        <div v-for="artist in topArtists" :key="artist.name" class="artist-card">
          <div class="artist-avatar">{{ artist.name.charAt(0) }}</div>
          <span class="artist-name">{{ artist.name }}</span>
          <span class="play-count">{{ artist.playCount }} 次播放</span>
        </div>
      </div>
    </div>

    <!-- Top genres -->
    <div class="top-section">
      <h2>最常听的风格</h2>
      <div class="genres-list">
        <div v-for="genre in topGenres" :key="genre.name" class="genre-bar">
          <span class="genre-name">{{ genre.name }}</span>
          <div class="genre-progress">
            <div class="genre-fill" :style="{ width: genre.percentage + '%' }"></div>
          </div>
          <span class="genre-count">{{ genre.count }}</span>
        </div>
      </div>
    </div>

    <!-- Account actions -->
    <div class="account-section">
      <h2>账号</h2>
      <div class="account-actions">
        <router-link to="/settings" class="account-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          设置
        </router-link>
        <button class="account-link danger" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          退出登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlaylistStore } from '@/stores/playlist'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const playlistStore = usePlaylistStore()

const { user, username, userId } = storeToRefs(authStore)
const { favorites, userPlaylists: playlists } = storeToRefs(playlistStore)

const stats = ref({
  totalListeningTime: '0h 0m',
  songsPlayed: 0
})

const topArtists = ref([])
const topGenres = ref([])

onMounted(() => {
  calculateStats()
})

function calculateStats() {
  // Load history and calculate stats
  const historyKey = `history_${userId.value}`
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]')
  
  stats.value.songsPlayed = history.length
  
  // Calculate total listening time (estimate: average 3 min per song)
  const totalMinutes = history.length * 3
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  stats.value.totalListeningTime = `${hours}h ${minutes}m`
  
  // Calculate top artists
  const artistCounts = {}
  history.forEach(song => {
    artistCounts[song.artist] = (artistCounts[song.artist] || 0) + 1
  })
  
  topArtists.value = Object.entries(artistCounts)
    .map(([name, playCount]) => ({ name, playCount }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5)
  
  // Calculate top genres
  const genreCounts = {}
  history.forEach(song => {
    if (song.genre) {
      genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1
    }
  })
  
  const maxGenre = Math.max(...Object.values(genreCounts), 1)
  topGenres.value = Object.entries(genreCounts)
    .map(([name, count]) => ({ 
      name, 
      count, 
      percentage: (count / maxGenre) * 100 
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.profile-view {
  padding: 20px;
  padding-bottom: 120px;
  max-width: 900px;
  margin: 0 auto;
}

/* Profile header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 600;
}

.user-info h1 {
  margin: 0;
  font-size: 32px;
}

.user-info p {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
}

/* Stats section */
.stats-section,
.top-section,
.account-section {
  margin-bottom: 40px;
}

.stats-section h2,
.top-section h2,
.account-section h2 {
  font-size: 20px;
  margin: 0 0 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-background-soft);
  padding: 20px;
  border-radius: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Top artists */
.top-artists {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.artist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--color-background-soft);
  border-radius: 12px;
  min-width: 100px;
}

.artist-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
}

.artist-name {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.play-count {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Top genres */
.genres-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.genre-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.genre-name {
  min-width: 100px;
  font-size: 14px;
}

.genre-progress {
  flex: 1;
  height: 8px;
  background: var(--color-background-mute);
  border-radius: 4px;
  overflow: hidden;
}

.genre-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.genre-count {
  min-width: 40px;
  text-align: right;
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Account section */
.account-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-background-soft);
  border-radius: 10px;
  text-decoration: none;
  color: var(--color-text);
  font-size: 15px;
  cursor: pointer;
  border: none;
  width: 100%;
  text-align: left;
  transition: background 0.2s;
}

.account-link:hover {
  background: var(--color-background-mute);
}

.account-link.danger {
  color: #ff4757;
}
</style>
