<template>
  <div v-if="showRules" class="rules-panel">
    <div class="rules-header">
      <h3>📖 游戏规则</h3>
      <button class="rules-close-btn" @click="closeRules">
        ✕ 关闭
      </button>
    </div>

    <div class="rules-content">
      <section class="rule-section">
        <h4>🎮 游戏目标</h4>
        <ul>
          <li><strong>棋盘</strong>：4×4 格子</li>
          <li><strong>棋子</strong>：每位玩家4个拼图棋子（不同形状）</li>
          <li>
            <strong>起始位置</strong>：
            <ul class="compact">
              <li>玩家1: 第3行（底部）</li>
              <li>玩家2: 第0行（顶部）</li>
            </ul>
          </li>
          <li><strong>目标</strong>：将所有棋子移至对侧</li>
          <li><strong>胜利</strong>：率先将所有棋子移至对侧的玩家获胜</li>
        </ul>
      </section>

      <section class="rule-section">
        <h4>♟️ 移动规则</h4>
        <ul>
          <li><strong>回合制</strong>：每回合只能执行一个动作（移动或旋转）</li>
          <li><strong>移动范围</strong>：可移动到棋盘上任意空位置（无距离限制）</li>
          <li><strong>移动方向</strong>：直线（上/下/左/右）或对角线（8个方向）</li>
          <li><strong>目标格子</strong>：必须为空，不可重叠</li>
          <li><strong>自动切换</strong>：完成动作后自动切换到对方回合</li>
        </ul>
      </section>

      <section class="rule-section">
        <h4>🔄 旋转规则</h4>
        <ul>
          <li>
            <strong>相邻移动（距离 = 1格）</strong>：
            <ul class="compact">
              <li>✅ 移动到相邻8格之一后，可以选择是否旋转</li>
              <li>⚠️ 旋转后本次移动结束，切换回合</li>
            </ul>
          </li>
          <li>
            <strong>远距离移动（距离 &gt; 1格）</strong>：
            <ul class="compact">
              <li>❌ 不能旋转，只能移动</li>
              <li>✅ 适合快速占领位置</li>
            </ul>
          </li>
          <li>
            <strong>鸟类棋子特权</strong>：
            <ul class="compact">
              <li>🦅 可以原地旋转（不移动）</li>
              <li>⚠️ 原地旋转也算一个动作，会结束回合</li>
            </ul>
          </li>
        </ul>
      </section>

      <section class="rule-section">
        <h4>🧩 边缘匹配（暂不启用）</h4>
        <p>当前版本为<strong>自由模式</strong>，无需考虑边缘匹配规则。</p>
        <p class="tip">💡 棋子可以自由移动到任何空位置！</p>
      </section>

      <section class="rule-section">
        <h4>⚡ 策略要点</h4>
        <ul>
          <li>🎯 <strong>快速推进</strong>：利用无距离限制快速向目标行移动</li>
          <li>🛡️ <strong>阻挡对手</strong>：占据关键位置限制对手移动</li>
          <li>🔄 <strong>合理旋转</strong>：相邻移动时考虑是否需要旋转</li>
          <li>🦅 <strong>鸟类优势</strong>：资源4棋子可原地旋转，灵活性更高</li>
        </ul>
      </section>

      <section class="rule-section">
        <h4>⌨️ 快捷键</h4>
        <ul>
          <li><kbd>R</kbd> - 旋转选中的棋子</li>
          <li><kbd>ESC</kbd> - 取消选择</li>
          <li>点击棋子选中，点击目标位置移动</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===== Props =====
interface Props {
  showRules: boolean
  closeRules: () => void
}

defineProps<Props>()
</script>

<style scoped>
.rules-panel {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 420px;
  max-height: 85vh;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  z-index: 999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.rules-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.rules-close-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.rules-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.rules-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.rules-content::-webkit-scrollbar {
  width: 6px;
}

.rules-content::-webkit-scrollbar-track {
  background: transparent;
}

.rules-content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

.rule-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.rule-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.rule-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #667eea;
  font-weight: 600;
}

.rule-section ul {
  margin: 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.rule-section ul li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  color: #333;
}

.rule-section ul.compact {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.rule-section ul.compact li {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: #555;
}

.rule-section p {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: #333;
}

.rule-section p.tip {
  background: rgba(76, 175, 80, 0.1);
  border-left: 3px solid #4caf50;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  color: #2e7d32;
  font-size: 0.9rem;
}

.rule-section strong {
  color: #667eea;
  font-weight: 600;
}

kbd {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: 0.85rem;
  font-family: monospace;
  font-weight: bold;
  color: #333;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-bottom: 2px solid #999;
  border-radius: 4px;
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .rules-panel {
    right: 10px;
    width: 380px;
  }
}

@media (max-width: 1024px) {
  .rules-panel {
    width: 350px;
  }
}

@media (max-width: 768px) {
  .rules-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    left: 20px;
    width: auto;
    max-height: 70vh;
    transform: none;
  }

  .rules-content {
    padding: 1rem;
  }

  .rule-section h4 {
    font-size: 0.95rem;
  }

  .rule-section ul li {
    font-size: 0.9rem;
  }
}
</style>