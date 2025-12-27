<template>
  <div class="algorithm-view">
    <header class="page-header">
      <router-link to="/" class="back-btn">← 返回首页</router-link>
      <h1>💻 经典算法实现</h1>
      <p class="subtitle">代码示例 · 逐行注释 · 可运行演示</p>
    </header>

    <!-- 分类导航 -->
    <div class="category-tabs">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- 算法列表 -->
    <div class="algorithm-list">
      <div 
        v-for="algo in filteredAlgorithms" 
        :key="algo.id" 
        class="algorithm-card"
        :class="{ expanded: expandedAlgo === algo.id }"
      >
        <div class="algo-header" @click="toggleAlgo(algo.id)">
          <div class="algo-info">
            <h3>{{ algo.name }}</h3>
            <div class="algo-tags">
              <span class="tag complexity">{{ algo.complexity }}</span>
              <span class="tag difficulty" :class="algo.difficulty">{{ algo.difficultyText }}</span>
            </div>
          </div>
          <span class="expand-icon">{{ expandedAlgo === algo.id ? '▼' : '▶' }}</span>
        </div>
        
        <div class="algo-content" v-show="expandedAlgo === algo.id">
          <div class="algo-desc">
            <h4>📖 算法思想</h4>
            <p>{{ algo.description }}</p>
          </div>
          
          <div class="algo-steps" v-if="algo.steps">
            <h4>📝 实现步骤</h4>
            <ol>
              <li v-for="(step, i) in algo.steps" :key="i">{{ step }}</li>
            </ol>
          </div>

          <div class="code-section">
            <div class="code-header">
              <h4>💻 代码实现</h4>
              <div class="code-actions">
                <button @click="copyCode(algo.code)" class="copy-btn">
                  {{ copiedId === algo.id ? '✓ 已复制' : '📋 复制' }}
                </button>
                <button @click="runCode(algo)" class="run-btn">▶ 运行</button>
              </div>
            </div>
            <pre class="code-block"><code>{{ algo.code }}</code></pre>
          </div>

          <div class="run-result" v-if="runResults[algo.id]">
            <h4>🖥️ 运行结果</h4>
            <pre class="result-block">{{ runResults[algo.id] }}</pre>
          </div>

          <div class="algo-analysis">
            <h4>📊 复杂度分析</h4>
            <div class="analysis-grid">
              <div class="analysis-item">
                <span class="label">时间复杂度</span>
                <span class="value">{{ algo.timeComplexity }}</span>
              </div>
              <div class="analysis-item">
                <span class="label">空间复杂度</span>
                <span class="value">{{ algo.spaceComplexity }}</span>
              </div>
              <div class="analysis-item" v-if="algo.bestCase">
                <span class="label">最好情况</span>
                <span class="value">{{ algo.bestCase }}</span>
              </div>
              <div class="analysis-item" v-if="algo.worstCase">
                <span class="label">最坏情况</span>
                <span class="value">{{ algo.worstCase }}</span>
              </div>
            </div>
          </div>

          <div class="algo-tips" v-if="algo.tips">
            <h4>💡 考试技巧</h4>
            <ul>
              <li v-for="(tip, i) in algo.tips" :key="i">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeCategory = ref('sorting')
const expandedAlgo = ref(null)
const copiedId = ref(null)
const runResults = ref({})

const categories = [
  { id: 'sorting', name: '排序算法', icon: '🔄' },
  { id: 'search', name: '查找算法', icon: '🔍' },
  { id: 'recursion', name: '递归算法', icon: '🔁' },
  { id: 'dp', name: '动态规划', icon: '📐' },
  { id: 'graph', name: '图算法', icon: '🕸️' }
]

