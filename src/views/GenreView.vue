<template>
  <div class="genre-view">
    <!-- Genre Header -->
    <header 
      class="genre-header" 
      :style="{ background: genreInfo?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    >
      <div class="header-content">
        <h1>{{ genreInfo?.name || genreName }}</h1>
        <p class="song-count">{{ songs.length }} 首歌曲</p>
        <div class="header-actions" v-if="songs.length > 0">
          <button class="btn btn-primary" @click="playAll" aria-label="播放全部">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            播放全部
          </button>
          <button class="btn btn-secondary" @click="shufflePlay" aria-label="随机播放">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
            随机播放
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state" aria-busy="true" aria-live="polite">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="songs.length === 0 && !isLoading" class="empty-state" role="status">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9 9h.01M15 9h.01M9 15c.83.67 1.83 1 3 1s2.17-.33 3-1"></path>
      </svg>
      <h3>暂无歌曲</h3>
      <p>该风格下暂无可用歌曲，试试搜索其他内容吧</p>
      <button class="btn btn-primary" @click="searchGenre">搜索 {{ genreInfo?.name || genreName }}</button>
    </div>

    <!-- Songs List -->
    <div v-else class="songs-container">
      <div class="songs-table" role="table" aria-label="歌曲列表">
        <div class="table-header" role="row">
          <span class="col-num" role="columnheader">#</span>
          <span class="col-title" role="columnheader">歌曲</span>
          <span class="col-album" role="columnheader">专辑</span>
          <span class="col-duration" role="columnheader">时长</span>
          <span class="col-actions" role="columnheader"></span>
        </div>
        <div 
          v-for="(song, index) in songs" 
          :key="song.id"
          class="table-row"
          role="row"
          :class="{ 'playing': isCurrentSong(song.id), 'hovered': hoveredSong === song.id }"
          @mouseenter="hoveredSong = song.id"
          @mouseleave="hoveredSong = null"
          @click="playSong(song, index)"
          tabindex="0"
          @keydown.enter="playSong(song, index)"
          @keydown.space.prevent="playSong(song, index)"
        >
          <span class="col-num" role="cell">
            <span class="song-number" v-if="!isCurrentSong(song.id) && hoveredSong !== song.id">{{ index + 1 }}</span>
            <button v-else class="play-btn" @click.stop="togglePlaySong(song, index)" :aria-label="isPlaying && isCurrentSong(song.id) ? '暂停' : '播放'">
              <svg v-if="isPlaying && isCurrentSong(song.id)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          </span>
          <span class="col-title" role="cell">
            <img 
              :src="song.coverSmall || song.cover" 
              :alt="song.title" 
              class="song-cover" 
              loading="lazy"
              decoding="async"
              width="48"
              height="48"
            />
            <div class="song-info">
              <span class="song-title">{{ song.title }}</span>
              <span class="song-artist">{{ song.artist }}</span>
            </div>
          </span>
          <span class="col-album" role="cell">{{ song.album }}</span>
          <span class="col-duration" role="cell">{{ formatDuration(song.duration) }}</span>
          <span class="col-actions" role="cell">
            <button 
              class="action-btn" 
              @click.stop="toggleFavorite(song)" 
              :class="{ 'active': isFavorite(song.id) }"
              :aria-label="isFavorite(song.id) ? '取消收藏' : '添加收藏'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite(song.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button 
              class="action-btn" 
              @click.stop="viewSongDetail(song.id)"
              aria-label="查看详情"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Related Genres -->
    <section class="related-section" v-if="relatedGenres.length > 0">
      <h2>相关风格</h2>
      <div class="related-genres">
        <router-link 
          v-for="genre in relatedGenres" 
          :key="genre.name" 
          :to="{ name: 'Genre', params: { genre: genre.name } }"
          class="related-genre-card"
          :style="{ background: genre.gradient }"
        >
          {{ genre.name }}
        </router-link>
      </div>
    </section>
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

const { currentSong, isPlaying } = storeToRefs(playerStore)
const { isLoggedIn } = storeToRefs(authStore)

const songs = ref([])
const isLoading = ref(true)
const hoveredSong = ref(null)

