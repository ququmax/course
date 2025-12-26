// Music API Service with real network search
// Uses iTunes Search API for real song data and IndexedDB for local storage

import { songsDB, searchHistoryDB, playHistoryDB, favoritesDB } from './database'

// iTunes Search API base URL
const ITUNES_API = 'https://itunes.apple.com/search'

// Search cache for performance optimization
const searchCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache TTL
const MAX_CACHE_SIZE = 50

// Active request controller for cancellation
let activeSearchController = null

// Cache management functions
function getCachedResult(key) {
  const cached = searchCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  // Remove expired cache
  if (cached) {
    searchCache.delete(key)
  }
  return null
}

function setCachedResult(key, data) {
  // Limit cache size
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = searchCache.keys().next().value
    searchCache.delete(oldestKey)
  }
  searchCache.set(key, { data, timestamp: Date.now() })
}

function clearSearchCache() {
  searchCache.clear()
}

// Transform iTunes API response to our song format
function transformiTunesSong(item, queryTerms = []) {
  const title = item.trackName || ''
  const artist = item.artistName || ''
  const album = item.collectionName || item.trackName || ''
  
  // Calculate relevance score based on query match
  let relevanceScore = 0
  if (queryTerms.length > 0) {
    const lowerTitle = title.toLowerCase()
    const lowerArtist = artist.toLowerCase()
    const lowerAlbum = album.toLowerCase()
    
    queryTerms.forEach(term => {
      const lowerTerm = term.toLowerCase()
      // Exact match gets higher score
      if (lowerTitle === lowerTerm) relevanceScore += 100
      else if (lowerTitle.startsWith(lowerTerm)) relevanceScore += 50
      else if (lowerTitle.includes(lowerTerm)) relevanceScore += 30
      
      if (lowerArtist === lowerTerm) relevanceScore += 80
      else if (lowerArtist.startsWith(lowerTerm)) relevanceScore += 40
      else if (lowerArtist.includes(lowerTerm)) relevanceScore += 20
      
      if (lowerAlbum.includes(lowerTerm)) relevanceScore += 10
    })
  }
  
  return {
    id: item.trackId,
    title,
    artist,
    album,
    duration: Math.floor(item.trackTimeMillis / 1000),
    cover: item.artworkUrl100?.replace('100x100', '600x600') || item.artworkUrl60?.replace('60x60', '600x600'),
    coverSmall: item.artworkUrl100?.replace('100x100', '300x300') || item.artworkUrl60,
    coverLarge: item.artworkUrl100?.replace('100x100', '1000x1000') || item.artworkUrl60?.replace('60x60', '1000x1000'),
    url: item.previewUrl, // 30-second preview
    genre: item.primaryGenreName,
    year: new Date(item.releaseDate).getFullYear(),
    playCount: Math.floor(Math.random() * 100000),
    hasVideo: item.kind === 'music-video',
    videoUrl: item.kind === 'music-video' ? item.previewUrl : null,
    artistId: item.artistId,
    albumId: item.collectionId,
    trackNumber: item.trackNumber,
    explicit: item.trackExplicitness === 'explicit',
    country: item.country,
    releaseDate: item.releaseDate,
    relevanceScore,
    // Default lyrics (iTunes doesn't provide lyrics)
    lyrics: `[00:00.00]${title}\n[00:05.00]${artist}\n[00:10.00]\n[00:15.00]♪ 音乐播放中...`
  }
}

