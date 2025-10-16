<template>
  <div class="chess-game-container">
    <!-- 游戏棋盘区域 -->
    <div class="game-board-section">
      <div class="chess-board-wrapper">
        <div class="chess-board" :style="boardStyle">
          <div
            v-for="(row, rowIndex) in boardCells"
            :key="rowIndex"
            class="board-row"
          >
            <div
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              class="board-cell"
              :class="getCellClass(cell)"
              @click="handleCellClick(cell)"
            >
              <!-- 渲染棋子 -->
              <div v-if="cell.pieces.length > 0" class="pieces-stack">
                <img
                  v-for="piece in cell.pieces"
                  :key="piece.id"
                  :src="getPieceSvg(piece)"
                  :alt="`Piece ${piece.shapeId}`"
                  class="piece-svg"
                  :class="getPieceClass(piece)"
                  :style="getPieceStyle(piece)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏控制区 -->
      <div class="game-controls">
        <div class="player-indicators">
          <div class="player-indicator" :class="{ active: currentPlayer === 1 }">
            <div class="indicator-dot player1"></div>
            <span>玩家 1</span>
          </div>
          <div class="turn-display">回合 {{ turnNumber }}</div>
          <div class="player-indicator" :class="{ active: currentPlayer === 2 }">
            <div class="indicator-dot player2"></div>
            <span>玩家 2</span>
          </div>
        </div>

        <div class="control-buttons">
          <button @click="handlePass" :disabled="!!winner" class="btn-secondary">
            跳过
          </button>
          <button @click="handleUndo" :disabled="moveHistory.length === 0 || !!winner" class="btn-secondary">
            悔棋
          </button>
          <button @click="handleReset" class="btn-primary">
            重置
          </button>
        </div>

        <div v-if="winner" class="winner-announcement">
          🎉 玩家 {{ winner }} 获胜！
        </div>
      </div>
    </div>

    <!-- 规则面板 -->
    <div class="rules-panel">
      <h3>游戏规则</h3>
      <div class="rules-content">
        <p>规则说明将在此处显示...</p>
        <p>（请手动添加规则文本）</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GameEngine } from '@/classes/chess/GameEngine'
import { BOARD_SIZE, BOARD_DISPLAY } from '@/constants/chess/board'
import { getPieceShape } from '@/constants/chess/pieces'
import type { Player, Position, ChessPiece, BoardCell, GameMode } from '@/types/chess'

// 游戏引擎实例
const gameEngine = ref<GameEngine | null>(null)
const selectedCell = ref<Position | null>(null)

// 初始化游戏
onMounted(() => {
  gameEngine.value = new GameEngine()
  gameEngine.value.startGame()
})

// 计算属性
const boardCells = computed((): BoardCell[][] => {
  if (!gameEngine.value) return []
  return gameEngine.value.getBoard().getCells()
})

const currentPlayer = computed((): Player => {
  return gameEngine.value?.getGameState().currentPlayer || 1
})

const turnNumber = computed((): number => {
  return gameEngine.value?.getGameState().turnNumber || 1
})

const winner = computed((): Player | null => {
  return gameEngine.value?.getGameState().winner || null
})

const moveHistory = computed(() => {
  return gameEngine.value?.getGameState().moveHistory || []
})

