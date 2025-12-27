<template>
  <div class="practice-view">
    <header class="page-header">
      <router-link to="/" class="back-btn">← 返回首页</router-link>
      <h1>🎮 交互式练习</h1>
      <p class="subtitle">动手操作 · 加深理解 · 即时反馈</p>
    </header>

    <!-- 练习选择 -->
    <div class="practice-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </div>

    <!-- 排序可视化 -->
    <section v-if="activeTab === 'sorting'" class="section">
      <h2>🔄 排序算法可视化</h2>
      <div class="sorting-demo">
        <div class="controls">
          <select v-model="sortAlgorithm">
            <option value="bubble">冒泡排序</option>
            <option value="selection">选择排序</option>
            <option value="insertion">插入排序</option>
            <option value="quick">快速排序</option>
          </select>
          <input type="range" v-model.number="arraySize" min="5" max="30" @change="generateArray">
          <span>数组大小: {{ arraySize }}</span>
          <button @click="generateArray" class="btn">🔄 重新生成</button>
          <button @click="startSort" class="btn primary" :disabled="isSorting">
            {{ isSorting ? '排序中...' : '▶ 开始排序' }}
          </button>
          <button @click="stopSort" class="btn" :disabled="!isSorting">⏹ 停止</button>
        </div>
        <div class="bars-container">
          <div 
            v-for="(val, idx) in sortArray" 
            :key="idx"
            class="bar"
            :class="{ 
              comparing: comparingIndices.includes(idx),
              sorted: sortedIndices.includes(idx)
            }"
            :style="{ height: val * 3 + 'px' }"
          >
            <span class="bar-value">{{ val }}</span>
          </div>
        </div>
        <div class="sort-info">
          <span>比较次数: {{ compareCount }}</span>
          <span>交换次数: {{ swapCount }}</span>
        </div>
      </div>
    </section>

    <!-- 二叉树构建 -->
    <section v-if="activeTab === 'tree'" class="section">
      <h2>🌳 二叉搜索树操作</h2>
      <div class="tree-demo">
        <div class="tree-controls">
          <input 
            type="number" 
            v-model.number="treeInput" 
            placeholder="输入数字"
            @keyup.enter="insertNode"
          >
          <button @click="insertNode" class="btn primary">插入节点</button>
          <button @click="deleteNode" class="btn">删除节点</button>
          <button @click="searchNode" class="btn">查找节点</button>
          <button @click="clearTree" class="btn danger">清空</button>
        </div>
        <div class="tree-message" v-if="treeMessage">{{ treeMessage }}</div>
        <div class="tree-visualization">
          <svg :viewBox="`0 0 ${treeWidth} ${treeHeight}`" v-if="treeRoot">
            <!-- 连接线 -->
            <line 
              v-for="edge in treeEdges" 
              :key="`${edge.x1}-${edge.y1}-${edge.x2}-${edge.y2}`"
              :x1="edge.x1" 
              :y1="edge.y1" 
              :x2="edge.x2" 
              :y2="edge.y2"
              class="tree-edge"
            />
            <!-- 节点 -->
            <g 
              v-for="node in treeNodes" 
              :key="node.value"
              :transform="`translate(${node.x}, ${node.y})`"
            >
              <circle 
                r="20" 
                :class="{ 
                  'tree-node': true, 
                  'highlighted': node.value === highlightedNode 
                }"
              />
              <text class="node-text" text-anchor="middle" dy="5">{{ node.value }}</text>
            </g>
          </svg>
          <div v-else class="empty-tree">树为空，请插入节点</div>
        </div>
        <div class="traversal-section">
          <h4>遍历结果：</h4>
          <div class="traversal-buttons">
            <button @click="preorderTraversal" class="btn small">前序遍历</button>
            <button @click="inorderTraversal" class="btn small">中序遍历</button>
            <button @click="postorderTraversal" class="btn small">后序遍历</button>
            <button @click="levelorderTraversal" class="btn small">层序遍历</button>
          </div>
          <div class="traversal-result" v-if="traversalResult">
            {{ traversalResult }}
          </div>
        </div>
      </div>
    </section>

    <!-- 栈和队列模拟 -->
    <section v-if="activeTab === 'stack'" class="section">
      <h2>📚 栈与队列模拟</h2>
      <div class="stack-queue-demo">
        <div class="demo-container">
          <div class="structure-box">
            <h3>栈 (LIFO)</h3>
            <div class="stack-controls">
              <input type="text" v-model="stackInput" placeholder="输入值" maxlength="3">
              <button @click="pushStack" class="btn primary">Push 入栈</button>
              <button @click="popStack" class="btn">Pop 出栈</button>
              <button @click="peekStack" class="btn">Peek 查看</button>
            </div>
            <div class="stack-visual">
              <div class="stack-container">
                <div 
                  v-for="(item, idx) in stack" 
                  :key="idx"
                  class="stack-item"
                  :class="{ 'top': idx === stack.length - 1 }"
                >
                  {{ item }}
                  <span v-if="idx === stack.length - 1" class="pointer">← top</span>
                </div>
                <div v-if="stack.length === 0" class="empty-hint">空栈</div>
              </div>
            </div>
            <div class="structure-message">{{ stackMessage }}</div>
          </div>

          <div class="structure-box">
            <h3>队列 (FIFO)</h3>
            <div class="queue-controls">
              <input type="text" v-model="queueInput" placeholder="输入值" maxlength="3">
              <button @click="enqueue" class="btn primary">Enqueue 入队</button>
              <button @click="dequeue" class="btn">Dequeue 出队</button>
              <button @click="peekQueue" class="btn">Peek 查看</button>
            </div>
            <div class="queue-visual">
              <div class="queue-container">
                <span v-if="queue.length > 0" class="front-pointer">front →</span>
                <div 
                  v-for="(item, idx) in queue" 
                  :key="idx"
                  class="queue-item"
                  :class="{ 'front': idx === 0, 'rear': idx === queue.length - 1 }"
                >
                  {{ item }}
                </div>
                <span v-if="queue.length > 0" class="rear-pointer">← rear</span>
                <div v-if="queue.length === 0" class="empty-hint">空队列</div>
              </div>
            </div>
            <div class="structure-message">{{ queueMessage }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 链表操作 -->
    <section v-if="activeTab === 'linkedlist'" class="section">
      <h2>🔗 链表操作</h2>
      <div class="linkedlist-demo">
        <div class="list-controls">
          <input type="text" v-model="listInput" placeholder="输入值" maxlength="3">
          <input type="number" v-model.number="listIndex" placeholder="位置" min="0">
          <button @click="insertHead" class="btn">头插</button>
          <button @click="insertTail" class="btn">尾插</button>
          <button @click="insertAt" class="btn primary">指定位置插入</button>
          <button @click="deleteAt" class="btn danger">删除位置</button>
          <button @click="reverseList" class="btn">反转链表</button>
          <button @click="clearList" class="btn">清空</button>
        </div>
        <div class="list-message">{{ listMessage }}</div>
        <div class="list-visual">
          <div class="head-pointer" v-if="linkedList.length > 0">head →</div>
          <div 
            v-for="(item, idx) in linkedList" 
            :key="idx"
            class="list-node"
          >
            <div class="node-data">{{ item }}</div>
            <div class="node-next" v-if="idx < linkedList.length - 1">→</div>
            <div class="node-null" v-else>→ null</div>
          </div>
          <div v-if="linkedList.length === 0" class="empty-list">链表为空</div>
        </div>
      </div>
    </section>

    <!-- 哈希表可视化 -->
    <section v-if="activeTab === 'hash'" class="section">
      <h2>#️⃣ 哈希表可视化</h2>
      <div class="hash-demo">
        <div class="hash-controls">
          <input type="text" v-model="hashKey" placeholder="键 (Key)" maxlength="10">
          <input type="text" v-model="hashValue" placeholder="值 (Value)" maxlength="10">
          <button @click="hashPut" class="btn primary">Put 插入</button>
          <button @click="hashGet" class="btn">Get 查找</button>
          <button @click="hashDelete" class="btn danger">Delete 删除</button>
          <button @click="hashClear" class="btn">清空</button>
        </div>
        <div class="hash-info">
          <span>哈希函数：hash(key) = key.charCodeAt(0) % {{ hashTableSize }}</span>
        </div>
        <div class="hash-message">{{ hashMessage }}</div>
        <div class="hash-table-visual">
          <div 
            v-for="(bucket, idx) in hashTable" 
            :key="idx"
            class="hash-bucket"
            :class="{ 'highlight': highlightBucket === idx }"
          >
            <div class="bucket-index">{{ idx }}</div>
            <div class="bucket-content">
              <div v-if="bucket.length === 0" class="empty-bucket">空</div>
              <div 
                v-for="(item, i) in bucket" 
                :key="i"
                class="bucket-item"
              >
                {{ item.key }}: {{ item.value }}
              </div>
            </div>
          </div>
        </div>
        <div class="hash-explanation">
          <p>💡 <strong>链地址法</strong>解决哈希冲突：相同哈希值的元素存储在同一个桶的链表中</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const activeTab = ref('sorting')

const tabs = [
  { id: 'sorting', name: '排序可视化', icon: '🔄' },
  { id: 'tree', name: '二叉树', icon: '🌳' },
  { id: 'stack', name: '栈与队列', icon: '📚' },
  { id: 'linkedlist', name: '链表', icon: '🔗' },
  { id: 'hash', name: '哈希表', icon: '#️⃣' }
]

// ========== 排序可视化 ==========
const sortArray = ref([])
const arraySize = ref(15)
const sortAlgorithm = ref('bubble')
const isSorting = ref(false)
const comparingIndices = ref([])
const sortedIndices = ref([])
const compareCount = ref(0)
const swapCount = ref(0)
let sortingAborted = false

function generateArray() {
  sortArray.value = Array.from({ length: arraySize.value }, () => 
    Math.floor(Math.random() * 80) + 10
  )
  comparingIndices.value = []
  sortedIndices.value = []
  compareCount.value = 0
  swapCount.value = 0
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function startSort() {
  if (isSorting.value) return
  isSorting.value = true
  sortingAborted = false
  comparingIndices.value = []
  sortedIndices.value = []
  compareCount.value = 0
  swapCount.value = 0

  switch (sortAlgorithm.value) {
    case 'bubble': await bubbleSort(); break
    case 'selection': await selectionSort(); break
    case 'insertion': await insertionSort(); break
    case 'quick': await quickSort(0, sortArray.value.length - 1); break
  }

  if (!sortingAborted) {
    sortedIndices.value = sortArray.value.map((_, i) => i)
  }
  isSorting.value = false
}

function stopSort() {
  sortingAborted = true
  isSorting.value = false
}

async function bubbleSort() {
  const arr = sortArray.value
  for (let i = 0; i < arr.length - 1 && !sortingAborted; i++) {
    for (let j = 0; j < arr.length - 1 - i && !sortingAborted; j++) {
      comparingIndices.value = [j, j + 1]
      compareCount.value++
      await sleep(50)
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapCount.value++
      }
    }
    sortedIndices.value.push(arr.length - 1 - i)
  }
}

async function selectionSort() {
  const arr = sortArray.value
  for (let i = 0; i < arr.length - 1 && !sortingAborted; i++) {
    let minIdx = i
    for (let j = i + 1; j < arr.length && !sortingAborted; j++) {
      comparingIndices.value = [minIdx, j]
      compareCount.value++
      await sleep(50)
      if (arr[j] < arr[minIdx]) minIdx = j
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
      swapCount.value++
    }
    sortedIndices.value.push(i)
  }
}

async function insertionSort() {
  const arr = sortArray.value
  for (let i = 1; i < arr.length && !sortingAborted; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key && !sortingAborted) {
      comparingIndices.value = [j, j + 1]
      compareCount.value++
      arr[j + 1] = arr[j]
      swapCount.value++
      j--
      await sleep(50)
    }
    arr[j + 1] = key
  }
}

