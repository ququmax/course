<template>
  <div class="playlist-detail-view" v-if="playlist">
    <!-- Playlist header -->
    <div class="playlist-header">
      <div class="playlist-cover">
        <img v-if="playlist.songs?.length > 0" :src="playlist.songs[0].coverLarge || playlist.songs[0].cover" :alt="playlist.name" />
        <div v-else class="empty-cover">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
      </div>
      <div class="playlist-info">
        <span class="playlist-type">{{ isChart ? '榜单' : '歌单' }}</span>
        <h1>{{ playlist.name }}</h1>
        <p v-if="playlist.description" class="description">{{ playlist.description }}</p>
        <div class="meta">
          <span>{{ playlist.songs?.length || 0 }} 首歌曲</span>
          <span v-if="playlist.updatedAt">• 更新于 {{ formatDate(playlist.updatedAt) }}</span>
        </div>
        <div class="playlist-actions">
          <button class="btn btn-primary" @click="playAll" v-if="playlist.songs?.length > 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            播放全部
          </button>
          <button class="btn btn-secondary" @click="shufflePlay" v-if="playlist.songs?.length > 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
            随机播放
          </button>
          <button class="btn btn-secondary" @click="sharePlaylist" v-if="!isChart">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Songs table -->
    <div v-if="playlist.songs?.length > 0" class="songs-section">
      <div class="songs-table">
        <div class="table-header">
          <span class="col-num">#</span>
          <span class="col-title">歌曲</span>
          <span class="col-album">专辑</span>
          <span class="col-duration">时长</span>
          <span class="col-actions"></span>
        </div>
        <div 
          v-for="(song, index) in playlist.songs" 
          :key="song.id"
          class="table-row"
          :class="{ 'playing': isCurrentSong(song.id) }"
          @click="playSong(song, index)"
        >
          <span class="col-num">{{ index + 1 }}</span>
          <span class="col-title">
            <img :src="song.coverSmall || song.cover" :alt="song.title" class="song-cover" />
            <div class="song-info">
              <span class="song-title">{{ song.title }}</span>
              <span class="song-artist">{{ song.artist }}</span>
            </div>
          </span>
          <span class="col-album">{{ song.album }}</span>
          <span class="col-duration">{{ formatDuration(song.duration) }}</span>
          <span class="col-actions">
            <button class="action-btn" @click.stop="toggleFavorite(song)" :class="{ 'active': isFavorite(song.id) }">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite(song.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button v-if="!isChart" class="action-btn" @click.stop="removeSong(song.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <p>该歌单还没有歌曲</p>
      <router-link to="/" class="btn btn-primary">添加歌曲</router-link>
    </div>
  </div>
  <div v-else class="loading-view">
    <div class="spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { useAuthStore } from '@/stores/auth'
import { musicService } from '@/services/music'
import { storeToRefs } from 'pinia'
import { formatDuration } from '@/utils/helpers'
import { useNotification } from '@/composables/useNotification'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const authStore = useAuthStore()
const notification = useNotification()

const { currentSong } = storeToRefs(playerStore)
const { isLoggedIn } = storeToRefs(authStore)

const playlist = ref(null)
const isChart = ref(false)

onMounted(async () => {
  await loadPlaylist()
})

watch(() => route.params.id, async () => {
  await loadPlaylist()
})

async function loadPlaylist() {
  const id = route.params.id
  
  // Try to find in user playlists first
  const userPlaylist = playlistStore.getPlaylistById(id)
  if (userPlaylist) {
    playlist.value = userPlaylist
    isChart.value = false
    return
  }
  
  // Try to find in charts
  const chart = await musicService.getChartById(id)
  if (chart) {
    playlist.value = chart
    isChart.value = true
  }
}

function isCurrentSong(songId) {
  return currentSong.value?.id === songId
}

function isFavorite(songId) {
  return playlistStore.isFavorite(songId)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' })
}

function playAll() {
  if (playlist.value?.songs?.length > 0) {
    playerStore.setPlaylist(playlist.value.songs, 0)
  }
}

function shufflePlay() {
  if (playlist.value?.songs?.length > 0) {
    const shuffled = [...playlist.value.songs].sort(() => Math.random() - 0.5)
    playerStore.setPlaylist(shuffled, 0)
    playerStore.setPlayMode('random')
  }
}

function playSong(song, index) {
  playerStore.playSong(song, index, playlist.value.songs)
}

function toggleFavorite(song) {
  if (!isLoggedIn.value) {
    notification.warning('请先登录以添加收藏')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  playlistStore.toggleFavorite(song)
  notification.success(isFavorite(song.id) ? '已取消收藏' : '已添加到收藏')
}

function removeSong(songId) {
  playlistStore.removeSongFromPlaylist(playlist.value.id, songId)
  notification.info('歌曲已从歌单移除')
}

function sharePlaylist() {
  const link = playlistStore.generateShareLink(playlist.value.id)
  if (link) {
    navigator.clipboard.writeText(link)
    notification.success('链接已复制到剪贴板！')
  }
}
</script>

<style scoped>
.playlist-detail-view {
  padding: 20px;
  padding-bottom: 120px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Playlist header */
.playlist-header {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
}

.playlist-cover {
  width: 220px;
  height: 220px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-cover {
  width: 100%;
  height: 100%;
  background: var(--color-background-mute);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.playlist-type {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
}

.playlist-info h1 {
  font-size: 40px;
  margin: 8px 0 12px;
  line-height: 1.1;
}

.description {
  color: var(--color-text-secondary);
  margin: 0 0 8px;
}

.meta {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.playlist-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 12px 16px;
}

.btn-secondary:hover {
  background: var(--color-background-mute);
}

/* Songs table */
.songs-table {
  background: var(--color-background-soft);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 1fr 200px 80px 80px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 1fr 200px 80px 80px;
  padding: 8px 16px;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.table-row:hover {
  background: var(--color-background-mute);
}

.table-row.playing {
  background: var(--color-primary-light);
}

.col-num {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.song-info {
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

.table-row.playing .song-title {
  color: var(--color-primary);
}

.song-artist {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.col-album {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-duration {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.col-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.2s;
}

.table-row:hover .col-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 6px;
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
  padding: 60px 20px;
  color: var(--color-text-secondary);
}

.empty-state .btn {
  margin-top: 16px;
}

/* Loading */
.loading-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .playlist-cover {
    width: 180px;
    height: 180px;
  }

  .playlist-info h1 {
    font-size: 28px;
  }

  .playlist-actions {
    justify-content: center;
  }

  .table-header {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr 60px;
    padding: 12px;
  }

  .col-num,
  .col-album {
    display: none;
  }
}
</style>
