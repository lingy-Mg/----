<template>
  <div class="game-status">
    <!-- 获胜公告 -->
    <div v-if="winner" class="winner-announcement" aria-live="polite">
      🎉 玩家 {{ winner }} 获胜！
    </div>
    
    <!-- 游戏统计 -->
    <div v-if="!winner" class="game-stats">
      <div class="stat-item">
        <span class="stat-label">回合数</span>
        <span class="stat-value">{{ Math.floor(moveHistory.length / 2) + 1 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">总移动</span>
        <span class="stat-value">{{ moveHistory.length }}</span>
      </div>
    </div>

    <!-- 键盘提示 -->
    <div class="keyboard-hints">
      <span class="hint-item">
        <kbd>R</kbd> 旋转棋子
      </span>
      <span class="hint-item">
        <kbd>ESC</kbd> 取消选择
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Move } from '@/types/chess'

// ===== Props =====
interface Props {
  winner: number | null
  moveHistory: Move[]
}

defineProps<Props>()
</script>

<style scoped>
.game-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 获胜公告 */
.winner-announcement {
  background: linear-gradient(135deg, #ffc107, #ff8f00);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  animation: celebrate 0.8s ease-out;
}

@keyframes celebrate {
  0% {
    transform: scale(0.8) rotateZ(-5deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotateZ(2deg);
  }
  100% {
    transform: scale(1) rotateZ(0deg);
    opacity: 1;
  }
}

/* 游戏统计 */
.game-stats {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  min-width: 80px;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--primary-color, #ffc107);
}

/* 键盘提示 */
.keyboard-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  opacity: 0.8;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #666);
}

kbd {
  display: inline-block;
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: bold;
  color: var(--text-primary, #333);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-item {
    min-width: 60px;
    padding: 0.5rem;
  }
  
  .keyboard-hints {
    flex-direction: column;
    align-items: center;
  }
}
</style>