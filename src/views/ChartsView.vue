<template>
  <div class="charts-view">
    <h1>热门榜单</h1>
    <p class="page-description">发现当下最热门的歌曲</p>

    <!-- Charts list -->
    <div class="charts-container">
      <div 
        v-for="chart in charts" 
        :key="chart.id" 
        class="chart-section"
      >
        <div class="chart-header">
          <img :src="chart.cover" :alt="chart.name" class="chart-cover" />
          <div class="chart-info">
            <h2>{{ chart.name }}</h2>
            <p>{{ chart.description }}</p>
            <span class="meta">{{ chart.songs.length }} 首歌曲 • 更新于 {{ formatDate(chart.updatedAt) }}</span>
          </div>
          <button class="btn btn-primary" @click="playChart(chart)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            播放全部
          </button>
          <button class="btn btn-secondary" @click="shufflePlay(chart)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
            随机播放
          </button>
        </div>

        <!-- Songs table -->
        <div class="songs-table">
          <div class="table-header">
            <span class="col-num">#</span>
            <span class="col-title">歌曲</span>
            <span class="col-album">专辑</span>
            <span class="col-duration">时长</span>
            <span class="col-actions"></span>
          </div>
          <div 
            v-for="(song, index) in chart.songs" 
            :key="song.id"
            class="table-row"
            :class="{ 'playing': isCurrentSong(song.id), 'hovered': hoveredSong === song.id }"
            @mouseenter="hoveredSong = song.id"
            @mouseleave="hoveredSong = null"
            @click="playSongInChart(chart, song, index)"
          >
            <span class="col-num">
              <span class="song-number" v-if="!isCurrentSong(song.id) && hoveredSong !== song.id">{{ index + 1 }}</span>
              <button v-else class="play-btn" @click.stop="togglePlaySong(chart, song, index)">
                <svg v-if="isPlaying && isCurrentSong(song.id)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
            </span>
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
              <button class="action-btn" @click.stop="markNotInterested(song)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { useAuthStore } from '@/stores/auth'
import { musicService } from '@/services/music'
import { storeToRefs } from 'pinia'
import { formatDuration } from '@/utils/helpers'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const authStore = useAuthStore()
const notification = useNotification()

const { currentSong, isPlaying } = storeToRefs(playerStore)
const { isLoggedIn } = storeToRefs(authStore)

const charts = ref([])
const hoveredSong = ref(null)

onMounted(async () => {
  charts.value = await musicService.getCharts()
})

function isCurrentSong(songId) {
  return currentSong.value?.id === songId
}

function isFavorite(songId) {
  return playlistStore.isFavorite(songId)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function playChart(chart) {
  playerStore.setPlaylist(chart.songs, 0)
}

function shufflePlay(chart) {
  const shuffled = [...chart.songs].sort(() => Math.random() - 0.5)
  playerStore.setPlaylist(shuffled, 0)
  playerStore.setPlayMode('random')
}

function playSongInChart(chart, song, index) {
  playerStore.playSong(song, index, chart.songs)
}

function togglePlaySong(chart, song, index) {
  if (isCurrentSong(song.id)) {
    playerStore.togglePlay()
  } else {
    playerStore.playSong(song, index, chart.songs)
  }
}

function toggleFavorite(song) {
  if (!isLoggedIn.value) {
    notification.warning('Please login to add favorites')
    router.push({ name: 'Login', query: { redirect: '/charts' } })
    return
  }

  playlistStore.toggleFavorite(song)
  notification.success(isFavorite(song.id) ? 'Removed from favorites' : 'Added to favorites')
}

function markNotInterested(song) {
  playlistStore.markNotInterested(song)
  notification.info("Got it! We'll show less of this")
  
  // Remove from all charts display
  charts.value = charts.value.map(chart => ({
    ...chart,
    songs: chart.songs.filter(s => s.id !== song.id)
  }))
}
</script>

<style scoped>
.charts-view {
  padding: 20px;
  padding-bottom: 120px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 32px;
  margin: 0;
}

.page-description {
  color: var(--color-text-secondary);
  margin: 8px 0 32px;
}

/* Chart section */
.chart-section {
  margin-bottom: 48px;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-cover {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.chart-info {
  flex: 1;
}

.chart-info h2 {
  margin: 0;
  font-size: 24px;
}

.chart-info p {
  color: var(--color-text-secondary);
  margin: 4px 0;
}

.chart-info .meta {
  font-size: 12px;
  color: var(--color-text-muted);
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

/* Responsive */
@media (max-width: 768px) {
  .chart-header {
    flex-wrap: wrap;
  }

  .chart-cover {
    width: 80px;
    height: 80px;
  }

  .chart-info {
    flex: 100%;
    order: 1;
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
}
</style>
