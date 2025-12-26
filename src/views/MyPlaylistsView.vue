<template>
  <div class="playlists-view">
    <div class="page-header">
      <h1>我的歌单</h1>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        新建歌单
      </button>
    </div>

    <!-- Playlists grid -->
    <div v-if="playlists.length > 0" class="playlists-grid">
      <div 
        v-for="playlist in playlists" 
        :key="playlist.id"
        class="playlist-card"
        @click="viewPlaylist(playlist)"
      >
        <div class="playlist-cover">
          <img v-if="playlist.songs.length > 0" :src="playlist.songs[0].coverLarge || playlist.songs[0].cover" :alt="playlist.name" />
          <div v-else class="empty-cover">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <button class="play-btn" @click.stop="playPlaylist(playlist)" v-if="playlist.songs.length > 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
        <div class="playlist-info">
          <h3>{{ playlist.name }}</h3>
          <p>{{ playlist.songs.length }} 首歌曲</p>
        </div>
        <div class="playlist-actions">
          <button class="action-btn" @click.stop="editPlaylist(playlist)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete" @click.stop="confirmDelete(playlist)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
      <h2>暂无歌单</h2>
      <p>创建你的第一个歌单，整理你喜爱的歌曲。</p>
      <button class="btn btn-primary" @click="showCreateModal = true">新建歌单</button>
    </div>

    <!-- Create/Edit modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <h2>{{ showEditModal ? '编辑歌单' : '新建歌单' }}</h2>
        <form @submit.prevent="showEditModal ? savePlaylist() : createPlaylist()">
          <div class="form-group">
            <label for="name">歌单名称</label>
            <input 
              type="text" 
              id="name" 
              v-model="modalForm.name" 
              placeholder="我的精选歌单"
              required
            />
          </div>
          <div class="form-group">
            <label for="description">描述（可选）</label>
            <textarea 
              id="description" 
              v-model="modalForm.description" 
              placeholder="这个歌单是关于什么的？"
              rows="3"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModals">取消</button>
            <button type="submit" class="btn btn-primary">{{ showEditModal ? '保存' : '创建' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal" @click.stop>
        <h2>删除歌单？</h2>
        <p>确定要删除“{{ playlistToDelete?.name }}”吗？此操作无法撤消。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="deletePlaylist">删除</button>
        </div>
      </div>
    </div>

    <!-- Add song modal -->
    <div v-if="showAddSongModal" class="modal-overlay" @click="showAddSongModal = false">
      <div class="modal" @click.stop>
        <h2>添加到歌单</h2>
        <div class="playlist-options">
          <div 
            v-for="playlist in playlists" 
            :key="playlist.id"
            class="playlist-option"
            @click="addSongToPlaylist(playlist.id)"
          >
            <span>{{ playlist.name }}</span>
            <span class="song-count">{{ playlist.songs.length }} 首歌曲</span>
          </div>
        </div>
        <button class="btn btn-secondary btn-full" @click="showAddSongModal = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { musicService } from '@/services/music'
import { storeToRefs } from 'pinia'
import { useNotification } from '@/composables/useNotification'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const notification = useNotification()

const { userPlaylists: playlists } = storeToRefs(playlistStore)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAddSongModal = ref(false)

const modalForm = reactive({
  id: null,
  name: '',
  description: ''
})

const playlistToDelete = ref(null)
const songToAdd = ref(null)

onMounted(async () => {
  playlistStore.initialize()
  
  // Check for query params
  if (route.query.create === 'true') {
    showCreateModal.value = true
  }
  
  if (route.query.addSong) {
    const song = await musicService.getSongById(route.query.addSong)
    if (song) {
      songToAdd.value = song
      showAddSongModal.value = true
    }
  }
})

watch(() => route.query.addSong, async (songId) => {
  if (songId) {
    const song = await musicService.getSongById(songId)
    if (song) {
      songToAdd.value = song
      showAddSongModal.value = true
    }
  }
})

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  modalForm.id = null
  modalForm.name = ''
  modalForm.description = ''
}

function createPlaylist() {
  if (!modalForm.name.trim()) return
  
  const result = playlistStore.createPlaylist(modalForm.name, modalForm.description)
  if (result.success) {
    notification.success('歌单创建成功！')
    closeModals()
  }
}

function editPlaylist(playlist) {
  modalForm.id = playlist.id
  modalForm.name = playlist.name
  modalForm.description = playlist.description || ''
  showEditModal.value = true
}

function savePlaylist() {
  if (!modalForm.name.trim()) return
  
  playlistStore.updatePlaylist(modalForm.id, {
    name: modalForm.name,
    description: modalForm.description
  })
  notification.success('歌单已更新！')
  closeModals()
}

function confirmDelete(playlist) {
  playlistToDelete.value = playlist
  showDeleteModal.value = true
}

function deletePlaylist() {
  if (playlistToDelete.value) {
    playlistStore.deletePlaylist(playlistToDelete.value.id)
    notification.success('歌单已删除')
    showDeleteModal.value = false
    playlistToDelete.value = null
  }
}

function viewPlaylist(playlist) {
  router.push({ name: 'PlaylistDetail', params: { id: playlist.id } })
}

function playPlaylist(playlist) {
  if (playlist.songs.length > 0) {
    playerStore.setPlaylist(playlist.songs, 0)
  }
}

function addSongToPlaylist(playlistId) {
  if (songToAdd.value) {
    playlistStore.addSongToPlaylist(playlistId, songToAdd.value)
    notification.success('歌曲已添加到歌单')
    showAddSongModal.value = false
    songToAdd.value = null
    
    // Clear query param
    router.replace({ query: {} })
  }
}
</script>

<style scoped>
.playlists-view {
  padding: 20px;
  padding-bottom: 120px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

h1 {
  font-size: 32px;
  margin: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
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

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.btn-secondary:hover {
  background: var(--color-background-mute);
}

.btn-danger {
  background: #ff4757;
  color: white;
}

.btn-danger:hover {
  background: #e84118;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* Playlists grid */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.playlist-card {
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.playlist-card:hover {
  background: var(--color-background-mute);
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
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

.play-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.playlist-card:hover .play-btn {
  opacity: 1;
  transform: translateY(0);
}

.playlist-info h3 {
  margin: 0;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-info p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.playlist-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-card:hover .playlist-actions {
  opacity: 1;
}

.action-btn {
  background: var(--color-background);
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
  color: var(--color-text);
}

.action-btn.delete:hover {
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

.modal {
  background: var(--color-background);
  border-radius: 16px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
}

.modal h2 {
  margin: 0 0 20px;
  font-size: 20px;
}

.modal p {
  color: var(--color-text-secondary);
  margin: 0 0 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  background: var(--color-background-soft);
  color: var(--color-text);
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Playlist options */
.playlist-options {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.playlist-option {
  display: flex;
  justify-content: space-between;
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
</style>
