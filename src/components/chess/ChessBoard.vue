<template>
  <div class="chess-game-container">
    <!-- 游戏棋盘区域 -->
    <div class="game-board-section">
      <!-- 上方玩家指示器 (玩家1在顶部) -->
      <div class="board-player-indicator top" :class="{ active: currentPlayer === 1, 'has-winner': !!winner }">
        <div class="player-badge">
          <div class="player-icon player1">
            <span class="player-number">1</span>
          </div>
          <div class="player-info">
            <span class="player-label">玩家 1</span>
            <span v-if="currentPlayer === 1 && !winner" class="turn-badge">当前回合</span>
            <span v-if="winner === 1" class="winner-badge">🏆 获胜</span>
          </div>
        </div>
      </div>

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
                <div
                  v-for="piece in cell.pieces"
                  :key="piece.id"
                  class="piece-wrapper"
                  :class="getPieceWrapperClass(piece)"
                >
                  <img
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
      </div>

      <!-- 下方玩家指示器 (玩家2在底部) -->
      <div class="board-player-indicator bottom" :class="{ active: currentPlayer === 2, 'has-winner': !!winner }">
        <div class="player-badge">
          <div class="player-icon player2">
            <span class="player-number">2</span>
          </div>
          <div class="player-info">
            <span class="player-label">玩家 2</span>
            <span v-if="currentPlayer === 2 && !winner" class="turn-badge">当前回合</span>
            <span v-if="winner === 2" class="winner-badge">🏆 获胜</span>
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
          <button @click="handleRotate" :disabled="!selectedCell || !!winner" class="btn-rotate" title="旋转棋子 (R 键)">
            <span class="rotate-icon">🔄</span> 旋转
          </button>
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

        <div class="keyboard-hints">
          <span class="hint-item">
            <kbd>R</kbd> 旋转棋子
          </span>
          <span class="hint-item">
            <kbd>ESC</kbd> 取消选择
          </span>
        </div>

        <div v-if="winner" class="winner-announcement">
          🎉 玩家 {{ winner }} 获胜！
        </div>
      </div>
    </div>

    <!-- 规则面板 -->
    <div class="rules-panel">
    <h3>🎮 游戏规则</h3>
    <div class="rules-content">
      <section class="rule-section">
        <h4>📋 游戏目标</h4>
        <ul>
        <li><strong>棋盘</strong>：4×4 网格</li>
        <li><strong>棋子</strong>：每方4个拼图形状棋子</li>
        <li><strong>起始位置</strong>：玩家1在顶行（第0行）、玩家2在底行（第3行）</li>
        <li><strong>目标</strong>：将己方所有棋子移至对方起始行</li>
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
        <li><strong>相邻移动（距离 = 1格）</strong>：
          <ul>
            <li>✅ 移动到相邻8格之一后，可以选择是否旋转</li>
            <li>⚠️ 旋转后本次移动结束，切换回合</li>
          </ul>
        </li>
        <li><strong>远距离移动（距离 > 1格）</strong>：
          <ul>
            <li>❌ 不能旋转，只能移动</li>
            <li>✅ 适合快速占领位置</li>
          </ul>
        </li>
        <li><strong>鸟类棋子特权</strong>：
          <ul>
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
        <li><strong>每回合一个动作</strong>：选择移动或旋转（鸟类专属）</li>
        <li><strong>快速推进</strong>：远距离移动可快速抵达目标区域</li>
        <li><strong>精准调整</strong>：相邻移动可旋转，调整棋子朝向</li>
        <li><strong>鸟类优势</strong>：可原地旋转，无需移动</li>
        <li><strong>位置卡位</strong>：合理占据关键位置，阻碍对手</li>
        </ul>
      </section>

      <section class="rule-section">
        <h4>🎯 操作指南</h4>
        <ol>
        <li>点击己方棋子选中（黄色高亮 + 绿色可移动提示）</li>
        <li>点击目标格子完成移动</li>
        <li>相邻移动时可按 <kbd>R</kbd> 键旋转</li>
        <li>鸟类棋子可原地按 <kbd>R</kbd> 键旋转</li>
        <li>按 <kbd>ESC</kbd> 取消选择</li>
        <li>点击"跳过"按钮可提前结束回合</li>
        </ol>
      </section>

      <section class="rule-section tip-box">
        <p><strong>💭 新手提示</strong></p>
        <p>简洁的一回合一动作规则！远距离移动效率高，相邻移动可旋转。合理利用鸟类棋子的原地旋转能力，快速完成目标！</p>
      </section>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { GameEngine } from '@/classes/chess/GameEngine'
import { BOARD_SIZE, BOARD_DISPLAY } from '@/constants/chess/board'
import { getPieceShape } from '@/constants/chess/pieces'
import type { Player, Position, ChessPiece, BoardCell, GameMode, Move } from '@/types/chess'