const algorithms = [
  // 排序算法
  {
    id: 'bubble',
    category: 'sorting',
    name: '冒泡排序',
    complexity: 'O(n²)',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '重复遍历数组，比较相邻元素，如果顺序错误就交换。每轮遍历后，最大的元素会"冒泡"到末尾。',
    steps: [
      '从第一个元素开始，依次比较相邻的两个元素',
      '如果前一个元素大于后一个元素，则交换它们',
      '每完成一轮遍历，最大的元素就会被放到正确的位置',
      '重复以上步骤，直到没有需要交换的元素'
    ],
    code: `function bubbleSort(arr) {
    const n = arr.length;
    // 外层循环控制轮数
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;  // 优化：标记是否发生交换
        // 内层循环进行相邻比较
        for (let j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                // 交换相邻元素
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        // 如果没有交换，说明已经有序
        if (!swapped) break;
    }
    return arr;
}

// 测试
const arr = [64, 34, 25, 12, 22, 11, 90];
console.log("排序前:", arr);
console.log("排序后:", bubbleSort([...arr]));`,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestCase: 'O(n) - 已排序数组',
    worstCase: 'O(n²) - 逆序数组',
    tips: [
      '冒泡排序是稳定的排序算法',
      '优化技巧：添加swapped标志，如果一轮没有交换则提前结束',
      '适合小规模数据或基本有序的数据'
    ]
  },
  {
    id: 'quick',
    category: 'sorting',
    name: '快速排序',
    complexity: 'O(n log n)',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '采用分治策略，选择一个基准元素，将数组分为两部分：小于基准的和大于基准的，然后递归排序。',
    steps: [
      '选择一个基准元素（pivot），通常选择第一个、最后一个或中间元素',
      '将数组分区：小于基准的放左边，大于基准的放右边',
      '递归地对左右两个子数组进行快速排序',
      '合并结果（原地排序，无需额外合并操作）'
    ],
    code: `function quickSort(arr, left = 0, right = arr.length - 1) {
    if (left < right) {
        // 分区并获取基准位置
        const pivotIndex = partition(arr, left, right);
        // 递归排序左半部分
        quickSort(arr, left, pivotIndex - 1);
        // 递归排序右半部分
        quickSort(arr, pivotIndex + 1, right);
    }
    return arr;
}

function partition(arr, left, right) {
    const pivot = arr[right];  // 选择最后一个元素作为基准
    let i = left - 1;  // i指向小于基准的最后一个元素
    
    for (let j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];  // 交换
        }
    }
    // 将基准放到正确位置
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    return i + 1;
}

// 测试
const arr = [64, 34, 25, 12, 22, 11, 90];
console.log("排序前:", arr);
console.log("排序后:", quickSort([...arr]));`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n) - 递归栈',
    bestCase: 'O(n log n)',
    worstCase: 'O(n²) - 已排序数组',
    tips: [
      '快速排序是不稳定的',
      '最常考的排序算法！理解partition过程是关键',
      '避免最坏情况：随机选择基准或三数取中'
    ]
  },
  {
    id: 'merge',
    category: 'sorting',
    name: '归并排序',
    complexity: 'O(n log n)',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '采用分治策略，将数组不断二分，直到每个子数组只有一个元素，然后将有序的子数组合并成更大的有序数组。',
    steps: [
      '将数组从中间分成两半',
      '递归地对左右两半进行归并排序',
      '将两个有序的子数组合并成一个有序数组',
      '重复以上过程直到整个数组有序'
    ],
    code: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    // 分：找到中点，分成两半
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    // 治：合并两个有序数组
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    // 比较两个数组的元素，按顺序放入结果
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    // 将剩余元素放入结果
    return result.concat(left.slice(i)).concat(right.slice(j));
}

// 测试
const arr = [64, 34, 25, 12, 22, 11, 90];
console.log("排序前:", arr);
console.log("排序后:", mergeSort([...arr]));`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    bestCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    tips: [
      '归并排序是稳定的排序算法',
      '时间复杂度稳定，但需要O(n)额外空间',
      'merge函数是核心，要能手写'
    ]
  },
  {
    id: 'insertion',
    category: 'sorting',
    name: '插入排序',
    complexity: 'O(n²)',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '像打扑克牌一样，将未排序的元素逐个插入到已排序部分的正确位置。',
    steps: [
      '从第二个元素开始，将其视为"待插入"元素',
      '将待插入元素与已排序部分从后往前比较',
      '将比待插入元素大的元素后移',
      '找到正确位置后插入，重复直到所有元素有序'
    ],
    code: `function insertionSort(arr) {
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
        const key = arr[i];  // 当前要插入的元素
        let j = i - 1;
        
        // 将比key大的元素后移
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        // 插入到正确位置
        arr[j + 1] = key;
    }
    return arr;
}

