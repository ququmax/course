<template>
  <div class="music-player" :class="{ 'minimized': isMinimized }">
    <!-- Hidden audio element -->
    <audio ref="audioElement" preload="auto"></audio>

    <!-- Main player content -->
    <div class="player-content">
      <!-- Song info -->
      <div class="song-info" v-if="currentSong">
        <img :src="currentSong.coverLarge || currentSong.cover" :alt="currentSong.title" class="song-cover" @click="goToSongDetail" />
        <div class="song-details">
          <h4 class="song-title" @click="goToSongDetail">{{ currentSong.title }}</h4>
          <p class="song-artist">{{ currentSong.artist }}</p>
        </div>
        <button class="btn-icon favorite-btn" @click="toggleFavorite" :class="{ 'active': isFavorited }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div class="song-info placeholder" v-else>
        <div class="song-cover placeholder-cover"></div>
        <div class="song-details">
          <h4 class="song-title">暂无播放</h4>
          <p class="song-artist">选择一首歌曲开始播放</p>
        </div>
      </div>

      <!-- Player controls -->
      <div class="player-controls">
        <div class="control-buttons">
          <button class="btn-icon" @click="cyclePlayMode" :title="playModeTitle">
            <svg v-if="playMode === 'sequence'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
            <svg v-else-if="playMode === 'random'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              <text x="12" y="14" font-size="8" text-anchor="middle" fill="currentColor">1</text>
            </svg>
          </button>
          
          <button class="btn-icon" @click="playPrevious" :disabled="!hasPrevious">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"></line>
            </svg>
          </button>
          
          <button class="btn-icon play-btn" @click="togglePlay" :disabled="!currentSong">
            <svg v-if="isLoading" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <svg v-else-if="isPlaying" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          
          <button class="btn-icon" @click="playNext" :disabled="!hasNext">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"></line>
            </svg>
          </button>
          
          <button class="btn-icon" @click="toggleLyrics" :class="{ 'active': showLyrics }">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </button>
        </div>

        <!-- Progress bar -->
        <div class="progress-container">
          <span class="time current">{{ formattedCurrentTime }}</span>
          <div class="progress-bar" @click="seekToPosition" ref="progressBar">
            <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
            <div class="progress-played" :style="{ width: progress + '%' }"></div>
            <div class="progress-handle" :style="{ left: progress + '%' }"></div>
          </div>
          <span class="time duration">{{ formattedDuration }}</span>
        </div>
      </div>

      <!-- Extra controls -->
      <div class="extra-controls">
        <!-- Playback speed -->
        <div class="speed-control">
          <button class="btn-icon btn-text" @click="cycleSpeed">{{ playbackSpeed }}x</button>
        </div>

        <!-- Volume control -->
        <div class="volume-control">
          <button class="btn-icon" @click="toggleMute">
            <svg v-if="isMuted || volume === 0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
            <svg v-else-if="volume < 0.5" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            :value="volume"
            @input="setVolume($event.target.value)"
            class="volume-slider"
          />
        </div>

        <!-- Playlist toggle -->
        <button class="btn-icon" @click="togglePlaylistPanel" :class="{ 'active': showPlaylist }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Playlist panel -->
    <div class="playlist-panel" v-if="showPlaylist">
      <div class="panel-header">
        <h3>当前播放列表</h3>
        <button class="btn-icon" @click="clearPlaylist" title="清空列表">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
      <div class="playlist-songs">
        <div 
          v-for="(song, index) in playlist" 
          :key="song.id"
          class="playlist-item"
          :class="{ 'active': currentIndex === index }"
          @click="playSongFromPlaylist(song, index)"
        >
          <span class="song-index">{{ index + 1 }}</span>
          <img :src="song.coverSmall || song.cover" :alt="song.title" class="mini-cover" />
          <div class="song-info">
            <span class="title">{{ song.title }}</span>
            <span class="artist">{{ song.artist }}</span>
          </div>
          <button class="btn-icon remove-btn" @click.stop="removeFromPlaylist(song.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <p v-if="playlist.length === 0" class="empty-message">播放列表为空</p>
      </div>
    </div>

    <!-- Lyrics panel -->
    <LyricsPanel v-if="showLyrics && currentSong" :lyrics="currentSong.lyrics" :currentTime="currentTime" @seek="seek" />

    <!-- Error toast -->
    <div v-if="error" class="player-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore, PLAY_MODE, PLAYBACK_SPEED } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import LyricsPanel from './LyricsPanel.vue'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const authStore = useAuthStore()
const notification = useNotification()

const audioElement = ref(null)
const progressBar = ref(null)

const {
  currentSong,
  playlist,
  currentIndex,
  isPlaying,
  isLoading,
  duration,
  currentTime,
  buffered,
  volume,
  isMuted,
  playMode,
  playbackSpeed,
  showLyrics,
  isMinimized,
  showPlaylist,
  error,
  progress,
  formattedCurrentTime,
  formattedDuration,
  hasPrevious,
  hasNext
} = storeToRefs(playerStore)

