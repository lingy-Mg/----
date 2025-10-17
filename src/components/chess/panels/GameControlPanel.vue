<template>
  <div class="game-control-panel">
    <h3 class="panel-title">🎮 游戏控制</h3>
    
    <div class="control-buttons">
      <!-- 旋转按钮 -->
      <button 
        @click="handleRotate"
        :disabled="!canRotate || !!winner"
        class="btn-action"
        title="旋转选中的棋子 (R键)"
      >
        🔄 旋转
      </button>

      <!-- 跳过回合按钮 -->
      <button 
        @click="handlePass" 
        :disabled="!!winner" 
        class="btn-secondary" 
        title="结束本回合"
      >
        ⏭️ 跳过
      </button>

      <!-- 悔棋按钮 -->
      <button
        @click="handleUndo"
        :disabled="!canUndo || !!winner"
        class="btn-warning"
        title="悔棋一步"
      >
        ↩️ 悔棋
      </button>

      <!-- 重置按钮 -->
      <button 
        @click="handleReset" 
        class="btn-primary" 
        title="重新开始"
      >
        🔄 重置
      </button>
    </div>

    <!-- 调试和规则切换按钮 -->
    <div class="toggle-buttons">
      <button 
        class="debug-toggle" 
        @click="toggleDebug"
        :class="{ active: showDebug }"
        title="显示/隐藏调试面板"
      >
        {{ showDebug ? '🔧 隐藏调试' : '🔧 调试' }}
      </button>
      
      <button 
        class="rules-toggle" 
        @click="toggleRules" 
        :aria-expanded="showRules"
        title="显示/隐藏游戏规则"
      >
        {{ showRules ? '📖 隐藏规则' : '📖 规则' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Move } from '@/types/chess'

// ===== Props =====
interface Props {
  winner: number | null
  moveHistory: Move[]
  showDebug: boolean
  showRules: boolean
  selectedCell: { row: number; col: number } | null
  handleRotate: () => void
  handlePass: () => void
  handleUndo: () => void
  handleReset: () => void
  toggleDebug: () => void
  toggleRules: () => void
}

const props = defineProps<Props>()

// ===== 计算属性 =====
const canRotate = computed(() => {
  return !!props.selectedCell && !props.winner
})

const canUndo = computed(() => {
  return props.moveHistory.length > 0 && !props.winner
})
</script>

<style scoped>
.game-control-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-title {
  margin: 0 0 1rem 0;
  color: var(--text-primary, #333);
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

.control-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.toggle-buttons {
  display: flex;
  gap: 0.5rem;
}

/* 按钮基础样式 */
.btn-action,
.btn-secondary, 
.btn-warning,
.btn-primary,
.debug-toggle,
.rules-toggle {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

/* 按钮颜色变体 */
.btn-action {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}

.btn-action:hover:not(:disabled) {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  transform: translateY(-1px);
}

.btn-secondary {
  background: linear-gradient(135deg, #9e9e9e, #757575);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #757575, #616161);
  transform: translateY(-1px);
}

.btn-warning {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #f57c00, #ef6c00);
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #388e3c, #2e7d32);
  transform: translateY(-1px);
}

/* 切换按钮 */
.debug-toggle,
.rules-toggle {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #333);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
  padding: 0.5rem;
}

.debug-toggle:hover,
.rules-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.debug-toggle.active {
  background: linear-gradient(135deg, #ffc107, #ff8f00);
  color: white;
  border-color: transparent;
}

/* 禁用状态 */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

button:disabled:hover {
  transform: none !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-buttons {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .toggle-buttons {
    flex-direction: column;
  }
  
  .btn-action,
  .btn-secondary, 
  .btn-warning,
  .btn-primary,
  .debug-toggle,
  .rules-toggle {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>