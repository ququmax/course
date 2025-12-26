<template>
  <div class="history-view">
    <div class="page-header">
      <h1>播放历史</h1>
      <div class="header-actions" v-if="history.length > 0">
        <button class="btn btn-secondary" @click="playAll">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          播放全部
        </button>
        <button class="btn btn-secondary" @click="clearHistory">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          清空历史
        </button>
      </div>
    </div>

    <!-- Session notice for anonymous users -->
    <div v-if="!isLoggedIn" class="session-notice">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>关闭浏览器后历史记录将被清除。<router-link to="/login">登录</router-link>可保存您的历史记录。</span>
    </div>

    <!-- History list -->
    <div v-if="history.length > 0" class="history-list">
      <div 
        v-for="(song, index) in history" 
        :key="song.id + '-' + song.playedAt"
        class="history-item"
        @click="playSong(song, index)"
      >
        <div class="song-info">
          <img :src="song.coverSmall || song.cover" :alt="song.title" class="song-cover" />
          <div class="song-details">
            <span class="song-title">{{ song.title }}</span>
            <span class="song-artist">{{ song.artist }}</span>
          </div>
        </div>
        <span class="played-at">{{ formatPlayedAt(song.playedAt) }}</span>
        <div class="item-actions">
          <button class="action-btn" @click.stop="toggleFavorite(song)" :class="{ 'active': isFavorite(song.id) }">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite(song.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button class="action-btn" @click.stop="removeFromHistory(index)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <h2>暂无播放历史</h2>
      <p>开始播放音乐，您的历史记录将显示在这里。</p>
      <router-link to="/" class="btn btn-primary">发现音乐</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const authStore = useAuthStore()
const notification = useNotification()

const { isLoggedIn, userId } = storeToRefs(authStore)

const history = ref([])

onMounted(() => {
  loadHistory()
})

function loadHistory() {
  const historyKey = isLoggedIn.value ? `history_${userId.value}` : 'history_session'
  history.value = JSON.parse(localStorage.getItem(historyKey) || '[]')
}

function saveHistory() {
  const historyKey = isLoggedIn.value ? `history_${userId.value}` : 'history_session'
  localStorage.setItem(historyKey, JSON.stringify(history.value))
}

function isFavorite(songId) {
  return playlistStore.isFavorite(songId)
}

function formatPlayedAt(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`
  
  return new Date(timestamp).toLocaleDateString()
}

function playSong(song, index) {
  playerStore.playSong(song, index, history.value)
}

function playAll() {
  if (history.value.length > 0) {
    playerStore.setPlaylist(history.value, 0)
  }
}

function toggleFavorite(song) {
  if (!isLoggedIn.value) {
    notification.warning('Please login to add favorites')
    router.push({ name: 'Login', query: { redirect: '/history' } })
    return
  }

  playlistStore.toggleFavorite(song)
  notification.success(isFavorite(song.id) ? 'Removed from favorites' : 'Added to favorites')
}

function removeFromHistory(index) {
  history.value.splice(index, 1)
  saveHistory()
  notification.info('Removed from history')
}

function clearHistory() {
  history.value = []
  saveHistory()
  notification.success('History cleared')
}
</script>

<style scoped>
.history-view {
  padding: 20px;
  padding-bottom: 120px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h1 {
  font-size: 32px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  text-decoration: none;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.btn-secondary:hover {
  background: var(--color-background-mute);
}

.session-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-background-soft);
  border-radius: 12px;
  margin-bottom: 24px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.session-notice a {
  color: var(--color-primary);
}

/* History list */
.history-list {
  background: var(--color-background-soft);
  border-radius: 12px;
  overflow: hidden;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: var(--color-background-mute);
}

.history-item:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.song-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.song-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.played-at {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 20px;
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.history-item:hover .item-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-background);
  color: var(--color-text);
}

.action-btn.active {
  color: #ff4757;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state svg {
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.empty-state p {
  color: var(--color-text-secondary);
  margin: 0 0 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .played-at {
    display: none;
  }
}
</style>
