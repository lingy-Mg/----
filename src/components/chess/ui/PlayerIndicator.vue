<template>
  <div 
    class="player-indicator-game" 
    :class="[
      `player-${playerNumber}`,
      { active: currentPlayer === playerNumber }
    ]"
  >
    <!-- 左侧：玩家头像框 -->
    <div class="player-avatar-box">
      <div class="avatar-glow"></div>
      <div class="player-avatar">
        <div class="avatar-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
        <div class="player-number">P{{ playerNumber }}</div>
      </div>
    </div>

    <!-- 中间：玩家信息 -->
    <div class="player-info-box">
      <div class="player-name">
        <span class="name-text">玩家 {{ playerNumber }}</span>
        <div v-if="currentPlayer === playerNumber" class="turn-badge">
          <span class="badge-pulse"></span>
          <span class="badge-text">回合中</span>
        </div>
      </div>
      <div class="player-goal">
        <svg class="goal-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
        </svg>
        <span>{{ playerNumber === 1 ? '目标: 到达顶部 ↑' : '目标: 到达底部 ↓' }}</span>
      </div>

      <!-- 统计信息 -->
      <div class="player-stats">
        <div class="stat-item" :title="`总移动次数: ${stats.totalMoves}`">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
          </svg>
          <span>{{ stats.totalMoves }}</span>
        </div>
        <div class="stat-item" :title="`总悔棋次数: ${stats.totalUndos} | 连续: ${stats.consecutiveUndos}`">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
          </svg>
          <span>{{ stats.totalUndos }}</span>
          <span v-if="stats.consecutiveUndos > 0" class="consecutive-badge">×{{ stats.consecutiveUndos }}</span>
        </div>
        <div class="stat-item" :title="`总跳过次数: ${stats.totalPasses}`">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
          </svg>
          <span>{{ stats.totalPasses }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧：操作按钮 -->
    <div class="player-actions" v-if="currentPlayer === playerNumber && !isGameOver">
      <button 
        class="action-btn undo-btn"
        :disabled="!canUndo"
        @click="$emit('undo')"
        title="悔棋"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
        </svg>
        <span>悔棋</span>
      </button>
      <button 
        class="action-btn skip-btn"
        @click="$emit('skip')"
        title="跳过回合"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
        </svg>
        <span>跳过</span>
      </button>
    </div>

    <!-- 装饰性边框 -->
    <div class="indicator-border"></div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerStats } from '@/types/chess'

// ===== Props =====
interface Props {
  currentPlayer: number
  playerNumber: 1 | 2
  stats: PlayerStats
  canUndo: boolean
  isGameOver: boolean
}

defineProps<Props>()

// ===== Emits =====
defineEmits<{
  undo: []
  skip: []
}>()
</script>

<style scoped>
.player-indicator-game {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.4;
  transform: scale(0.92);
  filter: grayscale(0.8) brightness(0.6);
}

.player-indicator-game.active {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  filter: grayscale(0) brightness(1);
  animation: indicator-pulse 2s ease-in-out infinite;
}

/* 玩家1（蓝色） */
.player-indicator-game.player-1 {
  border-image: linear-gradient(135deg, #2196f3, #1976d2) 1;
}

.player-indicator-game.player-1.active {
  border-color: #2196f3;
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.6),
              0 4px 16px rgba(33, 150, 243, 0.4),
              0 0 0 1px rgba(33, 150, 243, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3), rgba(25, 118, 210, 0.15));
}

/* 玩家2（红色） */
.player-indicator-game.player-2 {
  border-image: linear-gradient(135deg, #f44336, #d32f2f) 1;
}

.player-indicator-game.player-2.active {
  border-color: #f44336;
  box-shadow: 0 8px 32px rgba(244, 67, 54, 0.6),
              0 4px 16px rgba(244, 67, 54, 0.4),
              0 0 0 1px rgba(244, 67, 54, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.3), rgba(211, 47, 47, 0.15));
}

