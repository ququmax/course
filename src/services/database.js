// IndexedDB Database Service for local music data storage
const DB_NAME = 'MusicAppDB'
const DB_VERSION = 2 // Incremented for new stores

// Store names
const STORES = {
  SONGS: 'songs',
  SEARCH_HISTORY: 'searchHistory',
  FAVORITES: 'favorites',
  PLAYLISTS: 'playlists',
  PLAY_HISTORY: 'playHistory',
  HOT_SEARCHES: 'hotSearches'
}

let db = null

// Initialize the database
export async function initDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Database failed to open')
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      console.log('Database opened successfully')
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Songs store - for caching searched songs
      if (!database.objectStoreNames.contains(STORES.SONGS)) {
        const songsStore = database.createObjectStore(STORES.SONGS, { keyPath: 'id' })
        songsStore.createIndex('title', 'title', { unique: false })
        songsStore.createIndex('artist', 'artist', { unique: false })
        songsStore.createIndex('album', 'album', { unique: false })
        songsStore.createIndex('addedAt', 'addedAt', { unique: false })
      }

      // Search history store
      if (!database.objectStoreNames.contains(STORES.SEARCH_HISTORY)) {
        const historyStore = database.createObjectStore(STORES.SEARCH_HISTORY, { keyPath: 'id', autoIncrement: true })
        historyStore.createIndex('term', 'term', { unique: true })
        historyStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      // Favorites store
      if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
        const favoritesStore = database.createObjectStore(STORES.FAVORITES, { keyPath: 'songId' })
        favoritesStore.createIndex('addedAt', 'addedAt', { unique: false })
      }

      // Playlists store
      if (!database.objectStoreNames.contains(STORES.PLAYLISTS)) {
        const playlistsStore = database.createObjectStore(STORES.PLAYLISTS, { keyPath: 'id' })
        playlistsStore.createIndex('name', 'name', { unique: false })
        playlistsStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Play history store
      if (!database.objectStoreNames.contains(STORES.PLAY_HISTORY)) {
        const playHistoryStore = database.createObjectStore(STORES.PLAY_HISTORY, { keyPath: 'id', autoIncrement: true })
        playHistoryStore.createIndex('songId', 'songId', { unique: false })
        playHistoryStore.createIndex('playedAt', 'playedAt', { unique: false })
      }
      
      // Hot searches store (for trending/popular searches)
      if (!database.objectStoreNames.contains(STORES.HOT_SEARCHES)) {
        const hotSearchesStore = database.createObjectStore(STORES.HOT_SEARCHES, { keyPath: 'term' })
        hotSearchesStore.createIndex('count', 'count', { unique: false })
        hotSearchesStore.createIndex('lastSearched', 'lastSearched', { unique: false })
      }
    }
  })
}

// Generic CRUD operations
async function getStore(storeName, mode = 'readonly') {
  if (!db) {
    await initDatabase()
  }
  const transaction = db.transaction(storeName, mode)
  return transaction.objectStore(storeName)
}