// Genre mapping with search terms
const genreMap = {
  '电子音乐': { name: '电子音乐', searchTerm: 'electronic', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  '流行音乐': { name: '流行音乐', searchTerm: 'pop', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  '摇滚乐': { name: '摇滚乐', searchTerm: 'rock', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  '嘻哈': { name: '嘻哈', searchTerm: 'hip hop', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  '爵士乐': { name: '爵士乐', searchTerm: 'jazz', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  '古典乐': { name: '古典乐', searchTerm: 'classical', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
  // Fallback for URL-decoded names
  'electronic': { name: '电子音乐', searchTerm: 'electronic', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  'pop': { name: '流行音乐', searchTerm: 'pop', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  'rock': { name: '摇滚乐', searchTerm: 'rock', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  'hip hop': { name: '嘻哈', searchTerm: 'hip hop', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  'jazz': { name: '爵士乐', searchTerm: 'jazz', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  'classical': { name: '古典乐', searchTerm: 'classical', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' }
}

const allGenres = [
  { name: '电子音乐', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '流行音乐', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: '摇滚乐', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: '嘻哈', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: '爵士乐', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: '古典乐', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' }
]

const genreName = computed(() => decodeURIComponent(route.params.genre || ''))
const genreInfo = computed(() => genreMap[genreName.value] || { name: genreName.value, searchTerm: genreName.value, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' })

const relatedGenres = computed(() => {
  return allGenres.filter(g => g.name !== genreInfo.value.name).slice(0, 4)
})

onMounted(() => {
  loadSongs()
})

watch(() => route.params.genre, () => {
  loadSongs()
})

async function loadSongs() {
  isLoading.value = true
  songs.value = []
  
  try {
    // Try to get songs by genre from local DB first
    const genreSongs = await musicService.getSongsByGenre(genreInfo.value.searchTerm)
    
    if (genreSongs.length > 0) {
      songs.value = genreSongs
    } else {
      // Search from API
      const searchResults = await musicService.searchSongs(genreInfo.value.searchTerm)
      songs.value = searchResults.slice(0, 20)
    }
  } catch (error) {
    console.error('Failed to load genre songs:', error)
    notification.error('加载歌曲失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

function isCurrentSong(songId) {
  return currentSong.value?.id === songId
}

function isFavorite(songId) {
  return playlistStore.isFavorite(songId)
}

function playAll() {
  if (songs.value.length > 0) {
    playerStore.setPlaylist(songs.value, 0)
  }
}

function shufflePlay() {
  if (songs.value.length > 0) {
    const shuffled = [...songs.value].sort(() => Math.random() - 0.5)
    playerStore.setPlaylist(shuffled, 0)
    playerStore.setPlayMode('random')
  }
}

function playSong(song, index) {
  playerStore.playSong(song, index, songs.value)
}

function togglePlaySong(song, index) {
  if (isCurrentSong(song.id)) {
    playerStore.togglePlay()
  } else {
    playerStore.playSong(song, index, songs.value)
  }
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

function viewSongDetail(songId) {
  router.push({ name: 'SongDetail', params: { id: songId } })
}

function searchGenre() {
  router.push({ name: 'Search', query: { q: genreInfo.value.searchTerm } })
}
</script>

<style scoped>
.genre-view {
  padding-bottom: 120px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.genre-header {
  padding: 60px 40px 40px;
  border-radius: 0 0 24px 24px;
  color: white;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 48px;
  margin: 0 0 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.song-count {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary {
  background: white;
  color: #333;
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state svg {
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: var(--color-text);
}

.empty-state p {
  margin: 0 0 24px;
}

/* Songs Container */
.songs-container {
  padding: 0 20px;
}

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

.table-row:hover,
.table-row:focus {
  background: var(--color-background-mute);
  outline: none;
}

.table-row.playing {
  background: var(--color-primary-light);
}

.col-num {
  display: flex;
  align-items: center;
  justify-content: center;
}

.song-number {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.play-btn {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-row.playing .play-btn {
  color: var(--color-primary);
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
  background: var(--color-background-mute);
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

.table-row:hover .col-actions,
.table-row:focus .col-actions {
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

/* Related Section */
.related-section {
  padding: 40px 20px;
}

.related-section h2 {
  font-size: 20px;
  margin: 0 0 16px;
}

.related-genres {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.related-genre-card {
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s;
}

.related-genre-card:hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 768px) {
  .genre-header {
    padding: 40px 20px 30px;
  }

  .header-content h1 {
    font-size: 32px;
  }

  .table-header {
    display: none;
  }

  .table-row {
    grid-template-columns: 40px 1fr 60px;
    padding: 12px;
  }

  .col-album {
    display: none;
  }

  .col-actions {
    opacity: 1;
  }
}
</style>
