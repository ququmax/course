<template>
  <div class="game-view">
    <h1>⚡ 反应力测试</h1>
    <p class="subtitle">看看你的反应有多快！</p>

    <div 
      class="game-box" 
      :class="gameState"
      @click="handleClick"
    >
      <div v-if="gameState === 'waiting'" class="game-text">
        <span class="big">🎯</span>
        <p>点击开始</p>
      </div>
      <div v-else-if="gameState === 'ready'" class="game-text">
        <span class="big">⏳</span>
        <p>等待变绿...</p>
      </div>
      <div v-else-if="gameState === 'go'" class="game-text">
        <span class="big">👆</span>
        <p>快点击！</p>
      </div>
      <div v-else-if="gameState === 'result'" class="game-text">
        <span class="big">{{ getEmoji }}</span>
        <p class="time">{{ reactionTime }} ms</p>
        <p class="comment">{{ getComment }}</p>
        <p class="hint">点击再玩一次</p>
      </div>
      <div v-else-if="gameState === 'early'" class="game-text">
        <span class="big">😅</span>
        <p>太早了！</p>
        <p class="hint">点击重新开始</p>
      </div>
    </div>

    <div class="stats" v-if="attempts.length > 0">
      <h3>📊 你的成绩</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="label">最快</span>
          <span class="value">{{ bestTime }} ms</span>
        </div>
        <div class="stat-item">
          <span class="label">平均</span>
          <span class="value">{{ avgTime }} ms</span>
        </div>
        <div class="stat-item">
          <span class="label">次数</span>
          <span class="value">{{ attempts.length }}</span>
        </div>
      </div>
      <div class="history">
        <span v-for="(time, i) in attempts.slice(-10)" :key="i" class="history-item">
          {{ time }}ms
        </span>
      </div>
    </div>

    <div class="leaderboard">
      <h3>🏆 反应力等级</h3>
      <div class="levels">
        <div class="level">🐢 &gt;500ms 乌龟级</div>
        <div class="level">🚶 400-500ms 普通人</div>
        <div class="level">🏃 300-400ms 敏捷</div>
        <div class="level">⚡ 200-300ms 闪电侠</div>
        <div class="level">🚀 &lt;200ms 超人！</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const gameState = ref('waiting') // waiting, ready, go, result, early
const reactionTime = ref(0)
const startTime = ref(0)
const attempts = ref([])
let timeoutId = null

const bestTime = computed(() => Math.min(...attempts.value))
const avgTime = computed(() => Math.round(attempts.value.reduce((a, b) => a + b, 0) / attempts.value.length))

const getEmoji = computed(() => {
  if (reactionTime.value < 200) return '🚀'
  if (reactionTime.value < 300) return '⚡'
  if (reactionTime.value < 400) return '🏃'
  if (reactionTime.value < 500) return '🚶'
  return '🐢'
})

const getComment = computed(() => {
  if (reactionTime.value < 200) return '超人级别！难以置信！'
  if (reactionTime.value < 250) return '闪电般的反应！太强了！'
  if (reactionTime.value < 300) return '非常快！你很敏捷！'
  if (reactionTime.value < 400) return '不错的反应速度！'
  if (reactionTime.value < 500) return '还可以，继续练习！'
  return '有点慢哦，再试试？'
})

function handleClick() {
  if (gameState.value === 'waiting' || gameState.value === 'result' || gameState.value === 'early') {
    startGame()
  } else if (gameState.value === 'ready') {
    // 点太早了
    clearTimeout(timeoutId)
    gameState.value = 'early'
  } else if (gameState.value === 'go') {
    // 计算反应时间
    reactionTime.value = Date.now() - startTime.value
    attempts.value.push(reactionTime.value)
    gameState.value = 'result'
  }
}

function startGame() {
  gameState.value = 'ready'
  // 随机等待 2-5 秒
  const delay = 2000 + Math.random() * 3000
  timeoutId = setTimeout(() => {
    gameState.value = 'go'
    startTime.value = Date.now()
  }, delay)
}
</script>

<style scoped>
.game-view {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  padding-bottom: 120px;
}

h1 {
  font-size: 32px;
  margin: 0;
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 8px 0 24px;
}

.game-box {
  width: 100%;
  height: 300px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.game-box.waiting {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.game-box.ready {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.game-box.go {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  animation: pulse 0.5s infinite;
}

.game-box.result {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.game-box.early {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.game-text {
  color: white;
  text-align: center;
}

.game-text .big {
  font-size: 80px;
  display: block;
  margin-bottom: 16px;
}

.game-text p {
  margin: 8px 0;
  font-size: 20px;
}

.game-text .time {
  font-size: 48px;
  font-weight: bold;
}

.game-text .comment {
  font-size: 18px;
  opacity: 0.9;
}

.game-text .hint {
  font-size: 14px;
  opacity: 0.7;
  margin-top: 16px;
}

.stats {
  margin-top: 32px;
  background: var(--color-background-soft);
  border-radius: 16px;
  padding: 20px;
}

.stats h3 {
  margin: 0 0 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.stat-item .value {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}

.history {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.history-item {
  background: var(--color-background-mute);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.leaderboard {
  margin-top: 24px;
  background: var(--color-background-soft);
  border-radius: 16px;
  padding: 20px;
}

.leaderboard h3 {
  margin: 0 0 16px;
}

.levels {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level {
  padding: 8px;
  border-radius: 8px;
  background: var(--color-background-mute);
  font-size: 14px;
}
</style>
