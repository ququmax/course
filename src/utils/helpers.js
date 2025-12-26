// Keyboard shortcuts handler
import { onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'

export function useKeyboardShortcuts() {
  const playerStore = usePlayerStore()

  function handleKeydown(event) {
    // Ignore if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return
    }

    switch (event.code) {
      case 'Space':
        event.preventDefault()
        playerStore.togglePlay()
        break
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          playerStore.playPrevious()
        } else {
          playerStore.rewind(10)
        }
        break
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          playerStore.playNext()
        } else {
          playerStore.fastForward(10)
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        playerStore.setVolume(playerStore.volume + 0.1)
        break
      case 'ArrowDown':
        event.preventDefault()
        playerStore.setVolume(playerStore.volume - 0.1)
        break
      case 'KeyM':
        playerStore.toggleMute()
        break
      case 'KeyS':
        if (!event.ctrlKey && !event.metaKey) {
          playerStore.setPlayMode('random')
        }
        break
      case 'KeyL':
        if (!event.ctrlKey && !event.metaKey) {
          playerStore.setPlayMode('loop')
        }
        break
      case 'KeyR':
        if (!event.ctrlKey && !event.metaKey) {
          playerStore.setPlayMode('sequence')
        }
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    handleKeydown
  }
}

// Format time helper
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format duration for display (e.g., "3:45" or "1:23:45")
export function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format play count (e.g., "15.4K", "1.2M")
export function formatPlayCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

// Parse lyrics to array of { time, text }
export function parseLyrics(lyricsText) {
  if (!lyricsText) return []
  
  const lines = lyricsText.split('\n')
  const lyrics = []
  
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const centiseconds = parseInt(match[3])
      const text = match[4].trim()
      
      const time = minutes * 60 + seconds + centiseconds / 100
      lyrics.push({ time, text })
    }
  }
  
  return lyrics.sort((a, b) => a.time - b.time)
}

// Find current lyric index based on time
export function findCurrentLyricIndex(lyrics, currentTime) {
  if (!lyrics || lyrics.length === 0) return -1
  
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return i
    }
  }
  return 0
}

// Debounce function
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
