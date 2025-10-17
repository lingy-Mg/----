<template>
  <div class="player-indicators">
    <!-- 玩家2指示器（顶部） -->
    <div class="player-indicator player-2" :class="{ active: currentPlayer === 2 }">
      <div class="player-avatar">
        <span class="player-number">2</span>
      </div>
      <div class="player-info">
        <h3>玩家 2</h3>
        <div class="player-goal">目标: 移至顶部 (第0行)</div>
        <div v-if="currentPlayer === 2" class="current-turn">当前回合</div>
      </div>
    </div>

    <!-- 玩家1指示器（底部） -->
    <div class="player-indicator player-1" :class="{ active: currentPlayer === 1 }">
      <div class="player-avatar">
        <span class="player-number">1</span>
      </div>
      <div class="player-info">
        <h3>玩家 1</h3>
        <div class="player-goal">目标: 移至底部 (第3行)</div>
        <div v-if="currentPlayer === 1" class="current-turn">当前回合</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===== Props =====
interface Props {
  currentPlayer: number
}

defineProps<Props>()
</script>

<style scoped>
.player-indicators {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.player-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  opacity: 0.6;
}

.player-indicator.active {
  opacity: 1;
  transform: scale(1.02);
}

.player-indicator.player-1.active {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.1);
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
}

.player-indicator.player-2.active {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.3);
}

.player-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1.2rem;
}

.player-1 .player-avatar {
  background: linear-gradient(135deg, #2196f3, #1976d2);
}

.player-2 .player-avatar {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

.player-info {
  flex: 1;
}

.player-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.player-goal {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  margin: 0.25rem 0;
}

.current-turn {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--success-color, #4caf50);
  background: rgba(76, 175, 80, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0.25rem;
}

/* 活跃玩家的脉冲动画 */
.player-indicator.active .player-avatar {
  animation: player-pulse 2s ease-in-out infinite;
}

@keyframes player-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .player-indicator {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .player-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .player-info h3 {
    font-size: 1rem;
  }
  
  .player-goal {
    font-size: 0.8rem;
  }
}
</style>