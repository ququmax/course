<template>
  <div class="interview-view">
    <header class="page-header">
      <router-link to="/" class="back-btn">← 返回首页</router-link>
      <h1>🎯 面试题精选</h1>
      <p class="subtitle">高频考题 · 详细解析 · 举一反三</p>
    </header>

    <!-- 难度筛选 -->
    <div class="filter-bar">
      <button 
        v-for="level in levels" 
        :key="level.id"
        :class="{ active: activeLevel === level.id }"
        @click="activeLevel = level.id"
      >
        {{ level.name }} ({{ getCount(level.id) }})
      </button>
    </div>

    <!-- 题目列表 -->
    <div class="questions-list">
      <div 
        v-for="q in filteredQuestions" 
        :key="q.id" 
        class="question-card"
      >
        <div class="q-header" @click="toggleQuestion(q.id)">
          <div class="q-info">
            <span class="q-number">#{{ q.id }}</span>
            <h3>{{ q.title }}</h3>
          </div>
          <div class="q-meta">
            <span class="tag" :class="q.difficulty">{{ q.difficultyText }}</span>
            <span class="tag category">{{ q.category }}</span>
            <span class="expand-icon">{{ expandedQ === q.id ? '▼' : '▶' }}</span>
          </div>
        </div>

        <div class="q-content" v-show="expandedQ === q.id">
          <div class="q-section">
            <h4>📋 题目描述</h4>
            <p>{{ q.description }}</p>
            <div class="examples" v-if="q.examples">
              <div v-for="(ex, i) in q.examples" :key="i" class="example">
                <strong>示例 {{ i + 1 }}：</strong>
                <pre>输入：{{ ex.input }}
输出：{{ ex.output }}
{{ ex.explanation ? '解释：' + ex.explanation : '' }}</pre>
              </div>
            </div>
          </div>

          <div class="q-section">
            <h4>💡 解题思路</h4>
            <ol>
              <li v-for="(step, i) in q.approach" :key="i">{{ step }}</li>
            </ol>
          </div>

          <div class="q-section">
            <h4>💻 代码实现</h4>
            <div class="code-box">
              <button class="copy-btn" @click="copyCode(q.code)">
                {{ copiedId === q.id ? '✓ 已复制' : '📋 复制' }}
              </button>
              <pre><code>{{ q.code }}</code></pre>
            </div>
          </div>

          <div class="q-section">
            <h4>📊 复杂度分析</h4>
            <div class="complexity-info">
              <span><strong>时间：</strong>{{ q.timeComplexity }}</span>
              <span><strong>空间：</strong>{{ q.spaceComplexity }}</span>
            </div>
          </div>

          <div class="q-section" v-if="q.followUp">
            <h4>🔥 进阶问题</h4>
            <ul>
              <li v-for="(item, i) in q.followUp" :key="i">{{ item }}</li>
            </ul>
          </div>

          <div class="q-section tips" v-if="q.tips">
            <h4>⭐ 面试技巧</h4>
            <ul>
              <li v-for="(tip, i) in q.tips" :key="i">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeLevel = ref('all')
const expandedQ = ref(null)
const copiedId = ref(null)

const levels = [
  { id: 'all', name: '全部' },
  { id: 'easy', name: '简单' },
  { id: 'medium', name: '中等' },
  { id: 'hard', name: '困难' }
]