const boardStyle = computed(() => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_SIZE}, ${BOARD_DISPLAY.cellSize}px)`,
    gridTemplateRows: `repeat(${BOARD_SIZE}, ${BOARD_DISPLAY.cellSize}px)`,
    gap: '2px',
    backgroundColor: BOARD_DISPLAY.backgroundColor,
    padding: '10px',
    borderRadius: '8px'
  }
})

// 方法
function getCellClass(cell: BoardCell): string[] {
  const classes: string[] = []
  
  if (selectedCell.value?.row === cell.position.row && selectedCell.value?.col === cell.position.col) {
    classes.push('selected')
  }
  
  if (cell.isStartZone.player1) {
    classes.push('start-zone-player1')
  }
  if (cell.isStartZone.player2) {
    classes.push('start-zone-player2')
  }
  if (cell.isFinishZone.player1) {
    classes.push('finish-zone-player1')
  }
  if (cell.isFinishZone.player2) {
    classes.push('finish-zone-player2')
  }
  
  return classes
}

function getPieceClass(piece: ChessPiece): string[] {
  const classes: string[] = []
  classes.push(`player${piece.player}`)
  classes.push(`rotation-${piece.rotation}`)
  if (piece.isBird) {
    classes.push('bird')
  }
  return classes
}

function getPieceStyle(piece: ChessPiece): Record<string, string> {
  return {
    transform: `rotate(${piece.rotation}deg)`
  }
}

function getPieceSvg(piece: ChessPiece): string {
  const shape = getPieceShape(piece.shapeId)
  return shape.svgPath
}

function handleCellClick(cell: BoardCell): void {
  if (winner.value || !gameEngine.value) return

  const pos = cell.position

  // 如果没有选中格子且格子有当前玩家的棋子，选中它
  if (!selectedCell.value && cell.pieces.length > 0) {
    const topPiece = cell.pieces[cell.pieces.length - 1]
    if (topPiece && topPiece.player === currentPlayer.value) {
      selectedCell.value = pos
    }
    return
  }

  // 如果已经选中格子
  if (selectedCell.value) {
    // 点击同一格子取消选中
    if (selectedCell.value.row === pos.row && selectedCell.value.col === pos.col) {
      selectedCell.value = null
      return
    }

    // 获取选中的棋子
    const fromCell = gameEngine.value.getBoard().getCell(selectedCell.value)
    if (!fromCell || fromCell.pieces.length === 0) {
      selectedCell.value = null
      return
    }

    const piece = fromCell.pieces[fromCell.pieces.length - 1]
    if (!piece) {
      selectedCell.value = null
      return
    }

    // 构建移动对象
    const move = {
      piece,
      from: selectedCell.value,
      to: pos,
      steps: Math.max(Math.abs(pos.row - selectedCell.value.row), Math.abs(pos.col - selectedCell.value.col)),
      needRotation: false,
      canFit: true
    }

    // 尝试移动
    const success = gameEngine.value.executeMove(move)
    if (success) {
      selectedCell.value = null
    } else {
      // 移动失败，尝试选中新格子的棋子
      if (cell.pieces.length > 0) {
        const topPiece = cell.pieces[cell.pieces.length - 1]
        if (topPiece && topPiece.player === currentPlayer.value) {
          selectedCell.value = pos
        } else {
          selectedCell.value = null
        }
      } else {
        selectedCell.value = null
      }
    }
  }
}

function handlePass(): void {
  if (gameEngine.value && !winner.value) {
    gameEngine.value.pass()
  }
}

function handleUndo(): void {
  if (gameEngine.value && moveHistory.value.length > 0 && !winner.value) {
    gameEngine.value.undo()
    selectedCell.value = null
  }
}

function handleReset(): void {
  if (gameEngine.value) {
    gameEngine.value.startGame()
    selectedCell.value = null
  }
}
</script>

<style scoped>
.chess-game-container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  min-height: 100vh;
  align-items: flex-start;
}

/* 游戏棋盘区域 */
.game-board-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.chess-board-wrapper {
  display: flex;
  justify-content: center;
}

.chess-board {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.board-row {
  display: contents;
}

.board-cell {
  position: relative;
  background-color: white;
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-cell:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.board-cell.selected {
  background-color: rgba(255, 235, 59, 0.5);
  border-color: #ffd700;
}

.board-cell.start-zone-player1 {
  background-color: rgba(33, 150, 243, 0.1);
}

.board-cell.start-zone-player2 {
  background-color: rgba(244, 67, 54, 0.1);
}

.board-cell.finish-zone-player1 {
  background-color: rgba(76, 175, 80, 0.15);
}

.board-cell.finish-zone-player2 {
  background-color: rgba(156, 39, 176, 0.15);
}

/* 棋子样式 */
.pieces-stack {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.piece-svg {
  width: 80%;
  height: 80%;
  object-fit: contain;
  transition: transform 0.3s ease;
  pointer-events: none;
}

.piece-svg.player1 {
  filter: drop-shadow(0 2px 4px rgba(33, 150, 243, 0.3));
}

.piece-svg.player2 {
  filter: drop-shadow(0 2px 4px rgba(244, 67, 54, 0.3));
}

/* 游戏控制区 */
.game-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 500px;
}

.player-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.player-indicator.active {
  opacity: 1;
  background: rgba(255, 235, 59, 0.2);
  transform: scale(1.05);
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.indicator-dot.player1 {
  background: #2196f3;
}

.indicator-dot.player2 {
  background: #f44336;
}

.turn-display {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
}

.control-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.control-buttons button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.control-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.winner-announcement {
  padding: 1rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 规则面板 */
.rules-panel {
  width: 300px;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.rules-panel h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
  border-bottom: 2px solid #2196f3;
  padding-bottom: 0.5rem;
}

.rules-content {
  color: #666;
  line-height: 1.6;
}

.rules-content p {
  margin: 0.5rem 0;
}
</style>
