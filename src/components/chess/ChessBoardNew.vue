<template>
  <div class="chess-game-container">
    <div class="game-content">
      <!-- 左侧：游戏主区域 -->
      <div class="game-main">
        <!-- 玩家指示器 -->
        <PlayerIndicator :current-player="currentPlayer" />

        <!-- 棋盘容器 -->
        <div class="chess-board-wrapper">
          <!-- 棋盘背景层 -->
          <BoardBackground
            :board-cells="boardCells"
            :get-cell-class="interaction.getCellClass"
            :cell-tooltip="interaction.cellTooltip"
            :should-show-piece-preview="interaction.shouldShowPiecePreview"
            :get-preview-piece-svg="interaction.getPreviewPieceSvg"
            :get-preview-piece-style="interaction.getPreviewPieceStyle"
            :handle-cell-hover="interaction.handleCellHover"
            :handle-cell-leave="interaction.handleCellLeave"
          />

          <!-- 棋子浮动层 -->
          <PiecesLayer
            :board-cells="boardCells"
            :is-selected-piece="gameState.isSelectedPiece"
            :get-piece-cell-position="interaction.getPieceCellPosition"
            :get-piece-svg="interaction.getPieceSvg"
            :get-piece-class="interaction.getPieceClass"
            :get-piece-wrapper-class="interaction.getPieceWrapperClass"
            :get-piece-style="interaction.getPieceStyle"
            :handle-piece-click="interaction.handlePieceClick"
            :handle-empty-cell-click="interaction.handleEmptyCellClick"
          />
        </div>

        <!-- 游戏状态显示 -->
        <GameStatus :winner="winner" :move-history="moveHistory" />
      </div>

      <!-- 右侧：控制面板 -->
      <div class="game-sidebar">
        <!-- 游戏控制面板 -->
        <GameControlPanel
          :winner="winner"
          :move-history="moveHistory"
          :show-debug="debugState.showDebug.value"
          :show-rules="showRules"
          :selected-cell="selectedCell"
          :handle-rotate="handleRotate"
          :handle-pass="handlePass"
          :handle-undo="handleUndo"
          :handle-reset="handleReset"
          :toggle-debug="debugState.toggleDebugPanel"
          :toggle-rules="toggleRules"
        />
      </div>
    </div>

    <!-- 规则面板（浮动） -->
    <RulesPanel :show-rules="showRules" :close-rules="() => showRules = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { GameEngine } from '@/classes/chess/GameEngine'
import { useGameState } from './composables/useGameState'
import { useDebugSettings } from './composables/useDebugSettings'
import { usePieceInteraction } from './composables/usePieceInteraction'

// 导入子组件
import BoardBackground from './board/BoardBackground.vue'
import PiecesLayer from './board/PiecesLayer.vue'
import PlayerIndicator from './ui/PlayerIndicator.vue'
import GameStatus from './ui/GameStatus.vue'
import GameControlPanel from './panels/GameControlPanel.vue'
import RulesPanel from './panels/RulesPanel.vue'

// ===== 组合式函数 =====
const gameState = useGameState()
const debugState = useDebugSettings()
const interaction = usePieceInteraction(gameState, debugState)

// ===== 本地状态 =====
const showRules = ref(false)

// ===== 从 gameState 解构 =====
const {
  gameEngine,
  selectedCell,
  boardCells,
  currentPlayer,
  winner,
  moveHistory
} = gameState

// ===== 初始化 =====
onMounted(() => {
  // 初始化游戏引擎
  const engine = new GameEngine()
  engine.startGame()
  gameState.initializeGame(engine)

  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

// ===== 游戏控制方法 =====
function handleRotate() {
  gameState.rotatePiece()
}

function handlePass() {
  gameState.skipTurn()
}

function handleUndo() {
  gameState.undoMove()
}

function handleReset() {
  if (confirm('确定要重置游戏吗？')) {
    gameState.resetGame()
  }
}

function toggleRules() {
  showRules.value = !showRules.value
}

// ===== 键盘事件 =====
function handleKeyPress(event: KeyboardEvent) {
  if (winner.value) return

  switch (event.key.toLowerCase()) {
    case 'r':
      handleRotate()
      break
    case 'escape':
      gameState.clearSelection()
      break
  }
}

// ===== 导出供外部使用 =====
defineExpose({
  debugState,
  gameState
})
</script>

<style scoped>
.chess-game-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-content {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  width: 100%;
}

.game-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chess-board-wrapper {
  position: relative;
  width: fit-content;
  margin: 0 auto;
}

.game-sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .game-content {
    flex-direction: column;
    align-items: center;
  }

  .game-sidebar {
    width: 100%;
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .chess-game-container {
    padding: 1rem;
  }

  .game-content {
    gap: 1rem;
  }

  .game-main {
    gap: 1rem;
  }

  .game-sidebar {
    gap: 1rem;
  }
}
</style>