const questions = [
  {
    id: 1,
    title: '两数之和',
    category: '哈希表',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: '因为 nums[0] + nums[1] == 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    approach: [
      '暴力解法：双重循环遍历所有组合，时间O(n²)',
      '优化思路：使用哈希表存储已遍历的数字及其索引',
      '遍历数组，对于每个数字，计算它的补数（target - 当前数）',
      '检查补数是否在哈希表中，如果在则找到答案',
      '如果不在，将当前数字存入哈希表，继续遍历'
    ],
    code: `function twoSum(nums, target) {
    const map = new Map();  // 存储 数值 -> 索引
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];  // 计算补数
        
        if (map.has(complement)) {
            return [map.get(complement), i];  // 找到答案
        }
        
        map.set(nums[i], i);  // 存入哈希表
    }
    
    return [];  // 没找到
}

// 测试
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    tips: [
      '这是LeetCode第一题，必须秒解！',
      '面试时先说暴力解法，再优化',
      '哈希表空间换时间是常见思路'
    ],
    followUp: [
      '如果数组已排序，可以用双指针O(1)空间解决',
      '三数之和、四数之和的解法'
    ]
  },
  {
    id: 2,
    title: '反转链表',
    category: '链表',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '给你单链表的头节点 head，请你反转链表，并返回反转后的链表。',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' }
    ],
    approach: [
      '迭代法：使用三个指针 prev, curr, next',
      '每次将当前节点的 next 指向前一个节点',
      '然后三个指针同时向后移动一位',
      '递归法：先递归到最后，回溯时修改指针'
    ],
    code: `// 迭代法
function reverseList(head) {
    let prev = null;
    let curr = head;
    
    while (curr !== null) {
        const next = curr.next;  // 保存下一个节点
        curr.next = prev;        // 反转指针
        prev = curr;             // prev前进
        curr = next;             // curr前进
    }
    
    return prev;  // prev指向新的头节点
}

// 递归法
function reverseListRecursive(head) {
    // 基本情况
    if (head === null || head.next === null) {
        return head;
    }
    
    // 递归反转后面的链表
    const newHead = reverseListRecursive(head.next);
    
    // 反转当前节点
    head.next.next = head;
    head.next = null;
    
    return newHead;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) 迭代 / O(n) 递归',
    tips: [
      '链表题目画图是关键！',
      '迭代法更省空间，递归法更好理解',
      '注意处理边界：空链表、单节点'
    ],
    followUp: [
      '反转链表的一部分（区间反转）',
      'K个一组反转链表'
    ]
  },
  {
    id: 3,
    title: '有效的括号',
    category: '栈',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '给定一个只包括 ()、{}、[] 的字符串 s，判断字符串是否有效。有效字符串需满足：左括号必须用相同类型的右括号闭合，左括号必须以正确的顺序闭合。',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    approach: [
      '使用栈来存储左括号',
      '遇到左括号，入栈',
      '遇到右括号，检查栈顶是否是对应的左括号',
      '如果是，出栈；如果不是，返回false',
      '最后检查栈是否为空'
    ],
    code: `function isValid(s) {
    const stack = [];
    const pairs = {
        ')': '(',
        ']': '[',
        '}': '{'
    };
    
    for (const char of s) {
        if (char === '(' || char === '[' || char === '{') {
            stack.push(char);  // 左括号入栈
        } else {
            // 右括号：检查栈顶
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;  // 栈必须为空
}

// 测试
console.log(isValid("()[]{}"));  // true
console.log(isValid("([)]"));    // false
console.log(isValid("{[]}"));    // true`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    tips: [
      '栈的经典应用题',
      '用哈希表存储括号对应关系更清晰',
      '注意边界：空字符串返回true'
    ]
  },
  {
    id: 4,
    title: '合并两个有序链表',
    category: '链表',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。',
    examples: [
      { input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]' }
    ],
    approach: [
      '创建一个哑节点（dummy）作为结果链表的头',
      '使用指针遍历两个链表',
      '每次比较两个指针指向的值，将较小的节点接到结果链表',
      '当一个链表遍历完后，将另一个链表剩余部分接上'
    ],
    code: `function mergeTwoLists(l1, l2) {
    const dummy = { next: null };  // 哑节点
    let curr = dummy;
    
    while (l1 !== null && l2 !== null) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }
    
    // 接上剩余的部分
    curr.next = l1 !== null ? l1 : l2;
    
    return dummy.next;
}

// 递归版本
function mergeTwoListsRecursive(l1, l2) {
    if (l1 === null) return l2;
    if (l2 === null) return l1;
    
    if (l1.val <= l2.val) {
        l1.next = mergeTwoListsRecursive(l1.next, l2);
        return l1;
    } else {
        l2.next = mergeTwoListsRecursive(l1, l2.next);
        return l2;
    }
}`,
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1) 迭代 / O(n+m) 递归',
    tips: [
      '哑节点技巧避免处理头节点的特殊情况',
      '归并排序的merge操作本质相同',
      '可以扩展到合并K个有序链表'
    ]
  },
  {
    id: 5,
    title: '最大子数组和',
    category: '动态规划',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '给你一个整数数组 nums，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '连续子数组 [4,-1,2,1] 的和最大，为 6' }
    ],
    approach: [
      '定义 dp[i] = 以 nums[i] 结尾的最大子数组和',
      '状态转移：dp[i] = max(dp[i-1] + nums[i], nums[i])',
      '要么接在前面的子数组后面，要么自己重新开始',
      '空间优化：只需要保存前一个状态'
    ],
    code: `// 动态规划
function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        // 要么接在前面，要么重新开始
        currentSum = Math.max(currentSum + nums[i], nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}

// Kadane算法（本质相同）
function maxSubArrayKadane(nums) {
    let maxSum = nums[0];
    let currentSum = 0;
    
    for (const num of nums) {
        currentSum = Math.max(num, currentSum + num);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}

// 测试
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));  // 6`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    tips: [
      '经典DP入门题',
      '关键在于理解状态转移方程',
      '也叫Kadane算法'
    ],
    followUp: [
      '如果要返回子数组本身怎么做？',
      '乘积最大子数组'
    ]
  },
  {
    id: 6,
    title: '爬楼梯',
    category: '动态规划',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？',
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 或 2' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' }
    ],
    approach: [
      '到达第n阶的方法 = 到达第n-1阶的方法 + 到达第n-2阶的方法',
      '因为可以从n-1阶跨1步，或从n-2阶跨2步',
      '这就是斐波那契数列！',
      'dp[n] = dp[n-1] + dp[n-2]'
    ],
    code: `// 动态规划
function climbStairs(n) {
    if (n <= 2) return n;
    
    let prev1 = 1;  // dp[i-2]
    let prev2 = 2;  // dp[i-1]
    
    for (let i = 3; i <= n; i++) {
        const curr = prev1 + prev2;
        prev1 = prev2;
        prev2 = curr;
    }
    
    return prev2;
}

// 数组版本（更直观）
function climbStairsArray(n) {
    if (n <= 2) return n;
    
    const dp = [0, 1, 2];
    for (let i = 3; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}

// 测试
console.log(climbStairs(5));  // 8`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    tips: [
      '本质是斐波那契数列',
      '理解递推关系是关键',
      '空间优化：只保存前两个值'
    ],
    followUp: [
      '如果每次可以爬1,2,3步呢？',
      '如果某些台阶不能踩呢？'
    ]
  },
  {
    id: 7,
    title: '二叉树的最大深度',
    category: '二叉树',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '给定一个二叉树，找出其最大深度。二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' }
    ],
    approach: [
      '递归思路：树的最大深度 = max(左子树深度, 右子树深度) + 1',
      '基本情况：空节点深度为0',
      'DFS/BFS也可以解决'
    ],
    code: `// 递归（DFS）
function maxDepth(root) {
    if (root === null) return 0;
    
    const leftDepth = maxDepth(root.left);
    const rightDepth = maxDepth(root.right);
    
    return Math.max(leftDepth, rightDepth) + 1;
}

// BFS（层序遍历）
function maxDepthBFS(root) {
    if (root === null) return 0;
    
    const queue = [root];
    let depth = 0;
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        depth++;
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
    
    return depth;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)，h为树的高度',
    tips: [
      '树的题目递归是最自然的思路',
      '理解递归的"相信"：假设子问题已解决',
      'BFS按层遍历，层数就是深度'
    ]
  },
  {
    id: 8,
    title: '二叉树的层序遍历',
    category: '二叉树',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '给你二叉树的根节点 root，返回其节点值的层序遍历（即逐层地，从左到右访问所有节点）。',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }
    ],
    approach: [
      '使用队列进行BFS',
      '每次处理一层的所有节点',
      '记录每层开始时队列的大小',
      '将当前层的值收集到数组中'
    ],
    code: `function levelOrder(root) {
    if (root === null) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length;  // 当前层的节点数
        const currentLevel = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            currentLevel.push(node.val);
            
            // 将下一层的节点入队
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        result.push(currentLevel);
    }
    
    return result;
}

