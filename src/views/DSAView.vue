<template>
  <div class="dsa-view">
    <h1>📚 数据结构与算法速查</h1>
    <p class="subtitle">期末必备 · 考点精华</p>

    <!-- 快速导航 -->
    <div class="nav-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </div>

    <!-- 时间复杂度速查 -->
    <section v-if="activeTab === 'complexity'" class="section">
      <h2>⏱️ 时间复杂度速查表</h2>
      <div class="complexity-table">
        <table>
          <thead>
            <tr>
              <th>数据结构/算法</th>
              <th>访问</th>
              <th>查找</th>
              <th>插入</th>
              <th>删除</th>
              <th>空间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in complexityData" :key="item.name">
              <td class="name">{{ item.name }}</td>
              <td :class="getComplexityClass(item.access)">{{ item.access }}</td>
              <td :class="getComplexityClass(item.search)">{{ item.search }}</td>
              <td :class="getComplexityClass(item.insert)">{{ item.insert }}</td>
              <td :class="getComplexityClass(item.delete)">{{ item.delete }}</td>
              <td :class="getComplexityClass(item.space)">{{ item.space }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="legend">
        <span class="good">O(1) 最优</span>
        <span class="ok">O(log n) 良好</span>
        <span class="fair">O(n) 一般</span>
        <span class="bad">O(n²) 较差</span>
      </div>
    </section>

    <!-- 排序算法 -->
    <section v-if="activeTab === 'sorting'" class="section">
      <h2>🔄 排序算法对比</h2>
      <div class="cards-grid">
        <div v-for="sort in sortingAlgorithms" :key="sort.name" class="algo-card">
          <h3>{{ sort.name }}</h3>
          <div class="algo-stats">
            <div class="stat">
              <span class="label">最好</span>
              <span :class="getComplexityClass(sort.best)">{{ sort.best }}</span>
            </div>
            <div class="stat">
              <span class="label">平均</span>
              <span :class="getComplexityClass(sort.avg)">{{ sort.avg }}</span>
            </div>
            <div class="stat">
              <span class="label">最坏</span>
              <span :class="getComplexityClass(sort.worst)">{{ sort.worst }}</span>
            </div>
            <div class="stat">
              <span class="label">空间</span>
              <span :class="getComplexityClass(sort.space)">{{ sort.space }}</span>
            </div>
            <div class="stat">
              <span class="label">稳定</span>
              <span :class="sort.stable ? 'good' : 'bad'">{{ sort.stable ? '✓' : '✗' }}</span>
            </div>
          </div>
          <p class="algo-desc">{{ sort.desc }}</p>
          <div class="algo-key">💡 {{ sort.key }}</div>
        </div>
      </div>
    </section>

    <!-- 数据结构 -->
    <section v-if="activeTab === 'structures'" class="section">
      <h2>🏗️ 数据结构详解</h2>
      <div class="accordion">
        <div v-for="ds in dataStructures" :key="ds.name" class="accordion-item">
          <div class="accordion-header" @click="toggleAccordion(ds.name)">
            <span>{{ ds.icon }} {{ ds.name }}</span>
            <span class="arrow">{{ openItems.includes(ds.name) ? '▼' : '▶' }}</span>
          </div>
          <div class="accordion-content" v-show="openItems.includes(ds.name)">
            <p><strong>定义：</strong>{{ ds.definition }}</p>
            <p><strong>特点：</strong></p>
            <ul>
              <li v-for="(feat, i) in ds.features" :key="i">{{ feat }}</li>
            </ul>
            <p><strong>应用场景：</strong>{{ ds.usage }}</p>
            <p><strong>考点：</strong></p>
            <ul class="exam-points">
              <li v-for="(point, i) in ds.examPoints" :key="i">⭐ {{ point }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 树与图 -->
    <section v-if="activeTab === 'tree'" class="section">
      <h2>🌳 树与图</h2>
      
      <h3>二叉树遍历</h3>
      <div class="traversal-box">
        <div class="tree-visual">
          <pre>
       1
      / \
     2   3
    / \   \
   4   5   6
          </pre>
        </div>
        <div class="traversal-results">
          <div class="result-item">
            <strong>前序遍历（根左右）：</strong>
            <code>1 → 2 → 4 → 5 → 3 → 6</code>
          </div>
          <div class="result-item">
            <strong>中序遍历（左根右）：</strong>
            <code>4 → 2 → 5 → 1 → 3 → 6</code>
          </div>
          <div class="result-item">
            <strong>后序遍历（左右根）：</strong>
            <code>4 → 5 → 2 → 6 → 3 → 1</code>
          </div>
          <div class="result-item">
            <strong>层序遍历（BFS）：</strong>
            <code>1 → 2 → 3 → 4 → 5 → 6</code>
          </div>
        </div>
      </div>

      <h3>重要公式</h3>
      <div class="formulas">
        <div class="formula-item">
          <span class="formula">n₀ = n₂ + 1</span>
          <span class="explain">叶子节点 = 度为2的节点 + 1</span>
        </div>
        <div class="formula-item">
          <span class="formula">n = n₀ + n₁ + n₂</span>
          <span class="explain">总节点 = 各度节点之和</span>
        </div>
        <div class="formula-item">
          <span class="formula">深度 h 的满二叉树：2ʰ - 1 个节点</span>
          <span class="explain">第 i 层最多 2^(i-1) 个节点</span>
        </div>
        <div class="formula-item">
          <span class="formula">完全二叉树：父节点 i，左孩子 2i，右孩子 2i+1</span>
          <span class="explain">适用于数组存储</span>
        </div>
      </div>

      <h3>图的遍历</h3>
      <div class="graph-compare">
        <div class="compare-item">
          <h4>DFS 深度优先</h4>
          <ul>
            <li>使用<strong>栈</strong>（递归隐式栈）</li>
            <li>一条路走到黑</li>
            <li>适合：路径搜索、拓扑排序</li>
          </ul>
        </div>
        <div class="compare-item">
          <h4>BFS 广度优先</h4>
          <ul>
            <li>使用<strong>队列</strong></li>
            <li>层层推进</li>
            <li>适合：最短路径、层序遍历</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 考点速记 -->
    <section v-if="activeTab === 'exam'" class="section">
      <h2>🎯 高频考点速记</h2>
      <div class="exam-cards">
        <div v-for="(topic, idx) in examTopics" :key="idx" class="exam-card">
          <h3>{{ topic.title }}</h3>
          <ul>
            <li v-for="(point, i) in topic.points" :key="i">{{ point }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 练习模式 -->
    <section v-if="activeTab === 'quiz'" class="section">
      <h2>✍️ 自测练习</h2>
      <div v-if="!quizStarted" class="quiz-start">
        <p>随机抽取10道题目，测试你的掌握程度</p>
        <button class="btn-primary" @click="startQuiz">开始测试</button>
      </div>
      <div v-else-if="!quizFinished" class="quiz-box">
        <div class="quiz-progress">
          <span>第 {{ currentQuestion + 1 }} / {{ quizQuestions.length }} 题</span>
          <span>正确: {{ correctCount }}</span>
        </div>
        <div class="question">
          <p>{{ quizQuestions[currentQuestion].q }}</p>
        </div>
        <div class="options">
          <button 
            v-for="(opt, i) in quizQuestions[currentQuestion].options" 
            :key="i"
            :class="{ 
              selected: selectedAnswer === i,
              correct: showAnswer && i === quizQuestions[currentQuestion].answer,
              wrong: showAnswer && selectedAnswer === i && i !== quizQuestions[currentQuestion].answer
            }"
            :disabled="showAnswer"
            @click="selectAnswer(i)"
          >
            {{ String.fromCharCode(65 + i) }}. {{ opt }}
          </button>
        </div>
        <div v-if="showAnswer" class="answer-explain">
          <p><strong>解析：</strong>{{ quizQuestions[currentQuestion].explain }}</p>
          <button class="btn-primary" @click="nextQuestion">
            {{ currentQuestion < quizQuestions.length - 1 ? '下一题' : '查看结果' }}
          </button>
        </div>
      </div>
      <div v-else class="quiz-result">
        <h3>测试完成！</h3>
        <div class="score">{{ correctCount }} / {{ quizQuestions.length }}</div>
        <p class="score-comment">{{ getScoreComment }}</p>
        <button class="btn-primary" @click="resetQuiz">再测一次</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('complexity')
const openItems = ref([])

const tabs = [
  { id: 'complexity', name: '复杂度', icon: '⏱️' },
  { id: 'sorting', name: '排序', icon: '🔄' },
  { id: 'structures', name: '数据结构', icon: '🏗️' },
  { id: 'tree', name: '树与图', icon: '🌳' },
  { id: 'exam', name: '考点', icon: '🎯' },
  { id: 'quiz', name: '自测', icon: '✍️' }
]

// 复杂度数据
const complexityData = [
  { name: '数组', access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)', space: 'O(n)' },
  { name: '链表', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { name: '栈/队列', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { name: '哈希表', access: '-', search: 'O(1)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { name: '二叉搜索树', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
  { name: 'AVL树', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
  { name: '堆', access: '-', search: 'O(n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' }
]

// 排序算法
const sortingAlgorithms = [
  { name: '冒泡排序', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true, 
    desc: '相邻元素两两比较，大的往后冒', key: '优化：如果一趟没有交换，说明已排序' },
  { name: '选择排序', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false,
    desc: '每次选最小的放到前面', key: '不稳定！交换可能打乱相同元素顺序' },
  { name: '插入排序', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true,
    desc: '像打牌一样插入合适位置', key: '对基本有序的数组效率高' },
  { name: '希尔排序', best: 'O(n log n)', avg: 'O(n^1.3)', worst: 'O(n²)', space: 'O(1)', stable: false,
    desc: '分组插入排序，逐步缩小增量', key: '增量序列的选择影响效率' },
  { name: '归并排序', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true,
    desc: '分治思想，先分后合', key: '需要额外O(n)空间，但稳定' },
  { name: '快速排序', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false,
    desc: '选基准，分区递归', key: '最常考！基准选择很重要' },
  { name: '堆排序', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: false,
    desc: '利用堆的性质排序', key: '建堆O(n)，每次取堆顶O(log n)' },
  { name: '计数排序', best: 'O(n+k)', avg: 'O(n+k)', worst: 'O(n+k)', space: 'O(k)', stable: true,
    desc: '统计每个值出现次数', key: '适合范围小的整数' }
]

// 数据结构详解
const dataStructures = [
  { 
    name: '栈 Stack', icon: '📚',
    definition: '后进先出(LIFO)的线性表，只能在一端进行插入删除',
    features: ['push入栈、pop出栈、peek查看栈顶', '递归调用使用系统栈', '可用数组或链表实现'],
    usage: '括号匹配、表达式求值、函数调用、浏览器前进后退',
    examPoints: ['入栈出栈序列判断', '中缀转后缀表达式', '栈的链式存储']
  },
  { 
    name: '队列 Queue', icon: '🚶',
    definition: '先进先出(FIFO)的线性表，队尾入队，队头出队',
    features: ['enqueue入队、dequeue出队', '循环队列解决假溢出', '双端队列两端都可操作'],
    usage: 'BFS广度优先搜索、任务调度、缓冲区',
    examPoints: ['循环队列判空判满', '队列长度计算：(rear-front+n)%n', '链式队列']
  },
  { 
    name: '链表 LinkedList', icon: '🔗',
    definition: '由节点组成，每个节点包含数据和指向下一节点的指针',
    features: ['单链表、双链表、循环链表', '插入删除O(1)，查找O(n)', '不需要连续内存空间'],
    usage: '动态数据存储、LRU缓存、多项式运算',
    examPoints: ['头插法/尾插法建表', '链表反转', '找中间节点/环检测', '合并有序链表']
  },
  { 
    name: '二叉树 BinaryTree', icon: '🌲',
    definition: '每个节点最多有两个子节点的树结构',
    features: ['满二叉树、完全二叉树、二叉搜索树', '前中后层四种遍历', '递归定义'],
    usage: '搜索、排序、表达式树、哈夫曼编码',
    examPoints: ['由遍历序列还原二叉树', '树的高度/节点数计算', 'BST插入删除查找', '平衡因子与旋转']
  },
  { 
    name: '堆 Heap', icon: '⛰️',
    definition: '完全二叉树，满足父节点大于（大顶堆）或小于（小顶堆）子节点',
    features: ['用数组存储，父i子2i和2i+1', '插入上浮、删除下沉', '堆排序基础'],
    usage: '优先队列、Top-K问题、堆排序',
    examPoints: ['建堆过程O(n)', '堆的插入删除操作', '堆排序代码实现']
  },
  { 
    name: '图 Graph', icon: '🕸️',
    definition: '由顶点和边组成的非线性结构',
    features: ['有向图/无向图、带权图', '邻接矩阵/邻接表存储', 'DFS深度优先/BFS广度优先'],
    usage: '社交网络、地图导航、任务调度',
    examPoints: ['DFS和BFS代码', '最短路径Dijkstra', '最小生成树Prim/Kruskal', '拓扑排序']
  }
]

// 考点速记
const examTopics = [
  { title: '💡 易混淆概念', points: [
    '栈：后进先出LIFO ｜ 队列：先进先出FIFO',
    '度：无向图边数 ｜ 入度/出度：有向图区分',
    '满二叉树：所有层都满 ｜ 完全二叉树：最后一层靠左',
    '稳定排序：相同元素相对位置不变（冒泡、插入、归并）',
    'AVL树：|平衡因子|≤1 ｜ 红黑树：黑高相等'
  ]},
  { title: '📝 必背公式', points: [
    '二叉树：n₀ = n₂ + 1',
    '完全二叉树高度：⌊log₂n⌋ + 1',
    '循环队列长度：(rear - front + n) % n',
    '哈希冲突处理：开放定址法、链地址法',
    '图的边数：无向图最多n(n-1)/2，有向图最多n(n-1)'
  ]},
  { title: '🔥 高频算法', points: [
    '快速排序：partition划分过程',
    '归并排序：merge合并过程',
    '二叉树遍历：递归和非递归写法',
    'DFS/BFS：邻接矩阵和邻接表两种实现',
    'Dijkstra最短路径、Prim/Kruskal最小生成树'
  ]},
  { title: '⚠️ 常见陷阱', points: [
    '快排最坏情况O(n²)：已有序数组',
    '堆排序不稳定，归并排序需要O(n)空间',
    'BST删除节点：找后继或前驱替换',
    'AVL旋转：LL右旋、RR左旋、LR先左后右、RL先右后左',
    'Dijkstra不能处理负权边，用Bellman-Ford'
  ]}
]

// 自测练习
const allQuestions = [
  { q: '快速排序的平均时间复杂度是？', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 1, explain: '快速排序平均O(n log n)，最坏O(n²)' },
  { q: '哪种排序是稳定的？', options: ['快速排序', '堆排序', '归并排序', '选择排序'], answer: 2, explain: '归并排序稳定，合并时相等元素保持原顺序' },
  { q: '栈的特点是？', options: ['先进先出', '后进先出', '随机访问', '双端操作'], answer: 1, explain: '栈是LIFO后进先出' },
  { q: '完全二叉树用数组存储，节点i的左孩子是？', options: ['i+1', '2i', '2i+1', 'i/2'], answer: 1, explain: '左孩子2i，右孩子2i+1，父节点i/2（下标从1开始）' },
  { q: '下列哪个不是图的存储方式？', options: ['邻接矩阵', '邻接表', '十字链表', '顺序表'], answer: 3, explain: '顺序表是线性表的存储方式，不是图的' },
  { q: 'n个节点的完全二叉树高度是？', options: ['n', 'log n', '⌊log₂n⌋+1', 'n/2'], answer: 2, explain: '完全二叉树高度为⌊log₂n⌋+1' },
  { q: 'DFS使用的数据结构是？', options: ['队列', '栈', '堆', '哈希表'], answer: 1, explain: 'DFS用栈（递归隐式使用系统栈），BFS用队列' },
  { q: '二叉树中，叶子节点数n₀和度为2的节点数n₂的关系？', options: ['n₀=n₂', 'n₀=n₂+1', 'n₀=n₂-1', 'n₀=2n₂'], answer: 1, explain: '任意二叉树：n₀ = n₂ + 1' },
  { q: '堆排序建堆的时间复杂度是？', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 0, explain: '建堆O(n)，整体堆排序O(n log n)' },
  { q: '哈希表解决冲突的方法不包括？', options: ['开放定址法', '链地址法', '再哈希法', '分治法'], answer: 3, explain: '分治是算法设计策略，不是哈希冲突解决方法' },
  { q: 'Dijkstra算法不能处理？', options: ['有向图', '无向图', '负权边', '稀疏图'], answer: 2, explain: 'Dijkstra不能处理负权边，需要用Bellman-Ford' },
  { q: '中序遍历二叉搜索树得到的序列是？', options: ['递减序列', '递增序列', '随机序列', '层序序列'], answer: 1, explain: 'BST中序遍历得到有序递增序列' },
  { q: '循环队列判满条件是？', options: ['front==rear', '(rear+1)%n==front', 'rear==n-1', 'front==0'], answer: 1, explain: '循环队列牺牲一个位置，(rear+1)%n==front表示满' },
  { q: '下列排序算法空间复杂度最高的是？', options: ['快速排序', '归并排序', '堆排序', '插入排序'], answer: 1, explain: '归并排序需要O(n)辅助空间' },
  { q: 'AVL树的平衡因子范围是？', options: ['0', '-1,0,1', '-2到2', '任意'], answer: 1, explain: 'AVL树每个节点平衡因子只能是-1,0,1' }
]

const quizStarted = ref(false)
const quizFinished = ref(false)
const quizQuestions = ref([])
const currentQuestion = ref(0)
const selectedAnswer = ref(-1)
const showAnswer = ref(false)
const correctCount = ref(0)

function toggleAccordion(name) {
  const idx = openItems.value.indexOf(name)
  if (idx >= 0) {
    openItems.value.splice(idx, 1)
  } else {
    openItems.value.push(name)
  }
}

function getComplexityClass(complexity) {
  if (complexity === 'O(1)' || complexity === '-') return 'good'
  if (complexity.includes('log')) return 'ok'
  if (complexity === 'O(n)' || complexity === 'O(n+k)') return 'fair'
  return 'bad'
}

function startQuiz() {
  // 随机选10题
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
  quizQuestions.value = shuffled.slice(0, 10)
  quizStarted.value = true
  quizFinished.value = false
  currentQuestion.value = 0
  correctCount.value = 0
  selectedAnswer.value = -1
  showAnswer.value = false
}

function selectAnswer(idx) {
  selectedAnswer.value = idx
  showAnswer.value = true
  if (idx === quizQuestions.value[currentQuestion.value].answer) {
    correctCount.value++
  }
}

function nextQuestion() {
  if (currentQuestion.value < quizQuestions.value.length - 1) {
    currentQuestion.value++
    selectedAnswer.value = -1
    showAnswer.value = false
  } else {
    quizFinished.value = true
  }
}

function resetQuiz() {
  quizStarted.value = false
  quizFinished.value = false
}

const getScoreComment = computed(() => {
  const ratio = correctCount.value / quizQuestions.value.length
  if (ratio >= 0.9) return '🎉 太棒了！掌握得很好！'
  if (ratio >= 0.7) return '👍 不错，继续加油！'
  if (ratio >= 0.5) return '💪 还需努力，多看看知识点'
  return '📚 建议重新复习一遍基础知识'
})
</script>

<style scoped>
.dsa-view {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 120px;
}

h1 { font-size: 28px; margin: 0; }
h2 { font-size: 22px; margin: 24px 0 16px; }
h3 { font-size: 18px; margin: 20px 0 12px; }

.subtitle {
  color: var(--color-text-secondary);
  margin: 8px 0 20px;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.nav-tabs button {
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  background: var(--color-background-soft);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-tabs button.active {
  background: var(--color-primary);
  color: white;
}

.section {
  background: var(--color-background-soft);
  border-radius: 16px;
  padding: 20px;
}

/* 复杂度表格 */
.complexity-table { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

th { background: var(--color-background-mute); }
td.name { text-align: left; font-weight: 500; }

.legend {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  font-size: 12px;
  justify-content: center;
}

.good { color: #10b981; }
.ok { color: #3b82f6; }
.fair { color: #f59e0b; }
.bad { color: #ef4444; }

/* 排序算法卡片 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.algo-card {
  background: var(--color-background-mute);
  border-radius: 12px;
  padding: 16px;
}

.algo-card h3 { margin: 0 0 12px; }

.algo-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-background-soft);
  border-radius: 8px;
  font-size: 12px;
}

.stat .label { color: var(--color-text-secondary); }

.algo-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 12px 0 8px;
}

.algo-key {
  font-size: 12px;
  padding: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  color: var(--color-primary);
}

/* 手风琴 */
.accordion-item {
  background: var(--color-background-mute);
  border-radius: 12px;
  margin-bottom: 8px;
  overflow: hidden;
}

.accordion-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  font-weight: 500;
}

.accordion-content {
  padding: 0 16px 16px;
  font-size: 14px;
}

.accordion-content ul { padding-left: 20px; margin: 8px 0; }
.exam-points li { color: var(--color-primary); }

/* 树与图 */
.traversal-box {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.tree-visual {
  background: var(--color-background-mute);
  padding: 16px;
  border-radius: 12px;
  font-family: monospace;
}

.tree-visual pre { margin: 0; }

.traversal-results { flex: 1; min-width: 250px; }

.result-item {
  padding: 8px 0;
  font-size: 14px;
}

.result-item code {
  background: var(--color-background-mute);
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 8px;
}

.formulas {
  display: grid;
  gap: 12px;
}

.formula-item {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--color-background-mute);
  border-radius: 8px;
}

.formula {
  font-weight: 600;
  color: var(--color-primary);
}

.explain {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.graph-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.compare-item {
  background: var(--color-background-mute);
  padding: 16px;
  border-radius: 12px;
}

.compare-item h4 { margin: 0 0 12px; }
.compare-item ul { padding-left: 20px; margin: 0; font-size: 14px; }

/* 考点卡片 */
.exam-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.exam-card {
  background: var(--color-background-mute);
  border-radius: 12px;
  padding: 16px;
}

.exam-card h3 { margin: 0 0 12px; }
.exam-card ul { padding-left: 20px; margin: 0; font-size: 13px; }
.exam-card li { margin: 6px 0; }

/* 自测练习 */
.quiz-start, .quiz-result {
  text-align: center;
  padding: 40px;
}

.btn-primary {
  padding: 12px 32px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 16px;
}

.quiz-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 14px;
}

.question {
  font-size: 18px;
  margin-bottom: 20px;
}

.options {
  display: grid;
  gap: 12px;
}

.options button {
  padding: 16px;
  text-align: left;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-mute);
  cursor: pointer;
  transition: all 0.2s;
}

.options button:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.options button.selected {
  border-color: var(--color-primary);
  background: rgba(102, 126, 234, 0.1);
}

.options button.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.options button.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.answer-explain {
  margin-top: 20px;
  padding: 16px;
  background: var(--color-background-mute);
  border-radius: 12px;
}

.score {
  font-size: 64px;
  font-weight: bold;
  color: var(--color-primary);
}

.score-comment {
  font-size: 18px;
  margin-top: 16px;
}

@media (max-width: 600px) {
  .graph-compare { grid-template-columns: 1fr; }
  .nav-tabs button { padding: 8px 12px; font-size: 12px; }
}
</style>