// 测试
const arr = [64, 34, 25, 12, 22, 11, 90];
console.log("排序前:", arr);
console.log("排序后:", insertionSort([...arr]));`,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    bestCase: 'O(n) - 已排序数组',
    worstCase: 'O(n²) - 逆序数组',
    tips: [
      '插入排序是稳定的',
      '对小规模或基本有序的数据效率很高',
      '常作为快排的优化：小规模时切换到插入排序'
    ]
  },
  // 查找算法
  {
    id: 'binary',
    category: 'search',
    name: '二分查找',
    complexity: 'O(log n)',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '在有序数组中，每次取中间元素与目标比较，根据比较结果缩小一半的搜索范围。',
    steps: [
      '确定搜索范围的左右边界 left 和 right',
      '计算中间位置 mid = (left + right) / 2',
      '比较中间元素与目标值',
      '如果相等，返回位置；如果目标更大，搜索右半部分；否则搜索左半部分',
      '重复直到找到目标或范围为空'
    ],
    code: `// 迭代版本
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;  // 找到目标
        } else if (arr[mid] < target) {
            left = mid + 1;  // 目标在右半部分
        } else {
            right = mid - 1;  // 目标在左半部分
        }
    }
    return -1;  // 未找到
}

// 递归版本
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
    if (left > right) return -1;
    
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
        return binarySearchRecursive(arr, target, mid + 1, right);
    }
    return binarySearchRecursive(arr, target, left, mid - 1);
}

// 测试
const arr = [1, 3, 5, 7, 9, 11, 13, 15];
console.log("数组:", arr);
console.log("查找 7 的位置:", binarySearch(arr, 7));
console.log("查找 6 的位置:", binarySearch(arr, 6));`,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1) 迭代 / O(log n) 递归',
    tips: [
      '前提：数组必须有序！',
      '注意边界条件：left <= right',
      '防止整数溢出：mid = left + (right - left) / 2',
      '变体：查找第一个/最后一个满足条件的元素'
    ]
  },
  // 递归算法
  {
    id: 'fibonacci',
    category: 'recursion',
    name: '斐波那契数列',
    complexity: 'O(n)',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '斐波那契数列：F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)。展示递归和动态规划两种实现。',
    steps: [
      '递归解法：直接按定义递归（效率低）',
      '记忆化递归：缓存已计算的结果避免重复计算',
      '动态规划：自底向上计算',
      '空间优化：只保存前两个值'
    ],
    code: `// 1. 简单递归（效率低，O(2^n)）