// 递归版本（DFS）
function levelOrderDFS(root) {
    const result = [];
    
    function dfs(node, level) {
        if (node === null) return;
        
        // 如果这一层还没有数组，创建一个
        if (result.length === level) {
            result.push([]);
        }
        
        result[level].push(node.val);
        dfs(node.left, level + 1);
        dfs(node.right, level + 1);
    }
    
    dfs(root, 0);
    return result;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    tips: [
      'BFS + 队列是标准解法',
      '关键是记录每层的节点数',
      '变体：锯齿形层序遍历、右视图等'
    ]
  },
  {
    id: 9,
    title: '买卖股票的最佳时机',
    category: '动态规划',
    difficulty: 'easy',
    difficultyText: '简单',
    description: '给定一个数组 prices，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。你只能选择某一天买入这只股票，并选择在未来的某一个不同的日子卖出该股票。返回你可以从这笔交易中获取的最大利润。',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: '在第2天买入(1)，第5天卖出(6)' }
    ],
    approach: [
      '遍历价格数组，记录到目前为止的最低价格',
      '对于每一天，计算如果今天卖出的利润',
      '更新最大利润',
      '一次遍历即可完成'
    ],
    code: `function maxProfit(prices) {
    let minPrice = Infinity;  // 记录最低买入价
    let maxProfit = 0;        // 记录最大利润
    
    for (const price of prices) {
        if (price < minPrice) {
            minPrice = price;  // 更新最低价
        } else {
            // 计算今天卖出的利润
            maxProfit = Math.max(maxProfit, price - minPrice);
        }
    }
    
    return maxProfit;
}

// 测试
console.log(maxProfit([7,1,5,3,6,4]));  // 5
console.log(maxProfit([7,6,4,3,1]));    // 0 (价格一直跌)`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    tips: [
      '贪心思想：始终在最低点买入',
      '注意：不能在买入之前卖出',
      '系列题目：可以多次买卖、有冷冻期等'
    ]
  },
  {
    id: 10,
    title: '无重复字符的最长子串',
    category: '滑动窗口',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '给定一个字符串 s，请你找出其中不含有重复字符的最长子串的长度。',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '答案是 "abc"' },
      { input: 's = "bbbbb"', output: '1' }
    ],
    approach: [
      '使用滑动窗口技术',
      '维护一个窗口，保证窗口内没有重复字符',
      '使用Set或Map记录窗口内的字符',
      '当遇到重复字符时，收缩左边界'
    ],
    code: `function lengthOfLongestSubstring(s) {
    const set = new Set();
    let left = 0;
    let maxLen = 0;
    
    for (let right = 0; right < s.length; right++) {
        // 如果有重复，收缩左边界
        while (set.has(s[right])) {
            set.delete(s[left]);
            left++;
        }
        
        set.add(s[right]);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    
    return maxLen;
}

// 优化版：使用Map记录位置，直接跳转
function lengthOfLongestSubstringOptimized(s) {
    const map = new Map();  // 字符 -> 最新位置
    let left = 0;
    let maxLen = 0;
    
    for (let right = 0; right < s.length; right++) {
        if (map.has(s[right]) && map.get(s[right]) >= left) {
            // 直接跳到重复字符的下一个位置
            left = map.get(s[right]) + 1;
        }
        
        map.set(s[right], right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    
    return maxLen;
}

// 测试
console.log(lengthOfLongestSubstring("abcabcbb"));  // 3`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n))，m是字符集大小',
    tips: [
      '滑动窗口经典题目',
      'Set版本更直观，Map版本更高效',
      '注意：子串是连续的，子序列可以不连续'
    ]
  },
  {
    id: 11,
    title: 'LRU缓存',
    category: '设计',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '请你设计并实现一个满足 LRU (最近最少使用) 缓存约束的数据结构。实现 get 和 put 方法，要求两个操作的时间复杂度都是 O(1)。',
    examples: [
      { input: 'LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)', output: '1, -1' }
    ],
    approach: [
      '使用哈希表 + 双向链表',
      '哈希表：O(1) 查找',
      '双向链表：O(1) 插入和删除',
      '最近使用的放在链表头部',
      '超出容量时删除链表尾部'
    ],
    code: `class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();  // Map保持插入顺序
    }
    
    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        
        // 移到最近使用（删除再插入）
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        
        return value;
    }
    
    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);  // 先删除旧的
        } else if (this.cache.size >= this.capacity) {
            // 删除最久未使用的（Map的第一个键）
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, value);
    }
}

// 测试
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1));  // 1
cache.put(3, 3);           // 淘汰 key=2
console.log(cache.get(2));  // -1`,
    timeComplexity: 'O(1) get和put',
    spaceComplexity: 'O(capacity)',
    tips: [
      '高频面试题，字节、美团必考',
      'JS的Map保持插入顺序，可以简化实现',
      '传统实现需要自己写双向链表'
    ]
  },
  {
    id: 12,
    title: '全排列',
    category: '回溯',
    difficulty: 'medium',
    difficultyText: '中等',
    description: '给定一个不含重复数字的数组 nums，返回其所有可能的全排列。',
    examples: [
      { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }
    ],
    approach: [
      '使用回溯算法',
      '维护一个路径数组，记录当前选择',
      '使用visited数组标记已选择的元素',
      '当路径长度等于数组长度时，得到一个排列'
    ],
    code: `function permute(nums) {
    const result = [];
    const path = [];
    const used = new Array(nums.length).fill(false);
    
    function backtrack() {
        // 达到目标长度，收集结果
        if (path.length === nums.length) {
            result.push([...path]);  // 注意要复制
            return;
        }
        
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;  // 跳过已使用的
            
            // 做选择
            path.push(nums[i]);
            used[i] = true;
            
            // 递归
            backtrack();
            
            // 撤销选择
            path.pop();
            used[i] = false;
        }
    }
    
    backtrack();
    return result;
}

// 测试
console.log(permute([1, 2, 3]));`,
    timeComplexity: 'O(n! * n)',
    spaceComplexity: 'O(n)',
    tips: [
      '回溯模板：选择 -> 递归 -> 撤销',
      '理解回溯是"暴力穷举"的优雅实现',
      '变体：有重复元素、组合、子集'
    ]
  }
]