async function quickSort(left, right) {
  if (left >= right || sortingAborted) return
  const pivot = sortArray.value[right]
  let i = left - 1
  for (let j = left; j < right && !sortingAborted; j++) {
    comparingIndices.value = [j, right]
    compareCount.value++
    await sleep(50)
    if (sortArray.value[j] <= pivot) {
      i++;
      [sortArray.value[i], sortArray.value[j]] = [sortArray.value[j], sortArray.value[i]]
      swapCount.value++
    }
  }
  [sortArray.value[i + 1], sortArray.value[right]] = [sortArray.value[right], sortArray.value[i + 1]]
  swapCount.value++
  sortedIndices.value.push(i + 1)
  await quickSort(left, i)
  await quickSort(i + 2, right)
}

// ========== 二叉搜索树 ==========
const treeInput = ref(null)
const treeMessage = ref('')
const treeRoot = ref(null)
const highlightedNode = ref(null)
const traversalResult = ref('')
const treeWidth = 600
const treeHeight = 300

class TreeNode {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
  }
}

function insertBST(node, value) {
  if (!node) return new TreeNode(value)
  if (value < node.value) {
    node.left = insertBST(node.left, value)
  } else if (value > node.value) {
    node.right = insertBST(node.right, value)
  }
  return node
}