function fibRecursive(n) {
    if (n <= 1) return n;
    return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// 2. 记忆化递归（O(n)）
function fibMemo(n, memo = {}) {
    if (n <= 1) return n;
    if (memo[n]) return memo[n];
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}

// 3. 动态规划（O(n)）
function fibDP(n) {
    if (n <= 1) return n;
    const dp = [0, 1];
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}

// 4. 空间优化（O(1)空间）
function fibOptimized(n) {
    if (n <= 1) return n;
    let prev = 0, curr = 1;
    for (let i = 2; i <= n; i++) {
        [prev, curr] = [curr, prev + curr];
    }
    return curr;
}

// 测试
console.log("F(10) =", fibOptimized(10));
console.log("前10项:", Array.from({length: 10}, (_, i) => fibOptimized(i)));`,
    timeComplexity: 'O(n) - 优化后',
    spaceComplexity: 'O(1) - 空间优化版',
    tips: [
      '简单递归会重复计算，效率很低',
      '记忆化和DP是优化递归的两种方式',
      '空间优化是常见的面试追问点'
    ]
  },
  {
    id: 'hanoi',
    category: 'recursion',
    name: '汉诺塔',
    complexity: 'O(2^n)',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '将n个盘子从源柱移动到目标柱，借助辅助柱，每次只能移动一个盘子，大盘不能放在小盘上面。',
    steps: [
      '将上面n-1个盘子从源柱移动到辅助柱',
      '将最大的盘子从源柱移动到目标柱',
      '将n-1个盘子从辅助柱移动到目标柱',
      '递归地解决子问题'
    ],
    code: `function hanoi(n, from, to, aux, moves = []) {
    if (n === 1) {
        moves.push(\`移动盘子 1 从 \${from} 到 \${to}\`);
        return moves;
    }
    
    // 1. 将n-1个盘子从源柱移到辅助柱
    hanoi(n - 1, from, aux, to, moves);
    
    // 2. 将最大的盘子移到目标柱
    moves.push(\`移动盘子 \${n} 从 \${from} 到 \${to}\`);
    
    // 3. 将n-1个盘子从辅助柱移到目标柱
    hanoi(n - 1, aux, to, from, moves);
    
    return moves;
}

// 测试
const moves = hanoi(3, 'A', 'C', 'B');
console.log(\`移动3个盘子需要 \${moves.length} 步:\`);
moves.forEach((move, i) => console.log(\`\${i + 1}. \${move}\`));`,
    timeComplexity: 'O(2^n)',
    spaceComplexity: 'O(n) - 递归栈',
    tips: [
      '移动n个盘子需要 2^n - 1 步',
      '理解递归思想：将大问题分解为小问题',
      '经典的递归入门题目'
    ]
  },
  // 动态规划
  {
    id: 'knapsack',
    category: 'dp',
    name: '0-1背包问题',
    complexity: 'O(nW)',
    difficulty: 'hard',
    difficultyText: '困难',
    description: '给定n个物品（重量和价值）和背包容量W，选择物品使得总价值最大，每个物品只能选一次。',
    steps: [
      '定义状态：dp[i][w] 表示前i个物品、容量为w时的最大价值',
      '状态转移：dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])',
      '初始化：dp[0][w] = 0（没有物品时价值为0）',
      '从左到右、从上到下填表'
    ],
    code: `function knapsack(weights, values, capacity) {
    const n = weights.length;
    // dp[i][w] = 前i个物品、容量w时的最大价值
    const dp = Array(n + 1).fill(null)
        .map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            // 不选第i个物品
            dp[i][w] = dp[i - 1][w];
            // 选第i个物品（如果能放下）
            if (w >= weights[i - 1]) {
                dp[i][w] = Math.max(
                    dp[i][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1]
                );
            }
        }
    }
    return dp[n][capacity];
}

// 空间优化版本（一维数组）
function knapsackOptimized(weights, values, capacity) {
    const dp = Array(capacity + 1).fill(0);
    
    for (let i = 0; i < weights.length; i++) {
        // 必须从后往前遍历，保证每个物品只用一次
        for (let w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    return dp[capacity];
}

// 测试
const weights = [2, 3, 4, 5];
const values = [3, 4, 5, 6];
const capacity = 8;
console.log("物品重量:", weights);
console.log("物品价值:", values);
console.log("背包容量:", capacity);
console.log("最大价值:", knapsackOptimized(weights, values, capacity));`,
    timeComplexity: 'O(nW)',
    spaceComplexity: 'O(W) - 优化后',
    tips: [
      '经典DP问题，必须掌握！',
      '状态转移方程是关键',
      '空间优化：一维数组，从后往前遍历',
      '变体：完全背包、多重背包'
    ]
  },
  {
    id: 'lis',
    category: 'dp',
    name: '最长递增子序列',
    complexity: 'O(n²)',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '给定一个数组，找出其中最长的严格递增子序列的长度。子序列不要求连续。',
    steps: [
      '定义状态：dp[i] 表示以第i个元素结尾的LIS长度',
      '状态转移：dp[i] = max(dp[j] + 1)，其中 j < i 且 arr[j] < arr[i]',
      '初始化：dp[i] = 1（每个元素自身是长度为1的子序列）',
      '答案：max(dp[i])'
    ],
    code: `// O(n²) 解法
function lengthOfLIS(nums) {
    const n = nums.length;
    if (n === 0) return 0;
    
    // dp[i] = 以nums[i]结尾的LIS长度
    const dp = Array(n).fill(1);
    
    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    
    return Math.max(...dp);
}

// O(n log n) 优化解法
function lengthOfLISOptimized(nums) {
    const tails = [];  // tails[i] = 长度为i+1的LIS的最小结尾
    
    for (const num of nums) {
        // 二分查找第一个 >= num 的位置
        let left = 0, right = tails.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (tails[mid] < num) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        if (left === tails.length) {
            tails.push(num);
        } else {
            tails[left] = num;
        }
    }
    
    return tails.length;
}

// 测试
const nums = [10, 9, 2, 5, 3, 7, 101, 18];
console.log("数组:", nums);
console.log("LIS长度:", lengthOfLIS(nums));
console.log("LIS长度(优化):", lengthOfLISOptimized(nums));`,
    timeComplexity: 'O(n log n) - 优化后',
    spaceComplexity: 'O(n)',
    tips: [
      '经典DP问题',
      'O(n²)解法容易理解和实现',
      'O(n log n)用贪心+二分，面试加分项'
    ]
  },
  // 图算法
  {
    id: 'dfs',
    category: 'graph',
    name: 'DFS深度优先搜索',
    complexity: 'O(V+E)',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '从起点出发，沿着一条路径尽可能深入，遇到死胡同时回溯，直到遍历所有可达节点。',
    steps: [
      '访问起始节点，标记为已访问',
      '遍历当前节点的所有邻接节点',
      '对于每个未访问的邻接节点，递归进行DFS',
      '当所有邻接节点都已访问，回溯到上一层'
    ],
    code: `// 邻接表表示的图
class Graph {
    constructor(vertices) {
        this.V = vertices;
        this.adj = new Map();
        for (let i = 0; i < vertices; i++) {
            this.adj.set(i, []);
        }
    }
    
    addEdge(v, w) {
        this.adj.get(v).push(w);
        this.adj.get(w).push(v);  // 无向图
    }
    
    // DFS递归版
    dfs(start) {
        const visited = new Set();
        const result = [];
        
        const dfsVisit = (v) => {
            visited.add(v);
            result.push(v);
            
            for (const neighbor of this.adj.get(v)) {
                if (!visited.has(neighbor)) {
                    dfsVisit(neighbor);
                }
            }
        };
        
        dfsVisit(start);
        return result;
    }
    
    // DFS迭代版（用栈）
    dfsIterative(start) {
        const visited = new Set();
        const result = [];
        const stack = [start];
        
        while (stack.length > 0) {
            const v = stack.pop();
            if (!visited.has(v)) {
                visited.add(v);
                result.push(v);
                // 逆序入栈，保证顺序
                const neighbors = this.adj.get(v);
                for (let i = neighbors.length - 1; i >= 0; i--) {
                    if (!visited.has(neighbors[i])) {
                        stack.push(neighbors[i]);
                    }
                }
            }
        }
        return result;
    }
}

// 测试
const g = new Graph(6);
g.addEdge(0, 1);
g.addEdge(0, 2);
g.addEdge(1, 3);
g.addEdge(1, 4);
g.addEdge(2, 5);

console.log("DFS遍历(从0开始):", g.dfs(0));
console.log("DFS迭代版:", g.dfsIterative(0));`,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V) - 递归栈/visited数组',
    tips: [
      'DFS用栈（递归隐式使用系统栈）',
      '用于：路径查找、拓扑排序、连通分量',
      '记得标记已访问节点，避免死循环'
    ]
  },
  {
    id: 'bfs',
    category: 'graph',
    name: 'BFS广度优先搜索',
    complexity: 'O(V+E)',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '从起点出发，先访问所有距离为1的节点，再访问距离为2的节点，层层推进直到遍历所有可达节点。',
    steps: [
      '将起始节点入队，标记为已访问',
      '从队列取出一个节点，访问它',
      '将该节点所有未访问的邻接节点入队',
      '重复步骤2-3直到队列为空'
    ],
    code: `class Graph {
    constructor(vertices) {
        this.V = vertices;
        this.adj = new Map();
        for (let i = 0; i < vertices; i++) {
            this.adj.set(i, []);
        }
    }
    
    addEdge(v, w) {
        this.adj.get(v).push(w);
        this.adj.get(w).push(v);
    }
    
    // BFS遍历
    bfs(start) {
        const visited = new Set();
        const result = [];
        const queue = [start];
        visited.add(start);
        
        while (queue.length > 0) {
            const v = queue.shift();  // 出队
            result.push(v);
            
            for (const neighbor of this.adj.get(v)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);  // 入队
                }
            }
        }
        return result;
    }
    
    // BFS求最短路径
    shortestPath(start, end) {
        const visited = new Set([start]);
        const queue = [[start, 0]];  // [节点, 距离]
        
        while (queue.length > 0) {
            const [v, dist] = queue.shift();
            
            if (v === end) return dist;
            
            for (const neighbor of this.adj.get(v)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([neighbor, dist + 1]);
                }
            }
        }
        return -1;  // 不可达
    }
}

// 测试
const g = new Graph(6);
g.addEdge(0, 1);
g.addEdge(0, 2);
g.addEdge(1, 3);
g.addEdge(1, 4);
g.addEdge(2, 5);
g.addEdge(4, 5);

console.log("BFS遍历(从0开始):", g.bfs(0));
console.log("0到5的最短距离:", g.shortestPath(0, 5));`,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    tips: [
      'BFS用队列',
      '用于：最短路径（无权图）、层序遍历',
      'BFS找到的路径一定是最短的（无权图）'
    ]
  }
]

const filteredAlgorithms = computed(() => {
  return algorithms.filter(a => a.category === activeCategory.value)
})

function toggleAlgo(id) {
  expandedAlgo.value = expandedAlgo.value === id ? null : id
}

function copyCode(code) {
  navigator.clipboard.writeText(code)
  copiedId.value = algorithms.find(a => a.code === code)?.id
  setTimeout(() => copiedId.value = null, 2000)
}

function runCode(algo) {
  try {
    // 创建一个收集console.log输出的函数
    const logs = []
    const originalLog = console.log
    console.log = (...args) => {
      logs.push(args.map(a => 
        typeof a === 'object' ? JSON.stringify(a) : String(a)
      ).join(' '))
    }
    
    // 执行代码
    eval(algo.code)
    
    // 恢复console.log
    console.log = originalLog
    
    runResults.value[algo.id] = logs.join('\n')
  } catch (e) {
    runResults.value[algo.id] = '运行错误: ' + e.message
  }
}
</script>

<style scoped>
.algorithm-view {
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
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--color-background-mute);
}

