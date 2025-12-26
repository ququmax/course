<template>
  <div class="favorites-view">
    <div class="page-header">
      <h1>我的收藏</h1>
      <div class="header-actions" v-if="favorites.length > 0">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" v-model="searchQuery" placeholder="搜索收藏..." />
        </div>
        <button class="btn btn-primary" @click="playAll">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          播放全部
        </button>
        <button class="btn btn-secondary" @click="shufflePlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    <p class="page-description">{{ favorites.length }} 首歌曲</p>

    <!-- Favorites list -->
    <div v-if="filteredFavorites.length > 0" class="favorites-list">
      <div 
        v-for="(song, index) in filteredFavorites" 
        :key="song.id"
        class="favorite-item"
        :class="{ 'playing': isCurrentSong(song.id) }"
        @click="playSong(song, index)"
      >
        <div class="song-info">
          <img :src="song.coverSmall || song.cover" :alt="song.title" class="song-cover" />
          <div class="song-details">
            <span class="song-title">{{ song.title }}</span>
            <span class="song-artist">{{ song.artist }}</span>
          </div>
        </div>
        <span class="song-album">{{ song.album }}</span>
        <span class="added-at">{{ formatAddedAt(song.addedAt) }}</span>
        <div class="item-actions">
          <button class="action-btn" @click.stop="removeFavorite(song.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="heart-filled">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button class="action-btn" @click.stop="addToPlaylist(song)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- No results -->
    <div v-else-if="searchQuery && favorites.length > 0" class="no-results">
      <p>没有找到匹配 "{{ searchQuery }}" 的歌曲</p>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <h2>暂无收藏</h2>
      <p>点击爱心图标将歌曲添加到收藏。</p>
      <router-link to="/" class="btn btn-primary">发现音乐</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { storeToRefs } from 'pinia'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const notification = useNotification()

const { currentSong } = storeToRefs(playerStore)
const { favorites } = storeToRefs(playlistStore)

const searchQuery = ref('')

const filteredFavorites = computed(() => {
  if (!searchQuery.value) return favorites.value
  return playlistStore.searchFavorites(searchQuery.value)
})

function isCurrentSong(songId) {
  return currentSong.value?.id === songId
}

function formatAddedAt(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function playSong(song, index) {
  playerStore.playSong(song, index, filteredFavorites.value)
}

function playAll() {
  if (filteredFavorites.value.length > 0) {
    playerStore.setPlaylist(filteredFavorites.value, 0)
  }
}

function shufflePlay() {
  if (filteredFavorites.value.length > 0) {
    const shuffled = [...filteredFavorites.value].sort(() => Math.random() - 0.5)
    playerStore.setPlaylist(shuffled, 0)
    playerStore.setPlayMode('random')
  }
}

function removeFavorite(songId) {
  playlistStore.removeFromFavorites(songId)
  notification.info('Removed from favorites')
}

function addToPlaylist(song) {
  router.push({ name: 'MyPlaylists', query: { addSong: song.id } })
}
</script>

<style scoped>
.favorites-view {
  padding: 20px;
  padding-bottom: 120px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

h1 {
  font-size: 32px;
  margin: 0;
}

.page-description {
  color: var(--color-text-secondary);
  margin: 0 0 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
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
  width: 150px;
  font-size: 14px;
  color: var(--color-text);
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
}

.btn-secondary:hover {
  background: var(--color-background-mute);
}

/* Favorites list */
.favorites-list {
  background: var(--color-background-soft);
  border-radius: 12px;
  overflow: hidden;
}

.favorite-item {
  display: grid;
  grid-template-columns: 1fr 200px 120px 80px;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.favorite-item:hover {
  background: var(--color-background-mute);
}

.favorite-item.playing {
  background: var(--color-primary-light);
}

.favorite-item:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.song-info {
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

.favorite-item.playing .song-title {
  color: var(--color-primary);
}

.song-artist {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.song-album {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.added-at {
  font-size: 12px;
  color: var(--color-text-muted);
}

.item-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.2s;
}

.favorite-item:hover .item-actions {
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

.heart-filled {
  color: #ff4757;
}

/* No results */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
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

  .favorite-item {
    grid-template-columns: 1fr 60px;
  }

  .song-album,
  .added-at {
    display: none;
  }
}
</style>