function insertNode() {
  if (treeInput.value === null || isNaN(treeInput.value)) {
    treeMessage.value = '请输入有效数字'
    return
  }
  treeRoot.value = insertBST(treeRoot.value, treeInput.value)
  treeMessage.value = `已插入节点 ${treeInput.value}`
  treeInput.value = null
  highlightedNode.value = null
}

function deleteNode() {
  if (treeInput.value === null) return
  treeRoot.value = deleteBST(treeRoot.value, treeInput.value)
  treeMessage.value = `已删除节点 ${treeInput.value}`
  treeInput.value = null
}

function deleteBST(node, value) {
  if (!node) return null
  if (value < node.value) {
    node.left = deleteBST(node.left, value)
  } else if (value > node.value) {
    node.right = deleteBST(node.right, value)
  } else {
    if (!node.left) return node.right
    if (!node.right) return node.left
    let minNode = node.right
    while (minNode.left) minNode = minNode.left
    node.value = minNode.value
    node.right = deleteBST(node.right, minNode.value)
  }
  return node
}

function searchNode() {
  if (treeInput.value === null) return
  const found = searchBST(treeRoot.value, treeInput.value)
  if (found) {
    highlightedNode.value = treeInput.value
    treeMessage.value = `找到节点 ${treeInput.value}`
  } else {
    highlightedNode.value = null
    treeMessage.value = `未找到节点 ${treeInput.value}`
  }
}