const isFavorited = computed(() => {
  return currentSong.value ? playlistStore.isFavorite(currentSong.value.id) : false
})

const bufferedPercent = computed(() => {
  if (duration.value === 0) return 0
  return (buffered.value / duration.value) * 100
})

const playModeTitle = computed(() => {
  const titles = {
    [PLAY_MODE.SEQUENCE]: 'Sequential Play',
    [PLAY_MODE.RANDOM]: 'Shuffle',
    [PLAY_MODE.LOOP]: 'Repeat One'
  }
  return titles[playMode.value]
})

onMounted(() => {
  if (audioElement.value) {
    playerStore.initAudio(audioElement.value)
  }
})

function togglePlay() {
  playerStore.togglePlay()
}

function playPrevious() {
  playerStore.playPrevious()
}

function playNext() {
  playerStore.playNext()
}

function cyclePlayMode() {
  playerStore.cyclePlayMode()
  const modeNames = {
    [PLAY_MODE.SEQUENCE]: 'Sequential',
    [PLAY_MODE.RANDOM]: 'Shuffle',
    [PLAY_MODE.LOOP]: 'Repeat One'
  }
  notification.info(`Play mode: ${modeNames[playMode.value]}`)
}

function toggleMute() {
  playerStore.toggleMute()
}

function setVolume(value) {
  playerStore.setVolume(parseFloat(value))
}

function cycleSpeed() {
  const currentIdx = PLAYBACK_SPEED.indexOf(playbackSpeed.value)
  const nextIdx = (currentIdx + 1) % PLAYBACK_SPEED.length
  playerStore.setPlaybackSpeed(PLAYBACK_SPEED[nextIdx])
  notification.info(`Speed: ${PLAYBACK_SPEED[nextIdx]}x`)
}

function seekToPosition(event) {
  if (!progressBar.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  playerStore.seekToPercent(percent * 100)
}

function seek(time) {
  playerStore.seek(time)
}

function toggleLyrics() {
  playerStore.showLyrics = !playerStore.showLyrics
}

function togglePlaylistPanel() {
  playerStore.showPlaylist = !playerStore.showPlaylist
}

function toggleFavorite() {
  if (!currentSong.value) return
  
  if (!authStore.isLoggedIn) {
    notification.warning('Please login to add favorites')
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }

  const result = playlistStore.toggleFavorite(currentSong.value)
  if (result.success) {
    notification.success(isFavorited.value ? 'Removed from favorites' : 'Added to favorites')
  }
}

function playSongFromPlaylist(song, index) {
  playerStore.playSong(song, index)
}

function removeFromPlaylist(songId) {
  playerStore.removeFromPlaylist(songId)
}

function clearPlaylist() {
  playerStore.clearPlaylist()
  notification.info('Playlist cleared')
}

function goToSongDetail() {
  if (currentSong.value) {
    router.push({ name: 'SongDetail', params: { id: currentSong.value.id } })
  }
}
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
  padding: 12px 20px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.player-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  gap: 20px;
}

/* Song info */
.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  max-width: 300px;
}

.song-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.song-cover:hover {
  transform: scale(1.05);
}

.placeholder-cover {
  width: 56px;
  height: 56px;
  background: var(--color-border);
  border-radius: 8px;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-title:hover {
  color: var(--color-primary);
}

.song-artist {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-btn.active {
  color: #ff4757;
}

/* Player controls */
.player-controls {
  flex: 1;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: var(--color-background-mute);
  color: var(--color-primary);
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon.active {
  color: var(--color-primary);
}

.play-btn {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  color: white;
}

.play-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  color: white;
  transform: scale(1.05);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Progress bar */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time {
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 40px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-bar:hover {
  height: 6px;
}

.progress-buffered {
  position: absolute;
  height: 100%;
  background: var(--color-background-mute);
  border-radius: 2px;
}

.progress-played {
  position: absolute;
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
}

.progress-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

/* Extra controls */
.extra-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  justify-content: flex-end;
}

.btn-text {
  font-size: 12px;
  font-weight: 600;
  min-width: 40px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: var(--color-border);
  border-radius: 2px;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
}

/* Playlist panel */
.playlist-panel {
  position: absolute;
  bottom: 100%;
  right: 20px;
  width: 360px;
  max-height: 400px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
}

.playlist-songs {
  max-height: 340px;
  overflow-y: auto;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.playlist-item:hover {
  background: var(--color-background-mute);
}

.playlist-item.active {
  background: var(--color-primary-light);
}

.song-index {
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 20px;
}

.mini-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.playlist-item .song-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.playlist-item .title {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-item .artist {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.remove-btn {
  opacity: 0;
  padding: 4px;
}

.playlist-item:hover .remove-btn {
  opacity: 1;
}

.empty-message {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* Player error */
.player-error {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4757;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 768px) {
  .player-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .song-info {
    order: 1;
    flex: 1;
  }

  .player-controls {
    order: 3;
    flex: 100%;
    max-width: none;
  }

  .extra-controls {
    order: 2;
    min-width: auto;
  }

  .volume-slider {
    display: none;
  }

  .speed-control {
    display: none;
  }
}
</style>