// Songs operations
export const songsDB = {
  async add(song) {
    const store = await getStore(STORES.SONGS, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put({ ...song, addedAt: Date.now() })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async addMany(songs) {
    const store = await getStore(STORES.SONGS, 'readwrite')
    return Promise.all(songs.map(song => {
      return new Promise((resolve, reject) => {
        const request = store.put({ ...song, addedAt: Date.now() })
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }))
  },

  async get(id) {
    const store = await getStore(STORES.SONGS)
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async getAll() {
    const store = await getStore(STORES.SONGS)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async search(query) {
    const songs = await this.getAll()
    const lowerQuery = query.toLowerCase()
    return songs.filter(song =>
      song.title?.toLowerCase().includes(lowerQuery) ||
      song.artist?.toLowerCase().includes(lowerQuery) ||
      song.album?.toLowerCase().includes(lowerQuery)
    )
  },
  
  // Advanced search with relevance scoring
  async searchAdvanced(query) {
    const songs = await this.getAll()
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0)
    
    if (terms.length === 0) return []
    
    // Score each song based on match quality
    const scoredSongs = songs.map(song => {
      let score = 0
      const lowerTitle = (song.title || '').toLowerCase()
      const lowerArtist = (song.artist || '').toLowerCase()
      const lowerAlbum = (song.album || '').toLowerCase()
      const lowerGenre = (song.genre || '').toLowerCase()
      
      terms.forEach(term => {
        // Exact match in title
        if (lowerTitle === term) score += 100
        // Title starts with term
        else if (lowerTitle.startsWith(term)) score += 50
        // Title contains term
        else if (lowerTitle.includes(term)) score += 30
        
        // Exact match in artist
        if (lowerArtist === term) score += 80
        // Artist starts with term
        else if (lowerArtist.startsWith(term)) score += 40
        // Artist contains term
        else if (lowerArtist.includes(term)) score += 25
        
        // Album contains term
        if (lowerAlbum.includes(term)) score += 15
        
        // Genre matches
        if (lowerGenre.includes(term)) score += 10
      })
      
      return { ...song, relevanceScore: score }
    })
    
    // Filter out songs with no matches and sort by score
    return scoredSongs
      .filter(song => song.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  },
  
  // Fuzzy search with typo tolerance
  async fuzzySearch(query, threshold = 0.6) {
    const songs = await this.getAll()
    const lowerQuery = query.toLowerCase()
    
    // Simple Levenshtein distance for fuzzy matching
    function similarity(s1, s2) {
      if (!s1 || !s2) return 0
      const longer = s1.length > s2.length ? s1 : s2
      const shorter = s1.length > s2.length ? s2 : s1
      if (longer.length === 0) return 1.0
      
      // Quick check for inclusion
      if (longer.includes(shorter)) return 0.9
      
      // Calculate edit distance (simplified)
      const costs = []
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i
        for (let j = 0; j <= s2.length; j++) {
          if (i === 0) {
            costs[j] = j
          } else if (j > 0) {
            let newValue = costs[j - 1]
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
            }
            costs[j - 1] = lastValue
            lastValue = newValue
          }
        }
        if (i > 0) costs[s2.length] = lastValue
      }
      return (longer.length - costs[s2.length]) / longer.length
    }
    
    return songs.filter(song => {
      const titleSim = similarity(song.title?.toLowerCase(), lowerQuery)
      const artistSim = similarity(song.artist?.toLowerCase(), lowerQuery)
      return titleSim >= threshold || artistSim >= threshold
    })
  },

  async delete(id) {
    const store = await getStore(STORES.SONGS, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },

  async clear() {
    const store = await getStore(STORES.SONGS, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Search history operations
export const searchHistoryDB = {
  async add(term) {
    if (!term || term.trim().length === 0) return
    const normalizedTerm = term.trim()
    
    const store = await getStore(STORES.SEARCH_HISTORY, 'readwrite')
    
    // First, try to delete existing entry with same term
    return new Promise(async (resolve, reject) => {
      const index = store.index('term')
      const getRequest = index.get(normalizedTerm)
      
      getRequest.onsuccess = async () => {
        if (getRequest.result) {
          // Update existing entry
          const updateStore = await getStore(STORES.SEARCH_HISTORY, 'readwrite')
          const updateRequest = updateStore.put({ 
            id: getRequest.result.id, 
            term: normalizedTerm, 
            timestamp: Date.now() 
          })
          updateRequest.onsuccess = () => resolve(updateRequest.result)
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          // Add new entry
          const addStore = await getStore(STORES.SEARCH_HISTORY, 'readwrite')
          const addRequest = addStore.add({ term: normalizedTerm, timestamp: Date.now() })
          addRequest.onsuccess = () => resolve(addRequest.result)
          addRequest.onerror = () => reject(addRequest.error)
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  },
  
  async remove(term) {
    const store = await getStore(STORES.SEARCH_HISTORY, 'readwrite')
    return new Promise(async (resolve, reject) => {
      const index = store.index('term')
      const getRequest = index.get(term)
      
      getRequest.onsuccess = async () => {
        if (getRequest.result) {
          const deleteStore = await getStore(STORES.SEARCH_HISTORY, 'readwrite')
          const deleteRequest = deleteStore.delete(getRequest.result.id)
          deleteRequest.onsuccess = () => resolve()
          deleteRequest.onerror = () => reject(deleteRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  },

  async getRecent(limit = 10) {
    const store = await getStore(STORES.SEARCH_HISTORY)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const sorted = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit)
        resolve(sorted)
      }
      request.onerror = () => reject(request.error)
    })
  },
  
  async getAll() {
    const store = await getStore(STORES.SEARCH_HISTORY)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async clear() {
    const store = await getStore(STORES.SEARCH_HISTORY, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Hot searches operations (for trending searches)
export const hotSearchesDB = {
  async increment(term) {
    if (!term || term.trim().length === 0) return
    const normalizedTerm = term.trim().toLowerCase()
    
    try {
      const store = await getStore(STORES.HOT_SEARCHES, 'readwrite')
      return new Promise((resolve, reject) => {
        const getRequest = store.get(normalizedTerm)
        
        getRequest.onsuccess = () => {
          const existing = getRequest.result
          const data = {
            term: normalizedTerm,
            displayTerm: term.trim(),
            count: existing ? existing.count + 1 : 1,
            lastSearched: Date.now()
          }
          const putRequest = store.put(data)
          putRequest.onsuccess = () => resolve(data)
          putRequest.onerror = () => reject(putRequest.error)
        }
        getRequest.onerror = () => reject(getRequest.error)
      })
    } catch (error) {
      console.error('Error incrementing hot search:', error)
    }
  },
  
  async getTop(limit = 10) {
    try {
      const store = await getStore(STORES.HOT_SEARCHES)
      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const sorted = request.result
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
          resolve(sorted)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Error getting hot searches:', error)
      return []
    }
  },
  
  async getTrending(limit = 10, daysBack = 7) {
    try {
      const store = await getStore(STORES.HOT_SEARCHES)
      const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000)
      
      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const recent = request.result
            .filter(item => item.lastSearched >= cutoffTime)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
          resolve(recent)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Error getting trending searches:', error)
      return []
    }
  },
  
  async clear() {
    try {
      const store = await getStore(STORES.HOT_SEARCHES, 'readwrite')
      return new Promise((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Error clearing hot searches:', error)
    }
  }
}

// Favorites operations
export const favoritesDB = {
  async add(song) {
    const store = await getStore(STORES.FAVORITES, 'readwrite')
    // Also save the song to songs store
    await songsDB.add(song)
    return new Promise((resolve, reject) => {
      const request = store.put({ 
        songId: song.id, 
        song,
        addedAt: Date.now() 
      })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async remove(songId) {
    const store = await getStore(STORES.FAVORITES, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(songId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },

  async isFavorite(songId) {
    const store = await getStore(STORES.FAVORITES)
    return new Promise((resolve, reject) => {
      const request = store.get(songId)
      request.onsuccess = () => resolve(!!request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async getAll() {
    const store = await getStore(STORES.FAVORITES)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const sorted = request.result.sort((a, b) => b.addedAt - a.addedAt)
        resolve(sorted.map(f => f.song))
      }
      request.onerror = () => reject(request.error)
    })
  },

  async clear() {
    const store = await getStore(STORES.FAVORITES, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Play history operations
export const playHistoryDB = {
  async add(song) {
    const store = await getStore(STORES.PLAY_HISTORY, 'readwrite')
    // Also save the song to songs store
    await songsDB.add(song)
    return new Promise((resolve, reject) => {
      const request = store.add({ 
        songId: song.id, 
        song,
        playedAt: Date.now() 
      })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async getRecent(limit = 50) {
    const store = await getStore(STORES.PLAY_HISTORY)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        // Group by songId and get latest play for each
        const songMap = new Map()
        request.result.forEach(entry => {
          if (!songMap.has(entry.songId) || songMap.get(entry.songId).playedAt < entry.playedAt) {
            songMap.set(entry.songId, entry)
          }
        })
        const sorted = Array.from(songMap.values())
          .sort((a, b) => b.playedAt - a.playedAt)
          .slice(0, limit)
        resolve(sorted.map(h => h.song))
      }
      request.onerror = () => reject(request.error)
    })
  },

  async clear() {
    const store = await getStore(STORES.PLAY_HISTORY, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Initialize database on module load
initDatabase().catch(console.error)

export default {
  init: initDatabase,
  songs: songsDB,
  searchHistory: searchHistoryDB,
  hotSearches: hotSearchesDB,
  favorites: favoritesDB,
  playHistory: playHistoryDB
}