function searchBST(node, value) {
  if (!node) return false
  if (value === node.value) return true
  if (value < node.value) return searchBST(node.left, value)
  return searchBST(node.right, value)
}

function clearTree() {
  treeRoot.value = null
  treeMessage.value = '树已清空'
  traversalResult.value = ''
}

const treeNodes = computed(() => {
  if (!treeRoot.value) return []
  const nodes = []
  const queue = [{ node: treeRoot.value, x: treeWidth / 2, y: 40, level: 0 }]
  while (queue.length) {
    const { node, x, y, level } = queue.shift()
    nodes.push({ value: node.value, x, y })
    const offset = treeWidth / Math.pow(2, level + 2)
    if (node.left) {
      queue.push({ node: node.left, x: x - offset, y: y + 60, level: level + 1 })
    }
    if (node.right) {
      queue.push({ node: node.right, x: x + offset, y: y + 60, level: level + 1 })
    }
  }
  return nodes
})

const treeEdges = computed(() => {
  if (!treeRoot.value) return []
  const edges = []
  const queue = [{ node: treeRoot.value, x: treeWidth / 2, y: 40, level: 0 }]
  while (queue.length) {
    const { node, x, y, level } = queue.shift()
    const offset = treeWidth / Math.pow(2, level + 2)
    if (node.left) {
      edges.push({ x1: x, y1: y, x2: x - offset, y2: y + 60 })
      queue.push({ node: node.left, x: x - offset, y: y + 60, level: level + 1 })
    }
    if (node.right) {
      edges.push({ x1: x, y1: y, x2: x + offset, y2: y + 60 })
      queue.push({ node: node.right, x: x + offset, y: y + 60, level: level + 1 })
    }
  }
  return edges
})

