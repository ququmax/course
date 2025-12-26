<template>
  <div class="lyrics-panel" :class="{ 'fullscreen': isFullscreen }">
    <div class="lyrics-header">
      <h3>歌词</h3>
      <div class="lyrics-controls">
        <button class="btn-icon" @click="decreaseFontSize" title="减小字体">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <span class="font-size-label">{{ fontSize }}px</span>
        <button class="btn-icon" @click="increaseFontSize" title="增大字体">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button class="btn-icon" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
          <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>
    </div>
    <div class="lyrics-content" ref="lyricsContainer">
      <div v-if="parsedLyrics.length > 0" class="lyrics-lines">
        <p
          v-for="(line, index) in parsedLyrics"
          :key="index"
          :class="{ 'active': index === currentLyricIndex, 'passed': index < currentLyricIndex }"
          :style="{ fontSize: fontSize + 'px' }"
          @click="seekToLyric(line.time)"
          ref="lyricLines"
        >
          {{ line.text || '♪' }}
        </p>
      </div>
      <div v-else class="no-lyrics">
        <p>暂无歌词</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { parseLyrics, findCurrentLyricIndex } from '@/utils/helpers'

const props = defineProps({
  lyrics: {
    type: String,
    default: ''
  },
  currentTime: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['seek'])

const lyricsContainer = ref(null)
const lyricLines = ref([])
const fontSize = ref(parseInt(localStorage.getItem('lyrics_font_size') || '16'))
const isFullscreen = ref(false)

const parsedLyrics = computed(() => parseLyrics(props.lyrics))

const currentLyricIndex = computed(() => {
  return findCurrentLyricIndex(parsedLyrics.value, props.currentTime)
})

function increaseFontSize() {
  if (fontSize.value < 32) {
    fontSize.value += 2
    localStorage.setItem('lyrics_font_size', fontSize.value.toString())
  }
}

function decreaseFontSize() {
  if (fontSize.value > 12) {
    fontSize.value -= 2
    localStorage.setItem('lyrics_font_size', fontSize.value.toString())
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function seekToLyric(time) {
  emit('seek', time)
}

// Auto-scroll to current lyric
watch(currentLyricIndex, async (newIndex) => {
  if (newIndex < 0 || !lyricsContainer.value) return
  
  await nextTick()
  
  const lines = lyricsContainer.value.querySelectorAll('p')
  if (lines[newIndex]) {
    lines[newIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
})
</script>

<style scoped>
.lyrics-panel {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  max-height: 400px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.lyrics-panel.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 80px;
  width: 100%;
  max-height: none;
  transform: none;
  border-radius: 0;
  z-index: 999;
}

.lyrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.lyrics-header h3 {
  margin: 0;
  font-size: 14px;
}

.lyrics-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.font-size-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 36px;
  text-align: center;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--color-background-mute);
  color: var(--color-primary);
}

.lyrics-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  text-align: center;
}

.lyrics-lines {
  padding: 40px 0;
}

.lyrics-lines p {
  margin: 16px 0;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s;
  line-height: 1.8;
}

.lyrics-lines p:hover {
  color: var(--color-text);
}

.lyrics-lines p.active {
  color: var(--color-primary);
  font-weight: 600;
  transform: scale(1.1);
}

.lyrics-lines p.passed {
  color: var(--color-text-muted);
}

.no-lyrics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .lyrics-panel {
    width: 100%;
    left: 0;
    transform: none;
  }
}
</style>