// Search songs from iTunes API with cancellation support
async function searchFromiTunes(query, limit = 25, signal = null) {
  try {
    const params = new URLSearchParams({
      term: query,
      media: 'music',
      entity: 'song',
      limit: limit.toString()
    })
    
    const fetchOptions = signal ? { signal } : {}
    const response = await fetch(`${ITUNES_API}?${params}`, fetchOptions)
    
    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`)
    }
    
    const data = await response.json()
    const queryTerms = query.split(/\s+/).filter(t => t.length > 0)
    return data.results.map(item => transformiTunesSong(item, queryTerms))
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Search request was cancelled')
      return []
    }
    console.error('iTunes API search failed:', error)
    throw error
  }
}

// Sort results by relevance, popularity, and recency
function sortSearchResults(results, sortBy = 'relevance') {
  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        // Primary: relevance score, Secondary: play count
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore
        }
        return (b.playCount || 0) - (a.playCount || 0)
      
      case 'popularity':
        return (b.playCount || 0) - (a.playCount || 0)
      
      case 'newest':
        const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
        const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
        return dateB - dateA
      
      case 'oldest':
        const dateA2 = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
        const dateB2 = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
        return dateA2 - dateB2
      
      case 'title':
        return (a.title || '').localeCompare(b.title || '')
      
      case 'artist':
        return (a.artist || '').localeCompare(b.artist || '')
      
      default:
        return 0
    }
  })
}

// Filter results by criteria
function filterSearchResults(results, filters = {}) {
  return results.filter(song => {
    if (filters.artist && !song.artist?.toLowerCase().includes(filters.artist.toLowerCase())) {
      return false
    }
    if (filters.album && !song.album?.toLowerCase().includes(filters.album.toLowerCase())) {
      return false
    }
    if (filters.genre && !song.genre?.toLowerCase().includes(filters.genre.toLowerCase())) {
      return false
    }
    if (filters.year && song.year !== filters.year) {
      return false
    }
    if (filters.yearFrom && song.year < filters.yearFrom) {
      return false
    }
    if (filters.yearTo && song.year > filters.yearTo) {
      return false
    }
    if (filters.explicit === false && song.explicit) {
      return false
    }
    return true
  })
}

// Search autocomplete - returns quick suggestions
async function searchAutocomplete(query, limit = 8) {
  if (!query || query.length < 2) return []
  
  try {
    // First try local cache
    const localResults = await songsDB.search(query)
    if (localResults.length >= limit) {
      return localResults.slice(0, limit)
    }
    
    // Fetch from API
    const apiResults = await searchFromiTunes(query, limit)
    
    // Cache results
    if (apiResults.length > 0) {
      await songsDB.addMany(apiResults)
    }
    
    return apiResults
  } catch (error) {
    // Fallback to local results on error
    console.error('Autocomplete error:', error)
    return await songsDB.search(query)
  }
}

// Mock songs for fallback and initial data
export const mockSongs = [
  {
    id: 1,
    title: 'Sunset Dreams',
    artist: 'Aurora Lights',
    album: 'Electric Horizons',
    duration: 245,
    cover: 'https://picsum.photos/seed/song1/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    lyrics: `[00:00.00]Sunset Dreams
[00:05.00]By Aurora Lights
[00:10.00]
[00:15.00]Walking through the golden hour
[00:22.00]Colors painting in the sky
[00:29.00]Every moment feels like forever
[00:36.00]As the day says goodbye
[00:43.00]
[00:50.00]Sunset dreams, carry me away
[00:57.00]To a place where I can stay
[01:04.00]In the warmth of fading light
[01:11.00]Everything feels right
[01:18.00]
[01:25.00]Stars are starting to appear
[01:32.00]Whispering secrets in my ear
[01:39.00]The night is young and full of hope
[01:46.00]Together we can cope`,
    genre: 'Electronic',
    year: 2024,
    playCount: 15420,
    hasVideo: true,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 2,
    title: 'Midnight City',
    artist: 'Neon Pulse',
    album: 'Urban Nights',
    duration: 198,
    cover: 'https://picsum.photos/seed/song2/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    lyrics: `[00:00.00]Midnight City
[00:05.00]By Neon Pulse
[00:10.00]
[00:15.00]Neon lights are shining bright
[00:22.00]Dancing through the endless night
[00:29.00]City never sleeps tonight
[00:36.00]Everything in motion`,
    genre: 'Synthwave',
    year: 2024,
    playCount: 23150,
    hasVideo: false,
    videoUrl: null
  },
  {
    id: 3,
    title: 'Ocean Waves',
    artist: 'Calm Waters',
    album: 'Serenity',
    duration: 312,
    cover: 'https://picsum.photos/seed/song3/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    lyrics: `[00:00.00]Ocean Waves
[00:05.00]By Calm Waters
[00:10.00]
[00:15.00]Listen to the ocean call
[00:22.00]Feel the rhythm of it all
[00:29.00]Waves are crashing on the shore
[00:36.00]Peace forever more`,
    genre: 'Ambient',
    year: 2023,
    playCount: 8920,
    hasVideo: true,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 4,
    title: 'Electric Soul',
    artist: 'Voltage',
    album: 'Power Up',
    duration: 267,
    cover: 'https://picsum.photos/seed/song4/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    lyrics: `[00:00.00]Electric Soul
[00:05.00]By Voltage
[00:10.00]
[00:15.00]Feel the current running through
[00:22.00]Electric energy so true
[00:29.00]Power up and let it flow
[00:36.00]Watch the sparks glow`,
    genre: 'Electronic',
    year: 2024,
    playCount: 45230,
    hasVideo: false,
    videoUrl: null
  },
  {
    id: 5,
    title: 'Mountain High',
    artist: 'Peak Experience',
    album: 'Summit',
    duration: 289,
    cover: 'https://picsum.photos/seed/song5/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    lyrics: `[00:00.00]Mountain High
[00:05.00]By Peak Experience
[00:10.00]
[00:15.00]Climbing to the highest peak
[00:22.00]Finding what we always seek
[00:29.00]Above the clouds so high
[00:36.00]Touching the sky`,
    genre: 'Rock',
    year: 2023,
    playCount: 31420,
    hasVideo: true,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 6,
    title: 'Rainy Day',
    artist: 'Cloudy Skies',
    album: 'Weather Patterns',
    duration: 234,
    cover: 'https://picsum.photos/seed/song6/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    lyrics: `[00:00.00]Rainy Day
[00:05.00]By Cloudy Skies`,
    genre: 'Lo-fi',
    year: 2024,
    playCount: 19870,
    hasVideo: false,
    videoUrl: null
  },
  {
    id: 7,
    title: 'Summer Vibes',
    artist: 'Beach Crew',
    album: 'Tropical Paradise',
    duration: 203,
    cover: 'https://picsum.photos/seed/song7/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    lyrics: `[00:00.00]Summer Vibes
[00:05.00]By Beach Crew`,
    genre: 'Pop',
    year: 2024,
    playCount: 67890,
    hasVideo: true,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 8,
    title: 'Digital Love',
    artist: 'Cyber Heart',
    album: 'Connection',
    duration: 278,
    cover: 'https://picsum.photos/seed/song8/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    lyrics: `[00:00.00]Digital Love
[00:05.00]By Cyber Heart`,
    genre: 'Electronic',
    year: 2023,
    playCount: 54320,
    hasVideo: false,
    videoUrl: null
  },
  {
    id: 9,
    title: 'Forest Walk',
    artist: 'Nature Sounds',
    album: 'Woodland',
    duration: 356,
    cover: 'https://picsum.photos/seed/song9/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    lyrics: `[00:00.00]Forest Walk
[00:05.00]By Nature Sounds`,
    genre: 'Ambient',
    year: 2024,
    playCount: 12450,
    hasVideo: true,
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  },
  {
    id: 10,
    title: 'City Lights',
    artist: 'Urban Dreams',
    album: 'Metropolis',
    duration: 215,
    cover: 'https://picsum.photos/seed/song10/300/300',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    lyrics: `[00:00.00]City Lights
[00:05.00]By Urban Dreams`,
    genre: 'Pop',
    year: 2024,
    playCount: 78900,
    hasVideo: false,
    videoUrl: null
  }
]

export const mockCharts = [
  {
    id: 'top-100',
    name: 'Top 100',
    description: 'The hottest songs right now',
    songs: mockSongs,
    cover: 'https://picsum.photos/seed/chart1/400/400',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'new-releases',
    name: 'New Releases',
    description: 'Fresh tracks just dropped',
    songs: mockSongs.slice(0, 5),
    cover: 'https://picsum.photos/seed/chart2/400/400',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'trending',
    name: 'Trending Now',
    description: 'What everyone is listening to',
    songs: mockSongs.slice(3, 8),
    cover: 'https://picsum.photos/seed/chart3/400/400',
    updatedAt: new Date().toISOString()
  }
]

// Music API Service
export const musicService = {
  // Search autocomplete - returns quick suggestions
  async searchAutocomplete(query, limit = 8) {
    if (!query || query.length < 2) return []
    
    // Check cache first
    const cacheKey = `autocomplete:${query.toLowerCase()}:${limit}`
    const cachedResult = getCachedResult(cacheKey)
    if (cachedResult) {
      return cachedResult
    }
    
    try {
      // First try local cache
      const localResults = await songsDB.search(query)
      if (localResults.length >= limit) {
        const results = sortSearchResults(localResults, 'relevance').slice(0, limit)
        setCachedResult(cacheKey, results)
        return results
      }
      
      // Fetch from API
      const apiResults = await searchFromiTunes(query, limit)
      
      // Cache results
      if (apiResults.length > 0) {
        await songsDB.addMany(apiResults)
      }
      
      const results = sortSearchResults(apiResults, 'relevance')
      setCachedResult(cacheKey, results)
      return results
    } catch (error) {
      // Fallback to local results on error
      console.error('Autocomplete error:', error)
      return await songsDB.search(query)
    }
  },
  
  // Cancel any active search request
  cancelSearch() {
    if (activeSearchController) {
      activeSearchController.abort()
      activeSearchController = null
    }
  },
  
  // Clear search cache
  clearCache() {
    clearSearchCache()
  },
  // Get all charts
  async getCharts() {
    await simulateDelay()
    return mockCharts
  },

  // Get chart by ID
  async getChartById(chartId) {
    await simulateDelay()
    return mockCharts.find(c => c.id === chartId) || null
  },

  // Get all songs (for search, etc.)
  async getAllSongs() {
    await simulateDelay()
    return await songsDB.getAll() || mockSongs
  },

  // Get song by ID
  async getSongById(songId) {
    await simulateDelay()
    // Try to get from local DB first
    let song = await songsDB.get(parseInt(songId))
    
    if (!song) {
      // If not found locally, try to fetch from iTunes API
      try {
        // We can't directly fetch a single song by ID from iTunes API
        // So we'll return a mock song as fallback
        song = mockSongs.find(s => s.id === parseInt(songId))
      } catch (error) {
        console.error('Error fetching song by ID:', error)
      }
    }
    
    return song || null
  },

  // Search songs with advanced options
  async searchSongs(query, options = {}) {
    if (!query || query.length < 1) return { results: [], total: 0, page: 1, hasMore: false }
    
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'relevance',
      filters = {},
      forceRefresh = false
    } = options
    
    // Cancel previous search
    this.cancelSearch()
    activeSearchController = new AbortController()
    
    // Check cache first (unless force refresh)
    const cacheKey = `search:${query.toLowerCase()}:${page}:${pageSize}:${sortBy}:${JSON.stringify(filters)}`
    if (!forceRefresh) {
      const cachedResult = getCachedResult(cacheKey)
      if (cachedResult) {
        return cachedResult
      }
    }
    
    try {
      let allResults = []
      
      // First try local cache
      const localResults = await songsDB.searchAdvanced(query)
      
      // If we have enough local results, use them
      if (localResults.length >= pageSize * page) {
        allResults = localResults
      } else {
        // Otherwise fetch from API and merge with local
        const limit = Math.max(50, pageSize * 2) // Fetch more for better filtering
        const apiResults = await searchFromiTunes(query, limit, activeSearchController.signal)
        
        // Cache API results
        if (apiResults.length > 0) {
          await songsDB.addMany(apiResults)
        }
        
        // Merge and deduplicate
        const resultMap = new Map()
        ;[...localResults, ...apiResults].forEach(song => {
          if (!resultMap.has(song.id)) {
            resultMap.set(song.id, song)
          }
        })
        allResults = Array.from(resultMap.values())
      }
      
      // Apply filters
      let filteredResults = filterSearchResults(allResults, filters)
      
      // Sort results
      filteredResults = sortSearchResults(filteredResults, sortBy)
      
      // Paginate
      const total = filteredResults.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedResults = filteredResults.slice(startIndex, endIndex)
      
      const result = {
        results: paginatedResults,
        total,
        page,
        pageSize,
        hasMore: endIndex < total,
        totalPages: Math.ceil(total / pageSize)
      }
      
      // Cache the result
      setCachedResult(cacheKey, result)
      
      return result
    } catch (error) {
      if (error.name === 'AbortError') {
        return { results: [], total: 0, page: 1, hasMore: false, cancelled: true }
      }
      console.error('Search error:', error)
      // Fallback to local cache
      const localResults = await songsDB.search(query)
      const filteredResults = filterSearchResults(localResults, filters)
      const sortedResults = sortSearchResults(filteredResults, sortBy)
      const startIndex = (page - 1) * pageSize
      const paginatedResults = sortedResults.slice(startIndex, startIndex + pageSize)
      
      return {
        results: paginatedResults,
        total: sortedResults.length,
        page,
        pageSize,
        hasMore: startIndex + pageSize < sortedResults.length,
        totalPages: Math.ceil(sortedResults.length / pageSize),
        fromCache: true
      }
    } finally {
      activeSearchController = null
    }
  },
  
  // Simple search (backward compatible)
  async searchSongsSimple(query) {
    const result = await this.searchSongs(query, { pageSize: 50 })
    return result.results
  },
  
  // Get search suggestions based on query
  async getSearchSuggestions(query, limit = 5) {
    if (!query || query.length < 1) return []
    
    const cacheKey = `suggestions:${query.toLowerCase()}`
    const cachedResult = getCachedResult(cacheKey)
    if (cachedResult) return cachedResult
    
    try {
      // Get suggestions from local database
      const localSongs = await songsDB.getAll()
      const lowerQuery = query.toLowerCase()
      
      // Find matching titles and artists
      const suggestions = new Set()
      
      localSongs.forEach(song => {
        if (song.title?.toLowerCase().startsWith(lowerQuery)) {
          suggestions.add(song.title)
        }
        if (song.artist?.toLowerCase().startsWith(lowerQuery)) {
          suggestions.add(song.artist)
        }
        if (song.album?.toLowerCase().startsWith(lowerQuery)) {
          suggestions.add(song.album)
        }
      })
      
      // Also include recent search history
      const history = await searchHistoryDB.getRecent(10)
      history.forEach(item => {
        if (item.term?.toLowerCase().startsWith(lowerQuery)) {
          suggestions.add(item.term)
        }
      })
      
      const result = Array.from(suggestions).slice(0, limit)
      setCachedResult(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error getting suggestions:', error)
      return []
    }
  },
  
  // Get available filter options from search results
  async getFilterOptions(query) {
    if (!query) return { artists: [], albums: [], genres: [], years: [] }
    
    try {
      const allSongs = await songsDB.search(query)
      
      const artists = new Map()
      const albums = new Map()
      const genres = new Map()
      const years = new Set()
      
      allSongs.forEach(song => {
        if (song.artist) {
          artists.set(song.artist, (artists.get(song.artist) || 0) + 1)
        }
        if (song.album) {
          albums.set(song.album, (albums.get(song.album) || 0) + 1)
        }
        if (song.genre) {
          genres.set(song.genre, (genres.get(song.genre) || 0) + 1)
        }
        if (song.year) {
          years.add(song.year)
        }
      })
      
      return {
        artists: Array.from(artists.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        albums: Array.from(albums.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        genres: Array.from(genres.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        years: Array.from(years).sort((a, b) => b - a)
      }
    } catch (error) {
      console.error('Error getting filter options:', error)
      return { artists: [], albums: [], genres: [], years: [] }
    }
  },

  // Get random songs from charts (for anonymous users)
  async getRandomChartSongs(count = 10) {
    await simulateDelay()
    
    // Try to get from local DB
    const localSongs = await songsDB.getAll()
    if (localSongs.length >= count) {
      const shuffled = [...localSongs].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count)
    }
    
    // Fallback to mock songs
    const shuffled = [...mockSongs].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  },

  // Get personalized recommendations (for logged-in users)
  async getRecommendations(userId, limit = 10) {
    await simulateDelay()
    
    // Try to get from local DB
    const localSongs = await songsDB.getAll()
    if (localSongs.length >= limit) {
      const shuffled = [...localSongs].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, limit)
    }
    
    // Fallback to mock songs
    const shuffled = [...mockSongs].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, limit)
  },

  // Get similar songs (for "more like this")
  async getSimilarSongs(songId, limit = 5) {
    await simulateDelay()
    const song = await songsDB.get(parseInt(songId))
    if (!song) {
      // Try mock songs if not found locally
      const mockSong = mockSongs.find(s => s.id === parseInt(songId))
      if (!mockSong) return []
      
      // Search for similar songs from API
      try {
        const results = await searchFromiTunes(mockSong.artist, limit + 2)
        return results.filter(s => s.id !== mockSong.id).slice(0, limit)
      } catch (error) {
        console.error('Error fetching similar songs:', error)
        return []
      }
    }
    
    // Search for similar songs from API
    try {
      const results = await searchFromiTunes(song.artist, limit + 2)
      return results.filter(s => s.id !== song.id).slice(0, limit)
    } catch (error) {
      console.error('Error fetching similar songs:', error)
      return []
    }
  },

  // Get songs by genre
  async getSongsByGenre(genre) {
    await simulateDelay()
    
    // Try to get from local DB
    const localSongs = await songsDB.getAll()
    const genreSongs = localSongs.filter(s => 
      s.genre && s.genre.toLowerCase() === genre.toLowerCase()
    )
    
    if (genreSongs.length > 0) {
      return genreSongs
    }
    
    // Fallback to mock songs
    return mockSongs.filter(s => s.genre.toLowerCase() === genre.toLowerCase())
  },

  // Get today's recommendation (daily mix)
  async getDailyMix(userId) {
    await simulateDelay()
    
    // Try to get from local DB
    const localSongs = await songsDB.getAll()
    let songs
    
    if (localSongs.length >= 8) {
      songs = [...localSongs].sort(() => Math.random() - 0.5).slice(0, 8)
    } else {
      // Fallback to mock songs
      songs = [...mockSongs].sort(() => Math.random() - 0.5).slice(0, 8)
    }
    
    return {
      id: 'daily-mix',
      name: "Today's Mix for You",
      description: 'Based on your listening history',
      songs,
      cover: 'https://picsum.photos/seed/daily/400/400',
      generatedAt: new Date().toISOString()
    }
  }
}

// Simulate network delay
function simulateDelay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default musicService
