<template>
  <div class="chess-board-container">
    <h2>Puzzle Chess - 拼图棋盘游戏</h2>
    
    <div class="game-info">
      <div class="player-info player1" :class="{ active: currentPlayer === 1 }">
        <span class="player-label">玩家 1 (蓝)</span>
        <span class="piece-count">棋子: {{ player1Pieces.length }}</span>
      </div>
      
      <div class="turn-info">
        <div>回合: {{ turnNumber }}</div>
        <div v-if="winner">
          <strong>🎉 玩家 {{ winner }} 获胜！</strong>
        </div>
      </div>
      
      <div class="player-info player2" :class="{ active: currentPlayer === 2 }">
        <span class="player-label">玩家 2 (红)</span>
        <span class="piece-count">棋子: {{ player2Pieces.length }}</span>
      </div>
    </div>

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
          <div class="cell-coordinate">{{ rowIndex }},{{ colIndex }}</div>
          
          <!-- Render pieces in this cell -->
          <div v-if="cell.pieces.length > 0" class="pieces-stack">
            <div
              v-for="piece in cell.pieces"
              :key="piece.id"
              class="piece"
              :class="getPieceClass(piece)"
              :style="getPieceStyle(piece)"
            >
              <span class="piece-label">{{ piece.shapeId }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="handlePass" :disabled="!!winner">
        跳过回合
      </button>
      <button @click="handleUndo" :disabled="moveHistory.length === 0 || !!winner">
        悔棋
      </button>
      <button @click="handleReset">
        重新开始
      </button>
    </div>

    <div class="debug-info" v-if="isDev">
      <h3>调试信息</h3>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GameEngine } from '@/classes/chess/GameEngine'
import type { BoardCell, ChessPiece } from '@/types/chess'
import { GameMode } from '@/types/chess'
import { BOARD_DISPLAY } from '@/constants/chess/board'

// Game engine instance
const engine = ref<GameEngine | null>(null)

// Reactive state
const boardCells = ref<BoardCell[][]>([])
const currentPlayer = ref(1)
const turnNumber = ref(0)
const winner = ref<number | null>(null)
const moveHistory = ref<any[]>([])
const player1Pieces = ref<ChessPiece[]>([])
const player2Pieces = ref<ChessPiece[]>([])
const selectedPiece = ref<ChessPiece | null>(null)

// Dev mode
const isDev = import.meta.env.DEV

// Computed
const boardStyle = computed(() => ({
  gridTemplateColumns: `repeat(8, ${BOARD_DISPLAY.cellSize}px)`,
  gridTemplateRows: `repeat(8, ${BOARD_DISPLAY.cellSize}px)`,
}))

const debugInfo = computed(() => ({
  currentPlayer: currentPlayer.value,
  turn: turnNumber.value,
  winner: winner.value,
  moves: moveHistory.value.length,
  selected: selectedPiece.value?.id
}))

// Methods
function getCellClass(cell: BoardCell) {
  const classes: string[] = []
  
  if (cell.isStartZone.player1) classes.push('start-zone-p1')
  if (cell.isStartZone.player2) classes.push('start-zone-p2')
  if (cell.isFinishZone.player1) classes.push('finish-zone-p1')
  if (cell.isFinishZone.player2) classes.push('finish-zone-p2')
  
  return classes
}

function getPieceClass(piece: ChessPiece) {
  return [
    `player${piece.player}`,
    selectedPiece.value?.id === piece.id ? 'selected' : ''
  ]
}

function getPieceStyle(piece: ChessPiece) {
  return {
    transform: `rotate(${piece.rotation}deg)`
  }
}

function handleCellClick(cell: BoardCell) {
  if (winner.value) return

  // If cell has pieces, select the top piece
  if (cell.pieces.length > 0) {
    const topPiece = cell.pieces[cell.pieces.length - 1]
    
    // Only select if it's current player's piece
    if (topPiece && topPiece.player === currentPlayer.value) {
      selectedPiece.value = selectedPiece.value?.id === topPiece.id ? null : topPiece
      console.log('Selected piece:', topPiece.id)
    }
  } else if (selectedPiece.value) {
    // Try to move selected piece here
    attemptMove(selectedPiece.value, cell.position)
  }
}

function attemptMove(piece: ChessPiece, to: any) {
  if (!engine.value) return

  const move = {
    piece,
    from: piece.position,
    to,
    steps: 1,
    needRotation: false,
    canFit: true
  }

  const success = engine.value.executeMove(move)
  
  if (success) {
    console.log('Move executed successfully')
    updateGameState()
    selectedPiece.value = null
  } else {
    console.error('Move failed')
  }
}

function handlePass() {
  if (!engine.value || winner.value) return
  
  const success = engine.value.pass()
  if (success) {
    updateGameState()
  }
}

function handleUndo() {
  if (!engine.value || winner.value) return
  
  const success = engine.value.undo()
  if (success) {
    updateGameState()
  }
}

function handleReset() {
  initGame()
}

function updateGameState() {
  if (!engine.value) return

  const state = engine.value.getGameState()
  boardCells.value = engine.value.getBoard().getCells()
  currentPlayer.value = state.currentPlayer
  turnNumber.value = state.turnNumber
  winner.value = state.winner
  moveHistory.value = state.moveHistory
  player1Pieces.value = state.player1Pieces
  player2Pieces.value = state.player2Pieces
}

function initGame() {
  // Create new game engine
  engine.value = new GameEngine({
    mode: GameMode.PVP,
    boardSize: 8,
    piecesPerPlayer: 4
  })

  // Start game
  engine.value.startGame()
  
  // Update state
  updateGameState()
  
  console.log('✅ Game initialized')
  console.log('Player 1 pieces:', player1Pieces.value.length)
  console.log('Player 2 pieces:', player2Pieces.value.length)
}

// Lifecycle
onMounted(() => {
  initGame()
})
</script>

<style scoped>
.chess-board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 1rem;
}

h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.game-info {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 1rem;
}

.player-info {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: #f5f5f5;
  min-width: 120px;
}

.player-info.player1 {
  border-left: 4px solid #2196f3;
}

.player-info.player2 {
  border-left: 4px solid #f44336;
}

.player-info.active {
  background: #fff3cd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.player-label {
  font-weight: bold;
  font-size: 0.9rem;
}

.piece-count {
  font-size: 0.85rem;
  color: #666;
}

.turn-info {
  text-align: center;
  font-size: 1.1rem;
}

.chess-board {
  display: grid;
  border: 2px solid #333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.board-row {
  display: contents;
}

.board-cell {
  position: relative;
  border: 1px solid #999;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.board-cell:hover {
  background: #f0f0f0;
}

.board-cell.start-zone-p1 {
  background: #e3f2fd;
}

.board-cell.start-zone-p2 {
  background: #ffebee;
}

.board-cell.finish-zone-p1 {
  background: #c8e6c9;
}

.board-cell.finish-zone-p2 {
  background: #fff9c4;
}

.cell-coordinate {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 0.65rem;
  color: #999;
  pointer-events: none;
}

.pieces-stack {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.piece {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.3s;
}

.piece.player1 {
  background: #2196f3;
}

.piece.player2 {
  background: #f44336;
}

.piece.selected {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 0 3px #ffd700;
}

.piece-label {
  font-size: 1.2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: #4caf50;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #45a049;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  max-width: 600px;
  width: 100%;
}

.debug-info h3 {
  margin-top: 0;
}

.debug-info pre {
  overflow-x: auto;
  font-size: 0.85rem;
}
</style>