function preorderTraversal() {
  const result = []
  function traverse(node) {
    if (!node) return
    result.push(node.value)
    traverse(node.left)
    traverse(node.right)
  }
  traverse(treeRoot.value)
  traversalResult.value = `前序遍历: ${result.join(' → ')}`
}

function inorderTraversal() {
  const result = []
  function traverse(node) {
    if (!node) return
    traverse(node.left)
    result.push(node.value)
    traverse(node.right)
  }
  traverse(treeRoot.value)
  traversalResult.value = `中序遍历: ${result.join(' → ')}`
}

function postorderTraversal() {
  const result = []
  function traverse(node) {
    if (!node) return
    traverse(node.left)
    traverse(node.right)
    result.push(node.value)
  }
  traverse(treeRoot.value)
  traversalResult.value = `后序遍历: ${result.join(' → ')}`
}

function levelorderTraversal() {
  const result = []
  const queue = [treeRoot.value]
  while (queue.length) {
    const node = queue.shift()
    if (node) {
      result.push(node.value)
      queue.push(node.left)
      queue.push(node.right)
    }
  }
  traversalResult.value = `层序遍历: ${result.join(' → ')}`
}

// ========== 栈与队列 ==========
const stack = ref([])
const stackInput = ref('')
const stackMessage = ref('')
const queue = ref([])
const queueInput = ref('')
const queueMessage = ref('')

function pushStack() {
  if (!stackInput.value) return
  stack.value.push(stackInput.value)
  stackMessage.value = `Push: ${stackInput.value}`
  stackInput.value = ''
}

function popStack() {
  if (stack.value.length === 0) {
    stackMessage.value = 'Stack Underflow!'
    return
  }
  const val = stack.value.pop()
  stackMessage.value = `Pop: ${val}`
}

function peekStack() {
  if (stack.value.length === 0) {
    stackMessage.value = '栈为空'
    return
  }
  stackMessage.value = `Top: ${stack.value[stack.value.length - 1]}`
}

function enqueue() {
  if (!queueInput.value) return
  queue.value.push(queueInput.value)
  queueMessage.value = `Enqueue: ${queueInput.value}`
  queueInput.value = ''
}

function dequeue() {
  if (queue.value.length === 0) {
    queueMessage.value = 'Queue Empty!'
    return
  }
  const val = queue.value.shift()
  queueMessage.value = `Dequeue: ${val}`
}

function peekQueue() {
  if (queue.value.length === 0) {
    queueMessage.value = '队列为空'
    return
  }
  queueMessage.value = `Front: ${queue.value[0]}`
}

// ========== 链表 ==========
const linkedList = ref([])
const listInput = ref('')
const listIndex = ref(0)
const listMessage = ref('')

function insertHead() {
  if (!listInput.value) return
  linkedList.value.unshift(listInput.value)
  listMessage.value = `头插: ${listInput.value}`
  listInput.value = ''
}

function insertTail() {
  if (!listInput.value) return
  linkedList.value.push(listInput.value)
  listMessage.value = `尾插: ${listInput.value}`
  listInput.value = ''
}

