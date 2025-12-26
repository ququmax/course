<template>
  <div class="song-detail-view" v-if="song">
    <!-- Song header -->
    <div class="song-header">
      <div class="song-cover-container">
        <img :src="song.coverLarge || song.cover" :alt="song.title" class="song-cover" />
        <div class="cover-overlay" @click="togglePlay">
          <svg v-if="isPlaying && isCurrentSong" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>
      <div class="song-info">
        <span class="song-type">歌曲</span>
        <h1 class="song-title">{{ song.title }}</h1>
        <div class="song-meta">
          <span class="artist">{{ song.artist }}</span>
          <span class="divider">•</span>
          <span class="album">{{ song.album }}</span>
          <span class="divider">•</span>
          <span class="year">{{ song.year }}</span>
          <span class="divider">•</span>
          <span class="duration">{{ formatDuration(song.duration) }}</span>
        </div>
        <div class="song-stats">
          <span class="play-count">{{ formatPlayCount(song.playCount) }} 次播放</span>
        </div>
        <div class="song-actions">
          <button class="btn btn-primary" @click="playSong">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            {{ isPlaying && isCurrentSong ? '暂停' : '播放' }}
          </button>
          <button class="btn btn-secondary" @click="toggleFavorite" :class="{ 'active': isFavorited }">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button class="btn btn-secondary" @click="addToPlaylist">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="btn btn-secondary" @click="shareSong">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    <!-- Tabs -->
    <div class="tabs">
      <button :class="{ 'active': activeTab === 'lyrics' }" @click="activeTab = 'lyrics'">歌词</button>
      <button v-if="song.hasVideo" :class="{ 'active': activeTab === 'video' }" @click="activeTab = 'video'">MV</button>
      <button :class="{ 'active': activeTab === 'similar' }" @click="activeTab = 'similar'">相似歌曲</button>
    </div>

    <!-- Tab content -->
    <div class="tab-content">
      <!-- Lyrics tab -->
      <div v-if="activeTab === 'lyrics'" class="lyrics-section">
        <div v-if="parsedLyrics.length > 0" class="lyrics-display">
          <p 
            v-for="(line, index) in parsedLyrics" 
            :key="index"
            :class="{ 'active': index === currentLyricIndex }"
            @click="seekToLyric(line.time)"
          >
            {{ line.text || '♪' }}
          </p>
        </div>
        <div v-else class="no-lyrics">
          <p>暂无歌词</p>
        </div>
      </div>

      <!-- Video tab -->
      <div v-if="activeTab === 'video' && song.hasVideo" class="video-section">
        <video 
          ref="videoPlayer"
          :src="song.videoUrl" 
          controls 
          :poster="song.cover"
          class="video-player"
        ></video>
      </div>

      <!-- Similar songs tab -->
      <div v-if="activeTab === 'similar'" class="similar-section">
        <div class="songs-grid">
          <SongCard 
            v-for="(similarSong, index) in similarSongs" 
            :key="similarSong.id"
            :song="similarSong"
            :playlist="similarSongs"
            :index="index"
          />
        </div>
        <p v-if="similarSongs.length === 0" class="no-similar">暂无相似歌曲</p>
      </div>
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
import { formatDuration, formatPlayCount, parseLyrics, findCurrentLyricIndex } from '@/utils/helpers'
import { useNotification } from '@/composables/useNotification'
import SongCard from '@/components/SongCard.vue'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const authStore = useAuthStore()
const notification = useNotification()

const { currentSong, isPlaying, currentTime } = storeToRefs(playerStore)
const { isLoggedIn } = storeToRefs(authStore)

const song = ref(null)
const similarSongs = ref([])
const activeTab = ref('lyrics')
const videoPlayer = ref(null)

const isCurrentSong = computed(() => currentSong.value?.id === song.value?.id)
const isFavorited = computed(() => song.value ? playlistStore.isFavorite(song.value.id) : false)
const parsedLyrics = computed(() => song.value ? parseLyrics(song.value.lyrics) : [])
const currentLyricIndex = computed(() => {
  if (!isCurrentSong.value) return -1
  return findCurrentLyricIndex(parsedLyrics.value, currentTime.value)
})

onMounted(async () => {
  await loadSong()
})

watch(() => route.params.id, async () => {
  await loadSong()
})

async function loadSong() {
  const songId = route.params.id
  song.value = await musicService.getSongById(songId)
  
  if (song.value) {
    similarSongs.value = await musicService.getSimilarSongs(songId)
  }
}

function playSong() {
  if (isCurrentSong.value) {
    playerStore.togglePlay()
  } else {
    playerStore.playSong(song.value, 0, [song.value])
  }
}

function togglePlay() {
  playSong()
}

function toggleFavorite() {
  if (!isLoggedIn.value) {
    notification.warning('请先登录以添加收藏')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  playlistStore.toggleFavorite(song.value)
  notification.success(isFavorited.value ? '已取消收藏' : '已添加到收藏')
}

function addToPlaylist() {
  if (!isLoggedIn.value) {
    notification.warning('请先登录以创建歌单')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  // Navigate to playlists with song to add
  router.push({ name: 'MyPlaylists', query: { addSong: song.value.id } })
}

function shareSong() {
  const url = window.location.href
  if (navigator.share) {
    navigator.share({
      title: song.value.title,
      text: `听听这首歌："${song.value.title}" - ${song.value.artist}`,
      url: url
    })
  } else {
    navigator.clipboard.writeText(url)
    notification.success('链接已复制到剪贴板！')
  }
}

function seekToLyric(time) {
  if (isCurrentSong.value) {
    playerStore.seek(time)
  }
}
</script>

<style scoped>
.song-detail-view {
  padding: 20px;
  padding-bottom: 120px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Song header */
.song-header {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
}

.song-cover-container {
  position: relative;
  width: 280px;
  height: 280px;
  flex-shrink: 0;
}

.song-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
}

.song-cover-container .cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  color: white;
}

.song-cover-container:hover .cover-overlay {
  opacity: 1;
}

.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.song-type {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
}

.song-title {
  font-size: 48px;
  margin: 8px 0 16px;
  line-height: 1.1;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.song-meta .divider {
  color: var(--color-text-muted);
}

.song-meta .artist {
  font-weight: 600;
  color: var(--color-text);
}

.song-stats {
  margin: 16px 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.song-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
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
  transform: scale(1.02);
}

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 12px 16px;
}

.btn-secondary:hover {
  background: var(--color-background-mute);
}

.btn-secondary.active {
  color: #ff4757;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
}

.tabs button {
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  margin-bottom: -1px;
}

.tabs button:hover {
  color: var(--color-text);
}

.tabs button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Lyrics section */
.lyrics-section {
  padding: 20px 0;
}

.lyrics-display {
  max-width: 600px;
}

.lyrics-display p {
  margin: 16px 0;
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.lyrics-display p:hover {
  color: var(--color-text);
}

.lyrics-display p.active {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 20px;
}

.no-lyrics {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
}

/* Video section */
.video-section {
  max-width: 800px;
}

.video-player {
  width: 100%;
  border-radius: 16px;
  background: #000;
}

/* Similar songs */
.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.no-similar {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
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
  .song-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .song-cover-container {
    width: 200px;
    height: 200px;
  }

  .song-title {
    font-size: 32px;
  }

  .song-meta {
    justify-content: center;
    flex-wrap: wrap;
  }

  .song-actions {
    justify-content: center;
  }
}
</style>
