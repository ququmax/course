import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const usePlaylistStore = defineStore('playlist', () => {
  const authStore = useAuthStore()

  // State
  const userPlaylists = ref([])
  const favorites = ref([])
  const notInterestedSongs = ref([])
  const loading = ref(false)

  // Getters
  const favoriteSongIds = computed(() => favorites.value.map(s => s.id))
  const notInterestedIds = computed(() => notInterestedSongs.value.map(s => s.id))

  // Initialize data from storage
  function initialize() {
    if (authStore.isLoggedIn) {
      const userId = authStore.userId
      userPlaylists.value = JSON.parse(localStorage.getItem(`playlists_${userId}`) || '[]')
      favorites.value = JSON.parse(localStorage.getItem(`favorites_${userId}`) || '[]')
      notInterestedSongs.value = JSON.parse(localStorage.getItem(`notInterested_${userId}`) || '[]')
    } else {
      // Load session data for anonymous users
      notInterestedSongs.value = JSON.parse(sessionStorage.getItem('notInterested_session') || '[]')
    }
  }

  // Save data to storage
  function saveToStorage() {
    if (authStore.isLoggedIn) {
      const userId = authStore.userId
      localStorage.setItem(`playlists_${userId}`, JSON.stringify(userPlaylists.value))
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites.value))
      localStorage.setItem(`notInterested_${userId}`, JSON.stringify(notInterestedSongs.value))
    } else {
      sessionStorage.setItem('notInterested_session', JSON.stringify(notInterestedSongs.value))
    }
  }

  // Favorites management
  function addToFavorites(song) {
    if (!authStore.isLoggedIn) {
      return { success: false, requiresLogin: true }
    }

    if (!favorites.value.find(s => s.id === song.id)) {
      favorites.value.unshift({
        ...song,
        addedAt: Date.now()
      })
      saveToStorage()
    }
    return { success: true }
  }

  function removeFromFavorites(songId) {
    const index = favorites.value.findIndex(s => s.id === songId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveToStorage()
    }
  }

  function toggleFavorite(song) {
    if (!authStore.isLoggedIn) {
      return { success: false, requiresLogin: true }
    }

    if (isFavorite(song.id)) {
      removeFromFavorites(song.id)
    } else {
      addToFavorites(song)
    }
    return { success: true }
  }

  function isFavorite(songId) {
    return favoriteSongIds.value.includes(songId)
  }

  function clearFavorites() {
    favorites.value = []
    saveToStorage()
  }

  // User playlists management
  function createPlaylist(name, description = '') {
    if (!authStore.isLoggedIn) {
      return { success: false, requiresLogin: true }
    }

    const newPlaylist = {
      id: 'pl_' + Date.now(),
      name,
      description,
      cover: null,
      songs: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    userPlaylists.value.push(newPlaylist)
    saveToStorage()
    return { success: true, playlist: newPlaylist }
  }

  function updatePlaylist(playlistId, updates) {
    const playlist = userPlaylists.value.find(p => p.id === playlistId)
    if (playlist) {
      Object.assign(playlist, updates, { updatedAt: Date.now() })
      saveToStorage()
      return { success: true }
    }
    return { success: false, error: 'Playlist not found' }
  }

  function deletePlaylist(playlistId) {
    const index = userPlaylists.value.findIndex(p => p.id === playlistId)
    if (index > -1) {
      userPlaylists.value.splice(index, 1)
      saveToStorage()
      return { success: true }
    }
    return { success: false, error: 'Playlist not found' }
  }

  function addSongToPlaylist(playlistId, song) {
    const playlist = userPlaylists.value.find(p => p.id === playlistId)
    if (playlist) {
      if (!playlist.songs.find(s => s.id === song.id)) {
        playlist.songs.push({
          ...song,
          addedAt: Date.now()
        })
        playlist.updatedAt = Date.now()
        saveToStorage()
      }
      return { success: true }
    }
    return { success: false, error: 'Playlist not found' }
  }

  function removeSongFromPlaylist(playlistId, songId) {
    const playlist = userPlaylists.value.find(p => p.id === playlistId)
    if (playlist) {
      const index = playlist.songs.findIndex(s => s.id === songId)
      if (index > -1) {
        playlist.songs.splice(index, 1)
        playlist.updatedAt = Date.now()
        saveToStorage()
      }
      return { success: true }
    }
    return { success: false, error: 'Playlist not found' }
  }

  function reorderPlaylistSongs(playlistId, fromIndex, toIndex) {
    const playlist = userPlaylists.value.find(p => p.id === playlistId)
    if (playlist) {
      const [song] = playlist.songs.splice(fromIndex, 1)
      playlist.songs.splice(toIndex, 0, song)
      playlist.updatedAt = Date.now()
      saveToStorage()
      return { success: true }
    }
    return { success: false, error: 'Playlist not found' }
  }

  function getPlaylistById(playlistId) {
    return userPlaylists.value.find(p => p.id === playlistId)
  }

  // Not interested management
  function markNotInterested(song) {
    if (!notInterestedSongs.value.find(s => s.id === song.id)) {
      notInterestedSongs.value.push({
        id: song.id,
        markedAt: Date.now()
      })
      saveToStorage()
    }
    return { success: true }
  }

  function isNotInterested(songId) {
    return notInterestedIds.value.includes(songId)
  }

  function clearNotInterested() {
    notInterestedSongs.value = []
    saveToStorage()
  }

  // Search in favorites
  function searchFavorites(query) {
    if (!query) return favorites.value
    const lowerQuery = query.toLowerCase()
    return favorites.value.filter(song => 
      song.title.toLowerCase().includes(lowerQuery) ||
      song.artist.toLowerCase().includes(lowerQuery)
    )
  }

  // Generate shareable link for playlist
  function generateShareLink(playlistId) {
    const playlist = getPlaylistById(playlistId)
    if (!playlist) return null
    
    // In real app, this would create a shortened URL through backend
    const encoded = btoa(JSON.stringify({
      id: playlist.id,
      name: playlist.name,
      songIds: playlist.songs.map(s => s.id)
    }))
    return `${window.location.origin}/playlist/shared/${encoded}`
  }

  return {
    // State
    userPlaylists,
    favorites,
    notInterestedSongs,
    loading,
    // Getters
    favoriteSongIds,
    notInterestedIds,
    // Actions
    initialize,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderPlaylistSongs,
    getPlaylistById,
    markNotInterested,
    isNotInterested,
    clearNotInterested,
    searchFavorites,
    generateShareLink
  }
})