const filteredQuestions = computed(() => {
  if (activeLevel.value === 'all') return questions
  return questions.filter(q => q.difficulty === activeLevel.value)
})

function getCount(level) {
  if (level === 'all') return questions.length
  return questions.filter(q => q.difficulty === level).length
}

function toggleQuestion(id) {
  expandedQ.value = expandedQ.value === id ? null : id
}

function copyCode(code) {
  navigator.clipboard.writeText(code)
  const q = questions.find(q => q.code === code)
  if (q) {
    copiedId.value = q.id
    setTimeout(() => copiedId.value = null, 2000)
  }
}
</script>

<style scoped>
.interview-view {
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

.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto 24px;
}

.filter-bar button {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: var(--color-background-soft);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-bar button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.questions-list {
  max-width: 900px;
  margin: 0 auto;
}

.question-card {
  background: var(--color-background-soft);
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

.q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.q-header:hover {
  background: var(--color-background-mute);
}

.q-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.q-number {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.q-info h3 { margin: 0; font-size: 18px; }

.q-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.tag.easy { background: #dcfce7; color: #16a34a; }
.tag.medium { background: #fef3c7; color: #d97706; }
.tag.hard { background: #fee2e2; color: #dc2626; }
.tag.category { background: var(--color-background-mute); }

.expand-icon {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.q-content {
  padding: 0 20px 20px;
}

.q-section {
  margin-top: 20px;
}

.q-section h4 {
  margin: 0 0 12px;
  color: var(--color-primary);
}

.q-section p, .q-section li {
  font-size: 14px;
  line-height: 1.8;
}

.q-section ol, .q-section ul {
  margin: 0;
  padding-left: 20px;
}

.examples {
  margin-top: 12px;
}

.example {
  background: var(--color-background-mute);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.example pre {
  margin: 8px 0 0;
  font-size: 13px;
  white-space: pre-wrap;
}

.code-box {
  position: relative;
  background: var(--color-background-mute);
  border-radius: 12px;
  overflow: hidden;
}

.code-box .copy-btn {
  position: absolute;
  right: 12px;
  top: 12px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: var(--color-background-soft);
  cursor: pointer;
  font-size: 12px;
}

.code-box pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.complexity-info {
  display: flex;
  gap: 24px;
  font-size: 14px;
}

.tips {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.tips h4 { margin-top: 0; }

@media (max-width: 600px) {
  .q-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .complexity-info { flex-direction: column; gap: 8px; }
}
</style>
