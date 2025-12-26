<template>
  <div class="home-view">
    <!-- Hero section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>发现你的音乐</h1>
        <p>海量音乐，尽在指尖。现在开始听歌吧！</p>
        <button class="btn btn-primary btn-lg" @click="playRandomFromChart" aria-label="随机播放歌曲">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          随机播放
        </button>
      </div>
    </section>

    <!-- Daily Mix (for logged-in users) -->
    <section v-if="isLoggedIn && dailyMix" class="section">
      <div class="section-header">
        <h2>{{ dailyMix.name }}</h2>
        <p class="section-desc">{{ dailyMix.description }}</p>
      </div>
      <div class="songs-grid">
        <SongCard 
          v-for="(song, index) in dailyMix.songs" 
          :key="song.id" 
          :song="song"
          :playlist="dailyMix.songs"
          :index="index"
        />
      </div>
    </section>

    <!-- Charts section -->
    <section class="section">
      <div class="section-header">
        <h2>热门榜单</h2>
        <router-link to="/charts" class="see-all">查看全部</router-link>
      </div>
      <div class="charts-grid">
        <div 
          v-for="chart in charts" 
          :key="chart.id" 
          class="chart-card"
          @click="goToChart(chart)"
          tabindex="0"
          role="article"
          :aria-label="`${chart.name} - ${chart.songs.length}首歌曲`"
          @keydown.enter="goToChart(chart)"
        >
          <img 
            :src="chart.cover" 
            :alt="chart.name" 
            class="chart-cover" 
            loading="lazy"
            decoding="async"
            width="80"
            height="80"
          />
          <div class="chart-info">
            <h3>{{ chart.name }}</h3>
            <p>{{ chart.description }}</p>
            <span class="song-count">{{ chart.songs.length }} 首歌曲</span>
          </div>
          <button class="play-chart-btn" @click.stop="playChart(chart)" aria-label="播放该榜单">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Trending songs -->
    <section class="section">
      <div class="section-header">
        <h2>热门推荐</h2>
      </div>
      <div class="songs-grid">
        <SongCard 
          v-for="(song, index) in trendingSongs" 
          :key="song.id" 
          :song="song"
          :playlist="trendingSongs"
          :index="index"
          @remove="handleRemoveSong"
        />
      </div>
    </section>

    <!-- New releases -->
    <section class="section">
      <div class="section-header">
        <h2>新歌首发</h2>
      </div>
      <div class="songs-grid">
        <SongCard 
          v-for="(song, index) in newReleases" 
          :key="song.id" 
          :song="song"
          :playlist="newReleases"
          :index="index"
          @remove="handleRemoveSong"
        />
      </div>
    </section>

    <!-- Genre section -->
    <section class="section">
      <div class="section-header">
        <h2>按风格浏览</h2>
      </div>
      <div class="genres-grid">
        <router-link 
          v-for="genre in genres" 
          :key="genre.name" 
          :to="{ name: 'Genre', params: { genre: genre.name } }"
          class="genre-card"
          :style="{ background: genre.gradient }"
          :aria-label="`浏览${genre.name}歌曲`"
        >
          <span>{{ genre.name }}</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { musicService } from '@/services/music'
import { storeToRefs } from 'pinia'
import SongCard from '@/components/SongCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()

const { isLoggedIn, userId } = storeToRefs(authStore)

const charts = ref([])
const trendingSongs = ref([])
const newReleases = ref([])
const dailyMix = ref(null)

const genres = [
  { name: '电子音乐', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '流行音乐', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: '摇滚乐', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: '嘻哈', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: '爵士乐', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: '古典乐', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' }
]

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    charts.value = await musicService.getCharts()
    
    // Get trending songs (filter out not interested ones)
    const allSongs = await musicService.getAllSongs()
    trendingSongs.value = allSongs
      .filter(s => !playlistStore.isNotInterested(s.id))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 6)

    // New releases (just use random for mock)
    newReleases.value = await musicService.getRandomChartSongs(6)

    // Daily mix for logged-in users
    if (isLoggedIn.value) {
      dailyMix.value = await musicService.getDailyMix(userId.value)
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

function playRandomFromChart() {
  if (charts.value.length > 0 && charts.value[0].songs.length > 0) {
    const randomSongs = [...charts.value[0].songs].sort(() => Math.random() - 0.5)
    playerStore.setPlaylist(randomSongs, 0)
    playerStore.setPlayMode('random')
  }
}

function playChart(chart) {
  playerStore.setPlaylist(chart.songs, 0)
}

function goToChart(chart) {
  router.push({ name: 'PlaylistDetail', params: { id: chart.id } })
}

function handleRemoveSong(songId) {
  trendingSongs.value = trendingSongs.value.filter(s => s.id !== songId)
  newReleases.value = newReleases.value.filter(s => s.id !== songId)
}
</script>

<style scoped>
.home-view {
  padding-bottom: 100px;
}

/* Hero section */
.hero-section {
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  padding: 80px 40px;
  border-radius: 24px;
  margin: 20px;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: 48px;
  margin: 0;
}

.hero-content p {
  font-size: 18px;
  opacity: 0.9;
  margin: 16px 0 32px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: white;
  color: var(--color-primary);
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-lg {
  padding: 16px 32px;
  font-size: 18px;
}

/* Sections */
.section {
  padding: 40px 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  margin: 0;
}

.section-desc {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 4px 0 0;
}

.see-all {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.see-all:hover {
  color: var(--color-primary);
}

/* Songs grid */
.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

/* Charts grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.chart-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.chart-card:hover {
  background: var(--color-background-mute);
  transform: translateY(-2px);
}

.chart-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.chart-info {
  flex: 1;
}

.chart-info h3 {
  margin: 0;
  font-size: 16px;
}

.chart-info p {
  margin: 4px 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.song-count {
  font-size: 12px;
  color: var(--color-text-muted);
}

.play-chart-btn {
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
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s;
}

.chart-card:hover .play-chart-btn {
  opacity: 1;
  transform: translateX(0);
}

.play-chart-btn:hover {
  transform: scale(1.1);
  background: var(--color-primary-hover);
}

/* Genres grid */
.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.genre-card {
  padding: 24px 20px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  display: block;
}

.genre-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.genre-card:focus {
  outline: 2px solid white;
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;
    margin: 10px;
  }

  .hero-content h1 {
    font-size: 32px;
  }

  .songs-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