@keyframes indicator-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* 装饰性边框 */
.indicator-border {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.player-indicator-game.active .indicator-border {
  opacity: 1;
  animation: borderGlow 2s ease-in-out infinite;
}

/* 玩家头像框 */
.player-avatar-box {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.avatar-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.player-1.active .avatar-glow {
  opacity: 1;
  background: radial-gradient(circle, rgba(33, 150, 243, 0.6), transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

.player-2.active .avatar-glow {
  opacity: 1;
  background: radial-gradient(circle, rgba(244, 67, 54, 0.6), transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

.player-avatar {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease;
}

.player-1 .player-avatar {
  background: linear-gradient(135deg, #1976d2, #1565c0);
}

.player-2 .player-avatar {
  background: linear-gradient(135deg, #d32f2f, #c62828);
}

.player-indicator-game.active .player-avatar {
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.avatar-icon {
  width: 28px;
  height: 28px;
  color: rgba(255, 255, 255, 0.9);
}

.player-number {
  font-size: 0.75rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
}

/* 玩家信息框 */
.player-info-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.player-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.name-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.turn-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  color: #4caf50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-pulse {
  width: 6px;
  height: 6px;
  background: #4caf50;
  border-radius: 50%;
  animation: badgePulse 1.5s ease-in-out infinite;
}

.badge-text {
  line-height: 1;
}

.player-goal {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.goal-icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

/* 统计信息 */
.player-stats {
  display: flex;
  gap: 0.8rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.9);
}

.stat-icon {
  width: 14px;
  height: 14px;
  opacity: 0.8;
}

.consecutive-badge {
  font-size: 0.65rem;
  color: #ff9800;
  font-weight: bold;
  margin-left: 0.1rem;
}

/* 操作按钮区域 */
.player-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-left: 0.8rem;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn svg {
  width: 18px;
  height: 18px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4),
              0 3px 8px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.action-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.action-btn:active:not(:disabled) {
  transform: translateY(-1px) scale(1.02);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(0.8);
}

/* 悔棋按钮 - 橙色主题 */
.undo-btn {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.25), rgba(255, 152, 0, 0.15));
  border-color: rgba(255, 152, 0, 0.5);
  animation: undoBtnPulse 2s ease-in-out infinite;
}

.undo-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.4), rgba(255, 152, 0, 0.25));
  border-color: rgba(255, 152, 0, 0.8);
  color: #ffb74d;
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.5),
              0 3px 10px rgba(255, 152, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 跳过按钮 - 绿色主题 */
.skip-btn {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25), rgba(76, 175, 80, 0.15));
  border-color: rgba(76, 175, 80, 0.5);
  animation: skipBtnPulse 2s ease-in-out infinite 0.5s;
}

.skip-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.4), rgba(76, 175, 80, 0.25));
  border-color: rgba(76, 175, 80, 0.8);
  color: #81c784;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5),
              0 3px 10px rgba(76, 175, 80, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes badgePulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
}

@keyframes borderGlow {
  0%, 100% {
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.2);
  }
}

/* 按钮脉冲动画 - 让按钮更醒目 */
@keyframes undoBtnPulse {
  0%, 100% {
    border-color: rgba(255, 152, 0, 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% {
    border-color: rgba(255, 152, 0, 0.7);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
                0 0 15px rgba(255, 152, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
}

@keyframes skipBtnPulse {
  0%, 100% {
    border-color: rgba(76, 175, 80, 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% {
    border-color: rgba(76, 175, 80, 0.7);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
                0 0 15px rgba(76, 175, 80, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .player-indicator-game {
    padding: 0.4rem 0.8rem;
  }

  .player-avatar-box {
    width: 52px;
    height: 52px;
  }

  .player-avatar {
    width: 52px;
    height: 52px;
  }

  .avatar-icon {
    width: 24px;
    height: 24px;
  }

  .name-text {
    font-size: 1rem;
  }

  .player-goal {
    font-size: 0.75rem;
  }

  .player-stats {
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem 0.9rem;
    font-size: 0.8rem;
  }

  .action-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>
