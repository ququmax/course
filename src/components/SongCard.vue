<template>
  <div 
    class="song-card" 
    @click="handleClick" 
    @mouseenter="isHovered = true" 
    @mouseleave="isHovered = false"
    tabindex="0"
    role="article"
    :aria-label="`${song.title} - ${song.artist}`"
    @keydown.enter="handleClick"
    @keydown.space.prevent="togglePlayPause"
  >
    <div class="cover-container">
      <img 
        :src="song.cover" 
        :alt="song.title" 
        class="cover" 
        loading="lazy"
        decoding="async"
        width="180"
        height="180"
      />
      <div class="cover-overlay" :class="{ 'visible': isHovered || isCurrentSong }">
        <button 
          class="play-overlay-btn" 
          @click.stop="togglePlayPause"
          :aria-label="isPlaying && isCurrentSong ? '暂停' : '播放'"
        >
          <svg v-if="isPlaying && isCurrentSong" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>
      <div class="quick-actions" :class="{ 'visible': isHovered }">
        <button class="action-btn" @click.stop="handleFavorite" :aria-label="isFavorited ? '取消收藏' : '添加收藏'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" :class="{ 'favorited': isFavorited }" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <button class="action-btn" @click.stop="showAddToPlaylist = true" aria-label="添加到歌单">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button class="action-btn" @click.stop="handleNotInterested" aria-label="不感兴趣">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </button>
      </div>
    </div>
    <div class="song-info">
      <h3 class="title">{{ song.title }}</h3>
      <p class="artist">{{ song.artist }}</p>
    </div>

    <!-- Add to playlist modal -->
    <div v-if="showAddToPlaylist" class="modal-overlay" @click.stop="showAddToPlaylist = false">
      <div class="playlist-modal" @click.stop>
        <h4>添加到歌单</h4>
        <div class="playlist-list">
          <div 
            v-for="playlist in userPlaylists" 
            :key="playlist.id" 
            class="playlist-option"
            @click="addToPlaylist(playlist.id)"
          >
            <span>{{ playlist.name }}</span>
            <span class="song-count">{{ playlist.songs.length }} 首歌曲</span>
          </div>
          <div v-if="userPlaylists.length === 0" class="empty-playlists">
            <p>暂无歌单</p>
            <button class="btn btn-primary" @click="createNewPlaylist">新建歌单</button>
          </div>
        </div>
        <button class="btn-close" @click="showAddToPlaylist = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useNotification } from '@/composables/useNotification'

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  playlist: {
    type: Array,
    default: () => []
  },
  index: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['play', 'remove'])

const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const authStore = useAuthStore()
const notification = useNotification()

const { currentSong, isPlaying } = storeToRefs(playerStore)
const { userPlaylists } = storeToRefs(playlistStore)
const { isLoggedIn } = storeToRefs(authStore)

const isHovered = ref(false)
const showAddToPlaylist = ref(false)

const isCurrentSong = computed(() => currentSong.value?.id === props.song.id)
const isFavorited = computed(() => playlistStore.isFavorite(props.song.id))

function handleClick() {
  router.push({ name: 'SongDetail', params: { id: props.song.id } })
}

function togglePlayPause() {
  if (isCurrentSong.value) {
    playerStore.togglePlay()
  } else {
    const playlistToUse = props.playlist.length > 0 ? props.playlist : [props.song]
    playerStore.playSong(props.song, props.index, playlistToUse)
  }
}

function handleFavorite() {
  if (!isLoggedIn.value) {
    notification.warning('请先登录以添加收藏')
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }

  playlistStore.toggleFavorite(props.song)
  notification.success(isFavorited.value ? '已取消收藏' : '已添加到收藏')
}

function handleNotInterested() {
  playlistStore.markNotInterested(props.song)
  notification.info('收到！我们会减少推荐这类歌曲')
  emit('remove', props.song.id)
}

function addToPlaylist(playlistId) {
  const result = playlistStore.addSongToPlaylist(playlistId, props.song)
  if (result.success) {
    notification.success('已添加到歌单')
  }
  showAddToPlaylist.value = false
}

function createNewPlaylist() {
  showAddToPlaylist.value = false
  router.push({ name: 'MyPlaylists', query: { create: 'true' } })
}
</script>

<style scoped>
.song-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.song-card:hover {
  transform: translateY(-4px);
}

.song-card:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
  border-radius: 12px;
}

.cover-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--color-background-mute);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.cover-overlay.visible {
  opacity: 1;
}

.play-overlay-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background 0.2s;
}

.play-overlay-btn:hover {
  transform: scale(1.1);
  background: var(--color-primary-hover);
}

.quick-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.quick-actions.visible {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-background);
  color: var(--color-text);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-primary);
  color: white;
}

.action-btn .favorited {
  color: #ff4757;
}

.song-info {
  padding: 12px 4px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.playlist-modal {
  background: var(--color-background);
  border-radius: 16px;
  padding: 24px;
  min-width: 300px;
  max-width: 400px;
}

.playlist-modal h4 {
  margin: 0 0 16px;
  font-size: 18px;
}

.playlist-list {
  max-height: 300px;
  overflow-y: auto;
}

.playlist-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.playlist-option:hover {
  background: var(--color-background-soft);
}

.song-count {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.empty-playlists {
  text-align: center;
  padding: 20px;
}

.empty-playlists p {
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.btn {
  padding: 8px 16px;
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
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-close {
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  background: var(--color-background-soft);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: background 0.2s;
}

.btn-close:hover {
  background: var(--color-background-mute);
}
</style>
