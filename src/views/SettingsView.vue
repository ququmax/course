<template>
  <div class="settings-view">
    <h1>设置</h1>

    <!-- Appearance -->
    <section class="settings-section">
      <h2>外观</h2>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">主题</span>
          <span class="setting-desc">选择浅色或深色模式</span>
        </div>
        <div class="theme-toggle">
          <button 
            :class="{ 'active': theme === 'light' }" 
            @click="setTheme('light')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            浅色
          </button>
          <button 
            :class="{ 'active': theme === 'dark' }" 
            @click="setTheme('dark')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            深色
          </button>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">紧凑模式</span>
          <span class="setting-desc">缩小间距以显示更多内容</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" v-model="compactMode" @change="setCompactMode(compactMode)" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </section>

    <!-- Playback -->
    <section class="settings-section">
      <h2>播放</h2>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">音质</span>
          <span class="setting-desc">更高音质会消耗更多流量</span>
        </div>
        <select v-model="audioQuality" @change="saveAudioQuality">
          <option value="standard">标准</option>
          <option value="high">高音质</option>
        </select>
      </div>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">默认播放速度</span>
          <span class="setting-desc">新歌曲播放的速度</span>
        </div>
        <select v-model="playbackSpeed" @change="savePlaybackSpeed">
          <option value="0.8">0.8x</option>
          <option value="1.0">1.0x (正常)</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
        </select>
      </div>
    </section>

    <!-- Notifications -->
    <section class="settings-section">
      <h2>通知</h2>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">显示通知</span>
          <span class="setting-desc">显示应用内通知消息</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" v-model="showNotifications" @change="setShowNotifications(showNotifications)" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </section>

    <!-- Data -->
    <section class="settings-section" v-if="isLoggedIn">
      <h2>数据与隐私</h2>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">清除播放历史</span>
          <span class="setting-desc">删除所有播放历史记录</span>
        </div>
        <button class="btn btn-secondary" @click="clearHistory">清除历史</button>
      </div>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">清除“不感兴趣”记录</span>
          <span class="setting-desc">重置“不感兴趣”的偏好设置</span>
        </div>
        <button class="btn btn-secondary" @click="clearNotInterested">清除</button>
      </div>
    </section>

    <!-- Keyboard shortcuts -->
    <section class="settings-section">
      <h2>键盘快捷键</h2>
      <div class="shortcuts-list">
        <div class="shortcut">
          <span class="shortcut-key">空格</span>
          <span class="shortcut-action">播放 / 暂停</span>
        </div>
        <div class="shortcut">
          <span class="shortcut-key">←</span>
          <span class="shortcut-action">快退 10 秒</span>
        </div>
        <div class="shortcut">
          <span class="shortcut-key">→</span>
          <span class="shortcut-action">快进 10 秒</span>
        </div>
        <div class="shortcut">
          <span class="shortcut-key">Ctrl + ←</span>
          <span class="shortcut-action">上一首</span>
        </div>
        <div class="shortcut">
          <span class="shortcut-key">Ctrl + →</span>
          <span class="shortcut-action">下一首</span>
        </div>
        <div class="shortcut">
          <span class="shortcut-key">↑ / ↓</span>
          <span class="shortcut-action">音量加 / 减</span>
        </div>
        <div class="shortcut">
          <span class="shortcut-key">M</span>
          <span class="shortcut-action">静音 / 取消静音</span>
        </div>
        <div class="shortcut">
          <span class="shortcut-key">S</span>
          <span class="shortcut-action">随机模式</span>
        </div>
        <div class="shortcut">
          <span class="shortcut-key">L</span>
          <span class="shortcut-action">单曲循环</span>
        </div>
        <div class="shortcut">
          <span class="shortcut-key">R</span>
          <span class="shortcut-action">顺序播放</span>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="settings-section">
      <h2>关于</h2>
      <div class="about-info">
        <p><strong>音乐应用</strong> v1.0.0</p>
        <p>基于 Vue 3 构建的音乐流媒体应用</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { usePlaylistStore } from '@/stores/playlist'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useNotification } from '@/composables/useNotification'

const settingsStore = useSettingsStore()
const playlistStore = usePlaylistStore()
const authStore = useAuthStore()
const notification = useNotification()

const { theme, showNotifications, compactMode } = storeToRefs(settingsStore)
const { isLoggedIn, userId } = storeToRefs(authStore)

const audioQuality = ref(localStorage.getItem('player_quality') || 'standard')
const playbackSpeed = ref(localStorage.getItem('player_speed') || '1.0')

function setTheme(newTheme) {
  settingsStore.setTheme(newTheme)
}

function setShowNotifications(value) {
  settingsStore.setShowNotifications(value)
}

function setCompactMode(value) {
  settingsStore.setCompactMode(value)
}

function saveAudioQuality() {
  localStorage.setItem('player_quality', audioQuality.value)
  notification.success('音质设置已更新')
}

function savePlaybackSpeed() {
  localStorage.setItem('player_speed', playbackSpeed.value)
  notification.success('播放速度已更新')
}

function clearHistory() {
  if (isLoggedIn.value) {
    localStorage.removeItem(`history_${userId.value}`)
    notification.success('播放历史已清除')
  }
}

function clearNotInterested() {
  playlistStore.clearNotInterested()
  notification.success('“不感兴趣”记录已清除')
}
</script>

<style scoped>
.settings-view {
  padding: 20px;
  padding-bottom: 120px;
  max-width: 700px;
  margin: 0 auto;
}

h1 {
  font-size: 32px;
  margin: 0 0 32px;
}

.settings-section {
  margin-bottom: 40px;
}

.settings-section h2 {
  font-size: 18px;
  margin: 0 0 16px;
  color: var(--color-text-secondary);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--color-background-soft);
  border-radius: 12px;
  margin-bottom: 8px;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-size: 15px;
  font-weight: 500;
}

.setting-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Theme toggle */
.theme-toggle {
  display: flex;
  background: var(--color-background-mute);
  border-radius: 10px;
  padding: 4px;
}

.theme-toggle button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.theme-toggle button.active {
  background: var(--color-background);
  color: var(--color-text);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-background-mute);
  transition: 0.3s;
  border-radius: 14px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--color-primary);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Select */
select {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
}

.btn-secondary:hover {
  background: var(--color-border);
}

/* Shortcuts */
.shortcuts-list {
  background: var(--color-background-soft);
  border-radius: 12px;
  overflow: hidden;
}

.shortcut {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
}

.shortcut:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.shortcut-key {
  font-family: monospace;
  background: var(--color-background-mute);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.shortcut-action {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* About */
.about-info {
  background: var(--color-background-soft);
  padding: 20px;
  border-radius: 12px;
}

.about-info p {
  margin: 4px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.about-info p strong {
  color: var(--color-text);
}
</style>
