import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './auth'

export const PLAY_MODE = {
  SEQUENCE: 'sequence',
  RANDOM: 'random',
  LOOP: 'loop'
}

export const PLAYBACK_SPEED = [0.8, 1.0, 1.25, 1.5]
export const AUDIO_QUALITY = ['standard', 'high']

export const usePlayerStore = defineStore('player', () => {
  // Audio element reference
  const audioRef = ref(null)

  // Playback state
  const currentSong = ref(null)
  const playlist = ref([])
  const currentIndex = ref(-1)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const duration = ref(0)
  const currentTime = ref(0)
  const buffered = ref(0)

  // Playback settings
  const volume = ref(parseFloat(localStorage.getItem('player_volume') || '0.7'))
  const isMuted = ref(localStorage.getItem('player_muted') === 'true')
  const playMode = ref(localStorage.getItem('player_mode') || PLAY_MODE.SEQUENCE)
  const playbackSpeed = ref(parseFloat(localStorage.getItem('player_speed') || '1.0'))
  const audioQuality = ref(localStorage.getItem('player_quality') || 'standard')

  // UI state
  const showLyrics = ref(false)
  const isMinimized = ref(false)
  const showPlaylist = ref(false)

  // Error handling
  const error = ref(null)
  const retryCount = ref(0)
  const MAX_RETRIES = 2

  // Getters
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  const hasPrevious = computed(() => currentIndex.value > 0 || playMode.value === PLAY_MODE.RANDOM)
  const hasNext = computed(() => currentIndex.value < playlist.value.length - 1 || playMode.value !== PLAY_MODE.SEQUENCE)

  const playModeIcon = computed(() => {
    const icons = {
      [PLAY_MODE.SEQUENCE]: 'repeat',
      [PLAY_MODE.RANDOM]: 'shuffle',
      [PLAY_MODE.LOOP]: 'repeat-one'
    }
    return icons[playMode.value]
  })

  // Time formatting helper
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize audio element
  function initAudio(audioElement) {
    audioRef.value = audioElement

    audioElement.volume = isMuted.value ? 0 : volume.value
    audioElement.playbackRate = playbackSpeed.value

    // Event listeners
    audioElement.addEventListener('loadedmetadata', () => {
      duration.value = audioElement.duration
      isLoading.value = false
    })

    audioElement.addEventListener('timeupdate', () => {
      currentTime.value = audioElement.currentTime
    })

    audioElement.addEventListener('progress', () => {
      if (audioElement.buffered.length > 0) {
        buffered.value = audioElement.buffered.end(audioElement.buffered.length - 1)
      }
    })

    audioElement.addEventListener('ended', handleSongEnd)

    audioElement.addEventListener('error', handleError)

    audioElement.addEventListener('waiting', () => {
      isLoading.value = true
    })

    audioElement.addEventListener('canplay', () => {
      isLoading.value = false
    })

    // Restore previous session progress for logged-in users
    restoreProgress()
  }

  // Play a song
  async function playSong(song, index = -1, newPlaylist = null) {
    if (!audioRef.value) return

    error.value = null
    retryCount.value = 0

    if (newPlaylist) {
      playlist.value = newPlaylist
    }

    if (index >= 0) {
      currentIndex.value = index
    } else if (newPlaylist) {
      currentIndex.value = newPlaylist.findIndex(s => s.id === song.id)
    }

    currentSong.value = song
    isLoading.value = true

    try {
      audioRef.value.src = song.url || song.audioUrl
      audioRef.value.load()
      await audioRef.value.play()
      isPlaying.value = true

      // Save to history
      saveToHistory(song)
    } catch (err) {
      handleError(err)
    }
  }

  // Toggle play/pause
  function togglePlay() {
    if (!audioRef.value || !currentSong.value) return

    if (isPlaying.value) {
      audioRef.value.pause()
      isPlaying.value = false
    } else {
      audioRef.value.play()
        .then(() => { isPlaying.value = true })
        .catch(handleError)
    }
  }

  // Play
  function play() {
    if (!audioRef.value || !currentSong.value) return
    audioRef.value.play()
      .then(() => { isPlaying.value = true })
      .catch(handleError)
  }

  // Pause
  function pause() {
    if (!audioRef.value) return
    audioRef.value.pause()
    isPlaying.value = false
  }

  // Stop
  function stop() {
    if (!audioRef.value) return
    audioRef.value.pause()
    audioRef.value.currentTime = 0
    isPlaying.value = false
    currentTime.value = 0
  }

  // Seek to position
  function seek(time) {
    if (!audioRef.value) return
    audioRef.value.currentTime = Math.max(0, Math.min(time, duration.value))
  }

  // Seek by percentage
  function seekToPercent(percent) {
    seek((percent / 100) * duration.value)
  }

  // Fast forward/rewind (10 seconds)
  function fastForward(seconds = 10) {
    seek(currentTime.value + seconds)
  }

  function rewind(seconds = 10) {
    seek(currentTime.value - seconds)
  }

  // Volume control
  function setVolume(value) {
    volume.value = Math.max(0, Math.min(1, value))
    if (audioRef.value) {
      audioRef.value.volume = isMuted.value ? 0 : volume.value
    }
    localStorage.setItem('player_volume', volume.value.toString())
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (audioRef.value) {
      audioRef.value.volume = isMuted.value ? 0 : volume.value
    }
    localStorage.setItem('player_muted', isMuted.value.toString())
  }

  // Play mode
  function setPlayMode(mode) {
    playMode.value = mode
    localStorage.setItem('player_mode', mode)
  }

  function cyclePlayMode() {
    const modes = Object.values(PLAY_MODE)
    const currentIdx = modes.indexOf(playMode.value)
    const nextIdx = (currentIdx + 1) % modes.length
    setPlayMode(modes[nextIdx])
  }

  // Playback speed
  function setPlaybackSpeed(speed) {
    playbackSpeed.value = speed
    if (audioRef.value) {
      audioRef.value.playbackRate = speed
    }
    localStorage.setItem('player_speed', speed.toString())
  }

  // Audio quality
  function setAudioQuality(quality) {
    audioQuality.value = quality
    localStorage.setItem('player_quality', quality)
    // In real app, reload song with different quality URL
  }

  // Previous song
  function playPrevious() {
    if (playlist.value.length === 0) return

    let newIndex
    if (playMode.value === PLAY_MODE.RANDOM) {
      newIndex = Math.floor(Math.random() * playlist.value.length)
    } else {
      newIndex = currentIndex.value > 0 ? currentIndex.value - 1 : playlist.value.length - 1
    }

    playSong(playlist.value[newIndex], newIndex)
  }

  // Next song
  function playNext() {
    if (playlist.value.length === 0) return

    let newIndex
    if (playMode.value === PLAY_MODE.RANDOM) {
      newIndex = Math.floor(Math.random() * playlist.value.length)
    } else if (playMode.value === PLAY_MODE.LOOP) {
      newIndex = currentIndex.value
    } else {
      newIndex = (currentIndex.value + 1) % playlist.value.length
    }

    playSong(playlist.value[newIndex], newIndex)
  }

  // Handle song end
  function handleSongEnd() {
    if (playMode.value === PLAY_MODE.LOOP) {
      audioRef.value.currentTime = 0
      audioRef.value.play()
    } else {
      playNext()
    }
  }

  // Handle errors with retry
  function handleError(err) {
    console.error('Player error:', err)

    if (retryCount.value < MAX_RETRIES) {
      retryCount.value++
      setTimeout(() => {
        if (audioRef.value && currentSong.value) {
          audioRef.value.load()
          audioRef.value.play().catch(() => {
            if (retryCount.value >= MAX_RETRIES) {
              error.value = 'Failed to play song'
              playNext()
            }
          })
        }
      }, 1000)
    } else {
      error.value = 'Failed to play song, skipping...'
      setTimeout(() => {
        playNext()
        error.value = null
      }, 2000)
    }
  }

  // Save/restore progress
  function saveProgress() {
    const authStore = useAuthStore()
    if (authStore.isLoggedIn && currentSong.value) {
      const progressData = {
        songId: currentSong.value.id,
        time: currentTime.value,
        timestamp: Date.now()
      }
      localStorage.setItem(`progress_${authStore.userId}`, JSON.stringify(progressData))
    }
  }

  function restoreProgress() {
    const authStore = useAuthStore()
    if (authStore.isLoggedIn) {
      const saved = localStorage.getItem(`progress_${authStore.userId}`)
      if (saved) {
        const data = JSON.parse(saved)
        // Only restore if within 24 hours
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data
        }
      }
    }
    return null
  }

  // Save to history
  function saveToHistory(song) {
    const authStore = useAuthStore()
    const historyKey = authStore.isLoggedIn 
      ? `history_${authStore.userId}` 
      : 'history_session'

    let history = JSON.parse(localStorage.getItem(historyKey) || '[]')
    
    // Remove if already exists
    history = history.filter(s => s.id !== song.id)
    
    // Add to beginning
    history.unshift({
      ...song,
      playedAt: Date.now()
    })

    // Keep only last 100 songs
    history = history.slice(0, 100)

    localStorage.setItem(historyKey, JSON.stringify(history))
  }

  // Add to playlist
  function addToPlaylist(song) {
    if (!playlist.value.find(s => s.id === song.id)) {
      playlist.value.push(song)
    }
  }

  // Remove from playlist
  function removeFromPlaylist(songId) {
    const index = playlist.value.findIndex(s => s.id === songId)
    if (index > -1) {
      playlist.value.splice(index, 1)
      if (index < currentIndex.value) {
        currentIndex.value--
      } else if (index === currentIndex.value && isPlaying.value) {
        playNext()
      }
    }
  }

  // Clear playlist
  function clearPlaylist() {
    playlist.value = []
    currentIndex.value = -1
    stop()
    currentSong.value = null
  }

  // Set entire playlist
  function setPlaylist(songs, startIndex = 0) {
    playlist.value = songs
    if (songs.length > 0) {
      playSong(songs[startIndex], startIndex)
    }
  }

  // Watch for progress save
  watch(currentTime, () => {
    if (Math.floor(currentTime.value) % 30 === 0) {
      saveProgress()
    }
  })

  return {
    // State
    audioRef,
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
    audioQuality,
    showLyrics,
    isMinimized,
    showPlaylist,
    error,
    // Getters
    progress,
    formattedCurrentTime,
    formattedDuration,
    hasPrevious,
    hasNext,
    playModeIcon,
    // Actions
    initAudio,
    playSong,
    togglePlay,
    play,
    pause,
    stop,
    seek,
    seekToPercent,
    fastForward,
    rewind,
    setVolume,
    toggleMute,
    setPlayMode,
    cyclePlayMode,
    setPlaybackSpeed,
    setAudioQuality,
    playPrevious,
    playNext,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    setPlaylist,
    saveProgress
  }
})
