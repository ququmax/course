<script setup>
import { onMounted } from 'vue'
import { useKeyboardShortcuts } from '@/utils/helpers'
import AppHeader from '@/components/AppHeader.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'

// Enable keyboard shortcuts
useKeyboardShortcuts()
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
    <MusicPlayer />
    <NotificationContainer />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 80px;
}
</style>
