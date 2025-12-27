<template>
  <div class="home-view">
    <header class="hero">
      <h1>📚 数据结构与算法学习平台</h1>
      <p class="tagline">期末复习神器 · 考点一网打尽</p>
    </header>

    <div class="cards-grid">
      <router-link to="/dsa" class="card card-1">
        <span class="card-icon">📖</span>
        <h2>知识点速查</h2>
        <p>时间复杂度、排序算法、数据结构详解、高频考点速记</p>
        <span class="card-btn">开始学习 →</span>
      </router-link>

      <router-link to="/algorithm" class="card card-2">
        <span class="card-icon">💻</span>
        <h2>算法代码示例</h2>
        <p>经典算法实现、逐行注释、可运行演示、复杂度分析</p>
        <span class="card-btn">查看代码 →</span>
      </router-link>

      <router-link to="/interview" class="card card-3">
        <span class="card-icon">🎯</span>
        <h2>面试题精选</h2>
        <p>高频面试题、详细解析、代码模板、举一反三</p>
        <span class="card-btn">刷题闯关 →</span>
      </router-link>

      <router-link to="/practice" class="card card-4">
        <span class="card-icon">🎮</span>
        <h2>交互式练习</h2>
        <p>排序可视化、二叉树操作、栈队列模拟、链表操作</p>
        <span class="card-btn">动手实践 →</span>
      </router-link>
    </div>

    <section class="features">
      <h2>✨ 平台特色</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <span class="feature-icon">⏱️</span>
          <h3>复杂度速查</h3>
          <p>常见数据结构时间/空间复杂度一目了然</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔄</span>
          <h3>排序对比</h3>
          <p>8种排序算法详细对比，考点标注</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🌳</span>
          <h3>树与图</h3>
          <p>遍历方法、重要公式、DFS/BFS详解</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">💡</span>
          <h3>代码示例</h3>
          <p>10+经典算法代码，可直接运行</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📝</span>
          <h3>面试真题</h3>
          <p>LeetCode高频题，详细解题思路</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🎯</span>
          <h3>可视化演示</h3>
          <p>排序动画、树操作、直观理解算法</p>
        </div>
      </div>
    </section>

    <section class="quick-access">
      <h2>🚀 快速入口</h2>
      <div class="quick-links">
        <router-link to="/dsa" class="quick-link">
          <span>📊</span> 复杂度表
        </router-link>
        <router-link to="/dsa" class="quick-link">
          <span>🔢</span> 排序算法
        </router-link>
        <router-link to="/algorithm" class="quick-link">
          <span>🔍</span> 二分查找
        </router-link>
        <router-link to="/algorithm" class="quick-link">
          <span>📐</span> 动态规划
        </router-link>
        <router-link to="/interview" class="quick-link">
          <span>🏷️</span> 两数之和
        </router-link>
        <router-link to="/practice" class="quick-link">
          <span>🌲</span> BST操作
        </router-link>
        <router-link to="/game" class="quick-link">
          <span>⚡</span> 反应测试
        </router-link>
      </div>
    </section>

    <footer class="footer">
      <p>💪 祝你期末考试顺利！</p>
      <p class="tip">提示：记得多动手写代码，光看不练假把式！</p>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.hero {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.hero h1 {
  font-size: 32px;
  margin: 0;
}

.tagline {
  font-size: 18px;
  opacity: 0.9;
  margin-top: 12px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto 48px;
}

.card {
  display: block;
  padding: 28px;
  border-radius: 20px;
  text-decoration: none;
  color: white;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.card-1 { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.card-2 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.card-3 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.card-4 { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }

.card-icon {
  font-size: 42px;
  display: block;
  margin-bottom: 12px;
}

.card h2 {
  margin: 0 0 10px;
  font-size: 22px;
}

.card p {
  margin: 0 0 16px;
  opacity: 0.9;
  font-size: 14px;
  line-height: 1.5;
}

.card-btn {
  display: inline-block;
  padding: 8px 18px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.features, .quick-access {
  max-width: 900px;
  margin: 0 auto 40px;
  padding: 32px;
  background: rgba(255,255,255,0.1);
  border-radius: 24px;
  backdrop-filter: blur(10px);
}

.features h2, .quick-access h2 {
  text-align: center;
  color: white;
  margin: 0 0 28px;
  font-size: 22px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
}

.feature-item {
  text-align: center;
  color: white;
}

.feature-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 10px;
}

.feature-item h3 {
  margin: 0 0 6px;
  font-size: 15px;
}

.feature-item p {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.4;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  color: white;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}

.quick-link:hover {
  background: rgba(255,255,255,0.25);
  transform: scale(1.05);
}

.footer {
  text-align: center;
  color: white;
  margin-top: 20px;
}

.footer p {
  margin: 8px 0;
}

.footer .tip {
  font-size: 14px;
  opacity: 0.8;
}

@media (max-width: 600px) {
  .hero h1 { font-size: 24px; }
  .card { padding: 20px; }
  .features, .quick-access { padding: 20px; }
  .cards-grid { gap: 16px; }
}
</style>
