<template>
  <div class="search-view">
    <!-- Search Header -->
    <div class="search-header">
      <div class="search-input-container" :class="{ 'focused': isInputFocused }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="search" 
          v-model="searchQuery" 
          placeholder="搜索歌曲、歌手、专辑..."
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          ref="searchInput"
          autofocus
          aria-label="搜索歌曲"
          autocomplete="off"
        />
        <div v-if="isLoading" class="input-spinner"></div>
        <button v-else-if="searchQuery" class="clear-btn" @click="clearSearch" aria-label="清空搜索">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <!-- Autocomplete Dropdown -->
        <div 
          v-if="showAutocomplete && (suggestions.length > 0 || recentSearches.length > 0)" 
          class="autocomplete-dropdown"
          role="listbox"
        >
          <!-- Suggestions -->
          <div v-if="suggestions.length > 0" class="autocomplete-section">
            <div class="section-label">搜索建议</div>
            <div 
              v-for="(suggestion, index) in suggestions" 
              :key="'s-' + index"
              class="autocomplete-item"
              :class="{ 'highlighted': highlightedIndex === index }"
              @click="selectSuggestion(suggestion)"
              @mouseenter="highlightedIndex = index"
              role="option"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span v-html="highlightMatch(suggestion, searchQuery)"></span>
            </div>
          </div>
          
          <!-- Recent Searches -->
          <div v-if="recentSearches.length > 0 && !searchQuery" class="autocomplete-section">
            <div class="section-label">
              最近搜索
              <button class="clear-link" @click.stop="clearHistory">清空</button>
            </div>
            <div 
              v-for="(item, index) in recentSearches" 
              :key="'r-' + index"
              class="autocomplete-item"
              :class="{ 'highlighted': highlightedIndex === suggestions.length + index }"
              @click="selectSuggestion(item.term)"
              @mouseenter="highlightedIndex = suggestions.length + index"
              role="option"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{{ item.term }}</span>
              <button class="remove-item" @click.stop="removeHistoryItem(item.term)" aria-label="删除">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Filters & Sort -->
    <div class="search-controls" v-if="hasResults || searchQuery">
      <div class="filter-tabs">
        <button 
          v-for="filter in filterTabs"
          :key="filter.value"
          :class="['filter-btn', { 'active': activeFilter === filter.value }]"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
          <span v-if="filter.count !== undefined" class="count">{{ filter.count }}</span>
        </button>
      </div>
      
      <div class="sort-controls">
        <select v-model="sortBy" @change="handleSortChange" class="sort-select" aria-label="排序方式">
          <option value="relevance">相关性</option>
          <option value="popularity">热门度</option>
          <option value="newest">最新</option>
          <option value="oldest">最早</option>
          <option value="title">歌曲名</option>
          <option value="artist">歌手</option>
        </select>
        
        <button 
          class="filter-toggle-btn" 
          @click="showAdvancedFilters = !showAdvancedFilters"
          :class="{ 'active': hasActiveFilters }"
          aria-label="高级筛选"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          筛选
          <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
        </button>
      </div>
    </div>
    
    <!-- Advanced Filters Panel -->
    <transition name="slide">
      <div v-if="showAdvancedFilters" class="advanced-filters">
        <div class="filter-group">
          <label>歌手</label>
          <select v-model="filters.artist" @change="applyFilters">
            <option value="">全部歌手</option>
            <option v-for="artist in filterOptions.artists" :key="artist.name" :value="artist.name">
              {{ artist.name }} ({{ artist.count }})
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>专辑</label>
          <select v-model="filters.album" @change="applyFilters">
            <option value="">全部专辑</option>
            <option v-for="album in filterOptions.albums" :key="album.name" :value="album.name">
              {{ album.name }} ({{ album.count }})
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>风格</label>
          <select v-model="filters.genre" @change="applyFilters">
            <option value="">全部风格</option>
            <option v-for="genre in filterOptions.genres" :key="genre.name" :value="genre.name">
              {{ genre.name }} ({{ genre.count }})
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>年份</label>
          <div class="year-range">
            <select v-model="filters.yearFrom" @change="applyFilters">
              <option value="">起始年份</option>
              <option v-for="year in filterOptions.years" :key="'from-' + year" :value="year">{{ year }}</option>
            </select>
            <span>至</span>
            <select v-model="filters.yearTo" @change="applyFilters">
              <option value="">结束年份</option>
              <option v-for="year in filterOptions.years" :key="'to-' + year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        
        <button v-if="hasActiveFilters" class="clear-filters-btn" @click="clearFilters">
          清除筛选
        </button>
      </div>
    </transition>

    <!-- Loading State -->
    <div v-if="isLoading && !hasResults" class="loading-state" aria-busy="true">
      <div class="spinner"></div>
      <p>搜索中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!searchQuery && !hasResults" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <h2>搜索音乐</h2>
      <p>输入歌曲名、歌手或专辑名开始搜索</p>
      
      <!-- Search History -->
      <div v-if="searchHistory.length > 0" class="search-history">
        <div class="history-header">
          <h3>搜索历史</h3>
          <button class="clear-history-btn" @click="clearHistory">清空</button>
        </div>
        <div class="history-tags">
          <button 
            v-for="item in searchHistory" 
            :key="item.term" 
            class="history-tag"
            @click="searchFromHistory(item.term)"
          >
            {{ item.term }}
          </button>
        </div>
      </div>

      <!-- Hot Searches -->
      <div class="hot-searches">
        <h3>热门搜索</h3>
        <div class="hot-tags">
          <button 
            v-for="(item, index) in hotSearches" 
            :key="item.term || item" 
            class="hot-tag"
            :class="{ 'top': index < 3 }"
            @click="searchFromHistory(item.displayTerm || item.term || item)"
          >
            <span class="rank" v-if="index < 3">{{ index + 1 }}</span>
            {{ item.displayTerm || item.term || item }}
          </button>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="!hasResults && !isLoading && searchQuery" class="no-results">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
      <h2>未找到结果</h2>
      <p>没有找到与"{{ searchQuery }}"相关的内容</p>
      <p class="suggestion" v-if="searchQuery.length > 0">试试其他关键词或检查拼写</p>
    </div>

    <!-- Search Results -->
    <div v-else class="search-results">
      <!-- Stats -->
      <div class="results-stats">
        <p>找到 {{ totalResults }} 个结果</p>
        <p v-if="searchTime > 0" class="search-time">用时 {{ searchTime }}ms</p>
      </div>
      
      <!-- Songs Section -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'songs') && filteredSongs.length > 0" class="results-section">
        <h2 v-if="activeFilter === 'all'">歌曲</h2>
        <div class="songs-list">
          <div 
            v-for="(song, index) in filteredSongs" 
            :key="song.id"
            class="song-item"
            :class="{ 'playing': isCurrentSong(song.id) }"
            @click="playSong(song, index)"
            tabindex="0"
            role="button"
            :aria-label="`播放 ${song.title} - ${song.artist}`"
            @keydown.enter="playSong(song, index)"
          >
            <div class="song-index">
              <span class="index-number">{{ (currentPage - 1) * pageSize + index + 1 }}</span>
              <button class="play-btn" @click.stop="playSong(song, index)" aria-label="播放">
                <svg v-if="isPlaying && isCurrentSong(song.id)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
            </div>
            <img 
              :src="song.coverSmall || song.cover" 
              :alt="song.title" 
              class="song-cover"
              loading="lazy"
              width="48"
              height="48"
            />
            <div class="song-info">
              <span class="song-title" v-html="highlightMatch(song.title, searchQuery)"></span>
              <span class="song-artist" v-html="highlightMatch(song.artist, searchQuery)"></span>
            </div>
            <span class="song-album" v-html="highlightMatch(song.album, searchQuery)"></span>
            <span class="song-duration">{{ formatDuration(song.duration) }}</span>
            <div class="song-actions">
              <button 
                class="action-btn" 
                @click.stop="toggleFavorite(song)" 
                :class="{ 'active': isFavorite(song.id) }"
                :aria-label="isFavorite(song.id) ? '取消收藏' : '添加收藏'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite(song.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button class="action-btn" @click.stop="viewSongDetail(song.id)" aria-label="查看详情">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1" 
            @click="goToPage(currentPage - 1)"
            aria-label="上一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <template v-for="page in visiblePages" :key="page">
            <span v-if="page === '...'" class="page-ellipsis">...</span>
            <button 
              v-else
              class="page-btn"
              :class="{ 'active': page === currentPage }"
              @click="goToPage(page)"
              :aria-label="`第 ${page} 页`"
              :aria-current="page === currentPage ? 'page' : undefined"
            >
              {{ page }}
            </button>
          </template>
          
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages" 
            @click="goToPage(currentPage + 1)"
            aria-label="下一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </section>

      <!-- Artists Section -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'artists') && filteredArtists.length > 0" class="results-section">
        <h2 v-if="activeFilter === 'all'">歌手</h2>
        <div class="artists-grid">
          <div 
            v-for="artist in filteredArtists" 
            :key="artist.name"
            class="artist-card"
            @click="searchByArtist(artist.name)"
            tabindex="0"
            role="button"
            @keydown.enter="searchByArtist(artist.name)"
          >
            <div class="artist-avatar">{{ artist.name.charAt(0) }}</div>
            <span class="artist-name">{{ artist.name }}</span>
            <span class="song-count">{{ artist.songCount }} 首歌曲</span>
          </div>
        </div>
      </section>

      <!-- Albums Section -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'albums') && filteredAlbums.length > 0" class="results-section">
        <h2 v-if="activeFilter === 'all'">专辑</h2>
        <div class="albums-grid">
          <div 
            v-for="album in filteredAlbums" 
            :key="album.name"
            class="album-card"
            @click="searchByAlbum(album.name)"
            tabindex="0"
            role="button"
            @keydown.enter="searchByAlbum(album.name)"
          >
            <img 
              :src="album.cover" 
              :alt="album.name" 
              class="album-cover"
              loading="lazy"
              width="160"
              height="160"
            />
            <span class="album-name">{{ album.name }}</span>
            <span class="album-artist">{{ album.artist }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import { useAuthStore } from '@/stores/auth'
import { musicService } from '@/services/music'
import { searchHistoryDB, hotSearchesDB } from '@/services/database'
import { storeToRefs } from 'pinia'
import { formatDuration, debounce } from '@/utils/helpers'
import { useNotification } from '@/composables/useNotification'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const authStore = useAuthStore()
const notification = useNotification()

const { currentSong, isPlaying } = storeToRefs(playerStore)
const { isLoggedIn } = storeToRefs(authStore)

// Search state
const searchInput = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const isInputFocused = ref(false)
const showAutocomplete = ref(false)
const highlightedIndex = ref(-1)
const searchTime = ref(0)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(20)
const totalResults = ref(0)
const totalPages = ref(0)

// Filter state
const activeFilter = ref('all')
const sortBy = ref('relevance')
const showAdvancedFilters = ref(false)
const filters = ref({
  artist: '',
  album: '',
  genre: '',
  yearFrom: '',
  yearTo: ''
})
const filterOptions = ref({
  artists: [],
  albums: [],
  genres: [],
  years: []
})

// Suggestions state
const suggestions = ref([])
const recentSearches = ref([])
const searchHistory = ref([])
const hotSearches = ref([])

// Default hot searches
const defaultHotSearches = ['流行音乐', '电子音乐', '摇滚', '古典', '爵士', 'R&B', 'Hip-Hop', '乡村音乐']

// Computed
const hasResults = computed(() => searchResults.value.length > 0)

const filterTabs = computed(() => [
  { value: 'all', label: '全部', count: totalResults.value },
  { value: 'songs', label: '歌曲', count: filteredSongs.value.length },
  { value: 'artists', label: '歌手', count: filteredArtists.value.length },
  { value: 'albums', label: '专辑', count: filteredAlbums.value.length }
])

const filteredSongs = computed(() => {
  if (activeFilter.value === 'artists' || activeFilter.value === 'albums') return []
  return searchResults.value
})

const filteredArtists = computed(() => {
  if (activeFilter.value === 'songs' || activeFilter.value === 'albums') return []
  const artists = new Map()
  searchResults.value.forEach(song => {
    if (artists.has(song.artist)) {
      artists.get(song.artist).songCount++
    } else {
      artists.set(song.artist, { name: song.artist, songCount: 1 })
    }
  })
  return Array.from(artists.values()).slice(0, 12)
})

const filteredAlbums = computed(() => {
  if (activeFilter.value === 'songs' || activeFilter.value === 'artists') return []
  const albums = new Map()
  searchResults.value.forEach(song => {
    if (!albums.has(song.album)) {
      albums.set(song.album, { name: song.album, artist: song.artist, cover: song.cover })
    }
  })
  return Array.from(albums.values()).slice(0, 12)
})

const hasActiveFilters = computed(() => {
  return filters.value.artist || filters.value.album || filters.value.genre || 
         filters.value.yearFrom || filters.value.yearTo
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.artist) count++
  if (filters.value.album) count++
  if (filters.value.genre) count++
  if (filters.value.yearFrom || filters.value.yearTo) count++
  return count
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

// Initialize
onMounted(async () => {
  await loadSearchHistory()
  await loadHotSearches()
  
  if (route.query.q) {
    searchQuery.value = route.query.q
    await performSearch(searchQuery.value)
  }
  
  // Close autocomplete on click outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  musicService.cancelSearch()
})

// Watch route changes
watch(() => route.query.q, async (newQuery) => {
  if (newQuery && newQuery !== searchQuery.value) {
    searchQuery.value = newQuery
    await performSearch(newQuery)
  }
})

// Load data functions
async function loadSearchHistory() {
  try {
    const history = await searchHistoryDB.getRecent(10)
    searchHistory.value = history
    recentSearches.value = history.slice(0, 5)
  } catch (error) {
    console.error('Failed to load search history:', error)
  }
}

async function loadHotSearches() {
  try {
    const trending = await hotSearchesDB.getTrending(8)
    if (trending.length > 0) {
      hotSearches.value = trending
    } else {
      hotSearches.value = defaultHotSearches.map(term => ({ term, displayTerm: term, count: 0 }))
    }
  } catch (error) {
    console.error('Failed to load hot searches:', error)
    hotSearches.value = defaultHotSearches.map(term => ({ term, displayTerm: term, count: 0 }))
  }
}

// Debounced handlers
const debouncedSearch = debounce((query) => {
  performSearch(query)
}, 300)

const debouncedSuggestions = debounce(async (query) => {
  if (query.length >= 2) {
    suggestions.value = await musicService.getSearchSuggestions(query, 5)
  } else {
    suggestions.value = []
  }
}, 150)

// Event handlers
function handleInput() {
  highlightedIndex.value = -1
  if (searchQuery.value.trim()) {
    debouncedSuggestions(searchQuery.value)
    debouncedSearch(searchQuery.value)
    router.replace({ query: { q: searchQuery.value } })
  } else {
    suggestions.value = []
    searchResults.value = []
    totalResults.value = 0
    totalPages.value = 0
    router.replace({ query: {} })
  }
}

function handleFocus() {
  isInputFocused.value = true
  showAutocomplete.value = true
}

function handleBlur() {
  isInputFocused.value = false
  // Delay hiding to allow click events
  setTimeout(() => {
    showAutocomplete.value = false
  }, 200)
}

function handleKeydown(e) {
  const totalItems = suggestions.value.length + recentSearches.value.length
  
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, totalItems - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
  } else if (e.key === 'Enter') {
    if (highlightedIndex.value >= 0) {
      e.preventDefault()
      if (highlightedIndex.value < suggestions.value.length) {
        selectSuggestion(suggestions.value[highlightedIndex.value])
      } else {
        const recentIndex = highlightedIndex.value - suggestions.value.length
        selectSuggestion(recentSearches.value[recentIndex].term)
      }
    }
  } else if (e.key === 'Escape') {
    showAutocomplete.value = false
    searchInput.value?.blur()
  }
}

function handleClickOutside(e) {
  if (!e.target.closest('.search-input-container')) {
    showAutocomplete.value = false
  }
}

// Search functions
async function performSearch(query) {
  if (!query || query.length < 1) {
    searchResults.value = []
    return
  }

  isLoading.value = true
  const startTime = Date.now()
  
  try {
    const result = await musicService.searchSongs(query, {
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      filters: {
        artist: filters.value.artist,
        album: filters.value.album,
        genre: filters.value.genre,
        yearFrom: filters.value.yearFrom ? parseInt(filters.value.yearFrom) : undefined,
        yearTo: filters.value.yearTo ? parseInt(filters.value.yearTo) : undefined
      }
    })
    
    if (result.cancelled) return
    
    searchResults.value = result.results
    totalResults.value = result.total
    totalPages.value = result.totalPages
    searchTime.value = Date.now() - startTime
    
    // Save to history
    await searchHistoryDB.add(query)
    await hotSearchesDB.increment(query)
    await loadSearchHistory()
    
    // Load filter options
    filterOptions.value = await musicService.getFilterOptions(query)
    
    showAutocomplete.value = false
  } catch (error) {
    console.error('Search error:', error)
    notification.error('搜索出错，请重试')
  } finally {
    isLoading.value = false
  }
}

function selectSuggestion(term) {
  searchQuery.value = term
  showAutocomplete.value = false
  highlightedIndex.value = -1
  currentPage.value = 1
  performSearch(term)
  router.replace({ query: { q: term } })
}

function searchFromHistory(term) {
  selectSuggestion(term)
}

function searchByArtist(artistName) {
  filters.value.artist = artistName
  currentPage.value = 1
  performSearch(searchQuery.value)
}

function searchByAlbum(albumName) {
  filters.value.album = albumName
  currentPage.value = 1
  performSearch(searchQuery.value)
}

async function removeHistoryItem(term) {
  await searchHistoryDB.remove(term)
  await loadSearchHistory()
}

function clearHistory() {
  searchHistoryDB.clear()
  searchHistory.value = []
  recentSearches.value = []
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  totalResults.value = 0
  suggestions.value = []
  router.replace({ query: {} })
  nextTick(() => searchInput.value?.focus())
}

// Filter functions
function setFilter(filter) {
  activeFilter.value = filter
}

function handleSortChange() {
  currentPage.value = 1
  performSearch(searchQuery.value)
}

function applyFilters() {
  currentPage.value = 1
  performSearch(searchQuery.value)
}

function clearFilters() {
  filters.value = { artist: '', album: '', genre: '', yearFrom: '', yearTo: '' }
  currentPage.value = 1
  performSearch(searchQuery.value)
}

// Pagination
function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  performSearch(searchQuery.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Player functions
function isCurrentSong(songId) {
  return currentSong.value?.id === songId
}

function isFavorite(songId) {
  return playlistStore.isFavorite(songId)
}

function playSong(song, index) {
  playerStore.playSong(song, index, filteredSongs.value)
}

function toggleFavorite(song) {
  if (!isLoggedIn.value) {
    notification.warning('请先登录以添加收藏')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  playlistStore.toggleFavorite(song)
  notification.success(isFavorite(song.id) ? '已取消收藏' : '已添加到收藏')
}

function viewSongDetail(songId) {
  router.push({ name: 'SongDetail', params: { id: songId } })
}

// Utility functions
function highlightMatch(text, query) {
  if (!text || !query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}
</script>

<style scoped>
.search-view {
  padding: 20px;
  padding-bottom: 120px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Search Header */
.search-header {
  margin-bottom: 24px;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 16px 20px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.search-input-container.focused {
  border-color: var(--color-primary);
  background: var(--color-background);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
}

.search-input-container svg {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.search-input-container input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 18px;
  color: var(--color-text);
}

.search-input-container input::placeholder {
  color: var(--color-text-muted);
}

.input-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--color-background-mute);
  color: var(--color-text);
}

/* Autocomplete Dropdown */
.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  z-index: 100;
}

.autocomplete-section {
  padding: 8px 0;
}

.autocomplete-section:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.clear-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 12px;
  cursor: pointer;
  text-transform: none;
}

.autocomplete-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.autocomplete-item:hover,
.autocomplete-item.highlighted {
  background: var(--color-background-soft);
}

.autocomplete-item svg {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.autocomplete-item span {
  flex: 1;
  font-size: 14px;
}

.autocomplete-item :deep(mark) {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 0 2px;
  border-radius: 2px;
}

.remove-item {
  background: none;
  border: none;
  color: var(--color-text-muted);
  padding: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.autocomplete-item:hover .remove-item {
  opacity: 1;
}

/* Search Controls */
.search-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.filter-btn .count {
  font-size: 12px;
  opacity: 0.8;
}

.sort-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sort-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.filter-toggle-btn:hover,
.filter-toggle-btn.active {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-primary);
  color: white;
  font-size: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Advanced Filters */
.advanced-filters {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--color-background-soft);
  border-radius: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.filter-group select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
}

.year-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.year-range select {
  width: 100px;
}

.year-range span {
  color: var(--color-text-secondary);
}

.clear-filters-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-filters-btn:hover {
  background: var(--color-primary-hover);
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Loading & Empty States */
.loading-state,
.empty-state,
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state svg,
.empty-state svg,
.no-results svg {
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state h2,
.no-results h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.empty-state p,
.no-results p {
  color: var(--color-text-secondary);
  margin: 0;
}

.suggestion {
  font-size: 14px;
  margin-top: 8px !important;
}

/* Search History & Hot Searches */
.search-history,
.hot-searches {
  margin-top: 40px;
  text-align: left;
  max-width: 600px;
  width: 100%;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-header h3,
.hot-searches h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
}

.clear-history-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
}

.history-tags,
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag,
.hot-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-background-soft);
  border: none;
  border-radius: 16px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
}

.history-tag:hover,
.hot-tag:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.hot-tag.top {
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  color: white;
}

.hot-tag .rank {
  font-weight: 700;
}

/* Results */
.results-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.search-time {
  font-size: 12px;
}

.results-section {
  margin-bottom: 40px;
}

.results-section h2 {
  font-size: 20px;
  margin: 0 0 16px;
}

/* Songs List */
.songs-list {
  background: var(--color-background-soft);
  border-radius: 12px;
  overflow: hidden;
}

.song-item {
  display: grid;
  grid-template-columns: 50px 48px 1fr 180px 60px 80px;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.song-item:hover {
  background: var(--color-background-mute);
}

.song-item:focus {
  outline: none;
  background: var(--color-background-mute);
}

.song-item.playing {
  background: var(--color-primary-light);
}

.song-index {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.index-number {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.play-btn {
  position: absolute;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 4px;
  display: none;
  align-items: center;
  justify-content: center;
}

.song-item:hover .index-number {
  display: none;
}

.song-item:hover .play-btn {
  display: flex;
}

.song-item.playing .index-number {
  display: none;
}

.song-item.playing .play-btn {
  display: flex;
  color: var(--color-primary);
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  background: var(--color-background-mute);
}

.song-info {
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

.song-item.playing .song-title {
  color: var(--color-primary);
}

.song-title :deep(mark),
.song-artist :deep(mark),
.song-album :deep(mark) {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 0 2px;
  border-radius: 2px;
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

.song-duration {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: right;
}

.song-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.2s;
}

.song-item:hover .song-actions,
.song-item:focus .song-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 6px;
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

.action-btn.active {
  color: #ff4757;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 24px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-background-soft);
  border-color: var(--color-primary);
}

.page-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0 8px;
  color: var(--color-text-secondary);
}

/* Artists Grid */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.artist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: var(--color-background-soft);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.artist-card:hover,
.artist-card:focus {
  background: var(--color-background-mute);
  transform: translateY(-4px);
  outline: none;
}

.artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 12px;
}

.artist-name {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.song-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* Albums Grid */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.album-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.album-card:hover,
.album-card:focus {
  transform: translateY(-4px);
  outline: none;
}

.album-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 8px;
  background: var(--color-background-mute);
}

.album-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .sort-controls {
    justify-content: center;
  }
  
  .advanced-filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .song-item {
    grid-template-columns: 36px 40px 1fr 50px;
    gap: 8px;
    padding: 10px 12px;
  }

  .song-album {
    display: none;
  }

  .song-actions {
    opacity: 1;
  }
  
  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