function insertAt() {
  if (!listInput.value) return
  const idx = Math.min(Math.max(0, listIndex.value), linkedList.value.length)
  linkedList.value.splice(idx, 0, listInput.value)
  listMessage.value = `在位置 ${idx} 插入: ${listInput.value}`
  listInput.value = ''
}

function deleteAt() {
  if (linkedList.value.length === 0) {
    listMessage.value = '链表为空'
    return
  }
  const idx = Math.min(Math.max(0, listIndex.value), linkedList.value.length - 1)
  const val = linkedList.value.splice(idx, 1)[0]
  listMessage.value = `删除位置 ${idx}: ${val}`
}

function reverseList() {
  linkedList.value.reverse()
  listMessage.value = '链表已反转'
}

function clearList() {
  linkedList.value = []
  listMessage.value = '链表已清空'
}

// ========== 哈希表 ==========
const hashTableSize = 7
const hashTable = ref(Array.from({ length: hashTableSize }, () => []))
const hashKey = ref('')
const hashValue = ref('')
const hashMessage = ref('')
const highlightBucket = ref(-1)

function hashFunction(key) {
  return key.charCodeAt(0) % hashTableSize
}

function hashPut() {
  if (!hashKey.value || !hashValue.value) {
    hashMessage.value = '请输入键和值'
    return
  }
  const idx = hashFunction(hashKey.value)
  highlightBucket.value = idx
  const bucket = hashTable.value[idx]
  const existing = bucket.find(item => item.key === hashKey.value)
  if (existing) {
    existing.value = hashValue.value
    hashMessage.value = `更新: ${hashKey.value} = ${hashValue.value} (桶 ${idx})`
  } else {
    bucket.push({ key: hashKey.value, value: hashValue.value })
    hashMessage.value = `插入: ${hashKey.value} = ${hashValue.value} (桶 ${idx})`
  }
  hashKey.value = ''
  hashValue.value = ''
  setTimeout(() => highlightBucket.value = -1, 1000)
}

function hashGet() {
  if (!hashKey.value) return
  const idx = hashFunction(hashKey.value)
  highlightBucket.value = idx
  const bucket = hashTable.value[idx]
  const found = bucket.find(item => item.key === hashKey.value)
  if (found) {
    hashMessage.value = `找到: ${found.key} = ${found.value} (桶 ${idx})`
  } else {
    hashMessage.value = `未找到键: ${hashKey.value}`
  }
  setTimeout(() => highlightBucket.value = -1, 1000)
}

function hashDelete() {
  if (!hashKey.value) return
  const idx = hashFunction(hashKey.value)
  highlightBucket.value = idx
  const bucket = hashTable.value[idx]
  const index = bucket.findIndex(item => item.key === hashKey.value)
  if (index >= 0) {
    bucket.splice(index, 1)
    hashMessage.value = `已删除: ${hashKey.value}`
  } else {
    hashMessage.value = `未找到键: ${hashKey.value}`
  }
  hashKey.value = ''
  setTimeout(() => highlightBucket.value = -1, 1000)
}

function hashClear() {
  hashTable.value = Array.from({ length: hashTableSize }, () => [])
  hashMessage.value = '哈希表已清空'
}

onMounted(() => {
  generateArray()
})
</script>

<style scoped>
.practice-view {
  min-height: 100vh;
  background: var(--color-background);
  padding: 20px;
  padding-bottom: 100px;
}

.page-header {
  max-width: 900px;
  margin: 0 auto 24px;
}

.back-btn {
  display: inline-block;
  padding: 8px 16px;
  background: var(--color-background-soft);
  border-radius: 20px;
  margin-bottom: 16px;
  font-size: 14px;
}

.page-header h1 { font-size: 28px; margin: 0; }
.subtitle { color: var(--color-text-secondary); margin: 8px 0 0; }

.practice-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto 24px;
}