// 游戏引擎实例
const gameEngine = ref<GameEngine | null>(null)
const selectedCell = ref<Position | null>(null)
const possibleMoves = ref<Position[]>([])

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
  
  // 检查是否为可移动位置
  const isPossibleMove = possibleMoves.value.some(
    (pos: Position) => pos.row === cell.position.row && pos.col === cell.position.col
  )
  if (isPossibleMove) {
    classes.push('possible-move')
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

function getPieceWrapperClass(piece: ChessPiece): string[] {
  const classes: string[] = []
  classes.push(`player${piece.player}-wrapper`)
  // 如果是当前玩家的棋子，添加高亮类
  if (piece.player === currentPlayer.value) {
    classes.push('current-player-wrapper')
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
  // 如果是当前玩家的棋子，添加高亮类
  if (piece.player === currentPlayer.value) {
    classes.push('current-player-piece')
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

// 计算可能的移动位置
function calculatePossibleMoves(piece: ChessPiece): void {
  if (!gameEngine.value) {
    possibleMoves.value = []
    return
  }
  
  const moves = gameEngine.value.getPossibleMovesForPiece(piece)
  possibleMoves.value = moves.map((move: Move) => move.to)
}

function handleCellClick(cell: BoardCell): void {
  if (winner.value || !gameEngine.value) return

  const pos = cell.position

  // 如果没有选中格子且格子有当前玩家的棋子，选中它
  if (!selectedCell.value && cell.pieces.length > 0) {
    const topPiece = cell.pieces[cell.pieces.length - 1]
    if (topPiece && topPiece.player === currentPlayer.value) {
      selectedCell.value = pos
      // 计算并显示可能的移动
      calculatePossibleMoves(topPiece)
    }
    return
  }

  // 如果已经选中格子
  if (selectedCell.value) {
    // 点击同一格子取消选中
    if (selectedCell.value.row === pos.row && selectedCell.value.col === pos.col) {
      selectedCell.value = null
      possibleMoves.value = []
      return
    }

    // 获取选中的棋子
    const fromCell = gameEngine.value.getBoard().getCell(selectedCell.value)
    if (!fromCell || fromCell.pieces.length === 0) {
      selectedCell.value = null
      possibleMoves.value = []
      return
    }

    const piece = fromCell.pieces[fromCell.pieces.length - 1]
    if (!piece) {
      selectedCell.value = null
      possibleMoves.value = []
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
      possibleMoves.value = []
    } else {
      // 移动失败，尝试选中新格子的棋子
      if (cell.pieces.length > 0) {
        const topPiece = cell.pieces[cell.pieces.length - 1]
        if (topPiece && topPiece.player === currentPlayer.value) {
          selectedCell.value = pos
          calculatePossibleMoves(topPiece)
        } else {
          selectedCell.value = null
          possibleMoves.value = []
        }
      } else {
        selectedCell.value = null
        possibleMoves.value = []
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
    possibleMoves.value = []
  }
}

function handleReset(): void {
  if (gameEngine.value) {
    gameEngine.value.startGame()
    selectedCell.value = null
    possibleMoves.value = []
  }
}

function handleRotate(): void {
  if (!selectedCell.value || !gameEngine.value || winner.value) return
  
  const cell = gameEngine.value.getBoard().getCell(selectedCell.value)
  if (!cell || cell.pieces.length === 0) return
  
  const piece = cell.pieces[cell.pieces.length - 1]
  if (piece && piece.player === currentPlayer.value) {
    gameEngine.value.rotatePiece(piece)
    // 旋转后重新计算可能的移动
    calculatePossibleMoves(piece)
  }
}

// 键盘事件处理
function handleKeyPress(event: KeyboardEvent): void {
  if (winner.value) return
  
  switch(event.key.toLowerCase()) {
    case 'r':
      handleRotate()
      break
    case 'escape':
      selectedCell.value = null
      possibleMoves.value = []
      break
  }
}

// 添加和移除键盘事件监听
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
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
  gap: 1rem;
}

/* 棋盘玩家指示器 */
.board-player-indicator {
  width: 100%;
  max-width: 400px;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 12px;
  opacity: 0.5;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.board-player-indicator.active {
  opacity: 1;
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: pulse-glow 2s ease-in-out infinite;
}

.board-player-indicator.top.active {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border: 3px solid #f44336;
}

.board-player-indicator.bottom.active {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 3px solid #2196f3;
}

.board-player-indicator.has-winner {
  opacity: 0.3;
}

.board-player-indicator.has-winner.active {
  opacity: 1;
  animation: winner-celebration 1s ease-in-out infinite;
}

.player-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 2rem;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.board-player-indicator.active .player-icon {
  transform: scale(1.1);
  animation: bounce 1s ease-in-out infinite;
}

.player-icon.player1 {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

.player-icon.player2 {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
}

.player-number {
  font-family: 'Arial Black', sans-serif;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.player-label {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.turn-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: blink 1.5s ease-in-out infinite;
}

.winner-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: winner-shine 1s ease-in-out infinite;
}

/* 动画 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(76, 175, 80, 0.5);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1.1) translateY(0);
  }
  50% {
    transform: scale(1.1) translateY(-5px);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes winner-celebration {
  0%, 100% {
    transform: scale(1.05);
  }
  50% {
    transform: scale(1.08);
  }
}

@keyframes winner-shine {
  0%, 100% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 0 4px 8px rgba(255, 215, 0, 0.6), 0 0 15px rgba(255, 215, 0, 0.4);
  }
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

/* 可移动位置提示 */
.board-cell.possible-move {
  position: relative;
}

.board-cell.possible-move::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background-color: rgba(76, 175, 80, 0.6);
  border: 2px solid rgba(76, 175, 80, 0.9);
  border-radius: 50%;
  pointer-events: none;
  z-index: 5;
}

.board-cell.possible-move:hover::after {
  background-color: rgba(76, 175, 80, 0.8);
  border-color: rgba(76, 175, 80, 1);
  width: 28px;
  height: 28px;
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

/* 棋子外层包装 - 添加彩色背景圆 */
.piece-wrapper {
  width: 90%;
  height: 90%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

/* 玩家1棋子背景 - 蓝色 */
.piece-wrapper.player1-wrapper {
  background: radial-gradient(circle, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.05) 70%, transparent 100%);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3) inset;
}

/* 玩家2棋子背景 - 红色 */
.piece-wrapper.player2-wrapper {
  background: radial-gradient(circle, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.05) 70%, transparent 100%);
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.3) inset;
}

/* 当前玩家的棋子 - 更明显的边框（无动画） */
.piece-wrapper.player1-wrapper.current-player-wrapper {
  background: radial-gradient(circle, rgba(33, 150, 243, 0.25) 0%, rgba(33, 150, 243, 0.1) 70%, transparent 100%);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.6) inset,
              0 0 15px rgba(33, 150, 243, 0.4);
}

.piece-wrapper.player2-wrapper.current-player-wrapper {
  background: radial-gradient(circle, rgba(244, 67, 54, 0.25) 0%, rgba(244, 67, 54, 0.1) 70%, transparent 100%);
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.6) inset,
              0 0 15px rgba(244, 67, 54, 0.4);
}

.piece-svg {
  width: 75%;
  height: 75%;
  object-fit: contain;
  transition: all 0.3s ease;
  pointer-events: none;
  position: relative;
}

/* 玩家1棋子 - 蓝色边框和阴影 */
.piece-svg.player1 {
  filter: drop-shadow(0 0 8px rgba(33, 150, 243, 0.8)) 
          drop-shadow(0 2px 4px rgba(33, 150, 243, 0.4));
  border-radius: 8px;
}

/* 玩家2棋子 - 红色边框和阴影 */
.piece-svg.player2 {
  filter: drop-shadow(0 0 8px rgba(244, 67, 54, 0.8)) 
          drop-shadow(0 2px 4px rgba(244, 67, 54, 0.4));
  border-radius: 8px;
}

/* 当前玩家的棋子 - 更强烈的高亮（无动画） */
.piece-svg.player1.current-player-piece {
  filter: drop-shadow(0 0 12px rgba(33, 150, 243, 1)) 
          drop-shadow(0 0 20px rgba(33, 150, 243, 0.6))
          drop-shadow(0 4px 8px rgba(33, 150, 243, 0.4));
}

.piece-svg.player2.current-player-piece {
  filter: drop-shadow(0 0 12px rgba(244, 67, 54, 1)) 
          drop-shadow(0 0 20px rgba(244, 67, 54, 0.6))
          drop-shadow(0 4px 8px rgba(244, 67, 54, 0.4));
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

.btn-rotate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.btn-rotate:hover:not(:disabled) {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px) rotate(-15deg);
}

.btn-rotate .rotate-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.btn-rotate:hover:not(:disabled) .rotate-icon {
  transform: rotate(180deg);
}

.keyboard-hints {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.hint-item kbd {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 0.85rem;
  color: #333;
  box-shadow: 0 2px 0 #bbb;
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
  width: 420px;
  min-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.rules-panel h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid #2196f3;
  padding-bottom: 0.5rem;
}

.rules-content {
  color: #555;
  line-height: 1.8;
  font-size: 1rem;
}

.rule-section {
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.rule-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.rule-section h4 {
  margin: 0 0 0.85rem 0;
  color: #2196f3;
  font-size: 1.15rem;
  font-weight: 600;
}

.rule-section ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.rule-section ul.compact {
  padding-left: 1.2rem;
}

.rule-section li {
  margin: 0.4rem 0;
  color: #666;
}

.rule-section ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  counter-reset: item;
}

.rule-section ol li {
  margin: 0.5rem 0;
  color: #666;
}

.rule-section code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #e91e63;
  font-weight: 600;
}

.rule-section p {
  margin: 0.5rem 0;
  color: #666;
}

.rule-section p.tip {
  background: #fff3cd;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #ffc107;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

.tip-box {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  padding: 1rem;
  border-radius: 8px;
  border: none;
}

.tip-box p {
  margin: 0.3rem 0;
  color: #555;
}

.tip-box strong {
  color: #2196f3;
}

/* 规则面板滚动条样式 */
.rules-panel::-webkit-scrollbar {
  width: 6px;
}

.rules-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.rules-panel::-webkit-scrollbar-thumb {
  background: #2196f3;
  border-radius: 10px;
}

.rules-panel::-webkit-scrollbar-thumb:hover {
  background: #1976d2;
}
</style>