.page-header h1 {
  font-size: 28px;
  margin: 0;
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 8px 0 0;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto 24px;
}

.category-tabs button {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: var(--color-background-soft);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.category-tabs button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.algorithm-list {
  max-width: 900px;
  margin: 0 auto;
}

.algorithm-card {
  background: var(--color-background-soft);
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

.algo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.algo-header:hover {
  background: var(--color-background-mute);
}

.algo-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.algo-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.tag.complexity {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.tag.difficulty.easy { background: #dcfce7; color: #16a34a; }
.tag.difficulty.medium { background: #fef3c7; color: #d97706; }
.tag.difficulty.hard { background: #fee2e2; color: #dc2626; }

.expand-icon {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.algo-content {
  padding: 0 20px 20px;
}

.algo-content h4 {
  margin: 20px 0 12px;
  font-size: 16px;
  color: var(--color-primary);
}

.algo-desc p, .algo-steps ol, .algo-tips ul {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
}

.algo-steps ol, .algo-tips ul {
  padding-left: 20px;
}

.code-section {
  background: var(--color-background-mute);
  border-radius: 12px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.code-header h4 {
  margin: 0;
}

.code-actions {
  display: flex;
  gap: 8px;
}

.copy-btn, .run-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.copy-btn {
  background: var(--color-background-soft);
}

.run-btn {
  background: #10b981;
  color: white;
}

.code-block {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.run-result {
  margin-top: 16px;
}

.result-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
  overflow-x: auto;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.analysis-item {
  background: var(--color-background-mute);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.analysis-item .label {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.analysis-item .value {
  font-weight: 600;
  color: var(--color-primary);
}

@media (max-width: 600px) {
  .page-header h1 { font-size: 22px; }
  .category-tabs button { padding: 8px 14px; font-size: 12px; }
}
</style>