.practice-tabs button {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: var(--color-background-soft);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.practice-tabs button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.section {
  max-width: 900px;
  margin: 0 auto;
  background: var(--color-background-soft);
  border-radius: 16px;
  padding: 24px;
}

.section h2 { margin: 0 0 20px; }

/* 通用按钮 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--color-background-mute);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover { opacity: 0.8; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.primary { background: var(--color-primary); color: white; }
.btn.danger { background: #ef4444; color: white; }
.btn.small { padding: 6px 12px; font-size: 12px; }

input, select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  font-size: 14px;
}

/* 排序可视化 */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  height: 280px;
  padding: 20px;
  background: var(--color-background-mute);
  border-radius: 12px;
}

.bar {
  width: 24px;
  background: var(--color-primary);
  border-radius: 4px 4px 0 0;
  transition: height 0.1s, background 0.1s;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4px;
}

.bar.comparing { background: #f59e0b; }
.bar.sorted { background: #10b981; }

.bar-value {
  font-size: 10px;
  color: white;
}

.sort-info {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  font-size: 14px;
}

/* 二叉树 */
.tree-demo { }
.tree-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.tree-message {
  padding: 12px;
  background: var(--color-background-mute);
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.tree-visualization {
  background: var(--color-background-mute);
  border-radius: 12px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tree-visualization svg { width: 100%; height: 300px; }

.tree-edge {
  stroke: var(--color-border);
  stroke-width: 2;
}

.tree-node {
  fill: var(--color-primary);
}

.tree-node.highlighted {
  fill: #10b981;
}

.node-text {
  fill: white;
  font-size: 12px;
}

.empty-tree {
  color: var(--color-text-secondary);
}

.traversal-section {
  margin-top: 20px;
}

.traversal-section h4 { margin: 0 0 12px; }

.traversal-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.traversal-result {
  padding: 12px;
  background: var(--color-background-mute);
  border-radius: 8px;
  font-family: monospace;
}

/* 栈与队列 */
.demo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.structure-box {
  background: var(--color-background-mute);
  border-radius: 12px;
  padding: 20px;
}

.structure-box h3 { margin: 0 0 16px; text-align: center; }

.stack-controls, .queue-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.stack-visual, .queue-visual {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stack-container {
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;
  min-width: 80px;
}

.stack-item {
  padding: 12px 20px;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  text-align: center;
  position: relative;
}

.stack-item.top { background: #10b981; }

.pointer {
  position: absolute;
  right: -50px;
  font-size: 12px;
}

.queue-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.queue-item {
  padding: 12px 20px;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
}

.queue-item.front { background: #10b981; }
.queue-item.rear { background: #f59e0b; }

.front-pointer, .rear-pointer {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.empty-hint {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.structure-message {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
  color: var(--color-text-secondary);
}

/* 链表 */
.list-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.list-message {
  padding: 12px;
  background: var(--color-background-mute);
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.list-visual {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 100px;
  padding: 20px;
  background: var(--color-background-mute);
  border-radius: 12px;
}

.head-pointer {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.list-node {
  display: flex;
  align-items: center;
}

.node-data {
  padding: 12px 20px;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
}

.node-next, .node-null {
  padding: 0 8px;
  color: var(--color-text-secondary);
}

.empty-list {
  color: var(--color-text-secondary);
}

/* 哈希表 */
.hash-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.hash-info {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.hash-message {
  padding: 12px;
  background: var(--color-background-mute);
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.hash-table-visual {
  display: flex;
  gap: 8px;
}

.hash-bucket {
  flex: 1;
  background: var(--color-background-mute);
  border-radius: 8px;
  padding: 12px;
  min-height: 150px;
  transition: background 0.3s;
}

.hash-bucket.highlight {
  background: rgba(102, 126, 234, 0.2);
}

.bucket-index {
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.bucket-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-bucket {
  color: var(--color-text-secondary);
  font-size: 12px;
  text-align: center;
}

.bucket-item {
  padding: 8px;
  background: var(--color-primary);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.hash-explanation {
  margin-top: 16px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .demo-container { grid-template-columns: 1fr; }
  .hash-table-visual { flex-wrap: wrap; }
  .hash-bucket { min-width: 80px; }
}
</style>

