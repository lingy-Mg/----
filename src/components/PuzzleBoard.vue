<template>
  <div class="puzzle-container">
    <div class="game-header">
      <h1>拼图游戏</h1>
      <div class="game-info">
        <span>移动次数: {{ moves }}</span>
        <span>时间: {{ formatTime(timeElapsed) }}</span>
        <button @click="resetGame" class="reset-btn">重新开始</button>
      </div>
    </div>

    <GameInstructions />

    <div v-if="status === 'won'" class="win-message">
      🎉 恭喜！您完成了拼图！
    </div>

    <div class="game-board">
      <!-- 棋盘主体 -->
      <div class="board-grid">
        <div
          v-for="cell in boardCells"
          :key="cell.position"
          class="board-cell"
          :class="{ 
            'has-piece': cell.piece,
            'drop-zone': cell.isDropZone && !cell.piece
          }"
          @dragover.prevent
          @drop="handleDrop($event, cell.position)"
        >
          <div
            v-if="cell.piece"
            class="puzzle-piece placed"
            :class="`piece-${cell.piece.id}`"
            :style="getPieceStyle(cell.piece.id)"
            draggable="true"
            @dragstart="handleDragStart($event, cell.piece.id)"
          >
            <img :src="getPieceImage(cell.piece.id)" :alt="`拼图块 ${cell.piece.id}`" />
          </div>
        </div>
      </div>

      <!-- 待选区域 -->
      <div class="pieces-tray">
        <div
          v-for="piece in availablePieces"
          :key="piece.id"
          class="puzzle-piece available"
          :class="`piece-${piece.id}`"
          :style="getPieceStyle(piece.id)"
          draggable="true"
          @dragstart="handleDragStart($event, piece.id)"
        >
          <img :src="getPieceImage(piece.id)" :alt="`拼图块 ${piece.id}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PuzzleGame } from '@/classes/PuzzleGame'
import type { BoardCell, PuzzlePiece } from '@/types/puzzle'
import GameInstructions from './GameInstructions.vue'

// 导入拼图图片
import piece1 from '@/assets/pieces/piece1.svg'
import piece2 from '@/assets/pieces/piece2.svg'
import piece3 from '@/assets/pieces/piece3.svg'
import piece4 from '@/assets/pieces/piece4.svg'

const game = ref<PuzzleGame | null>(null)
const boardCells = ref<BoardCell[]>([])
const availablePieces = ref<PuzzlePiece[]>([])
const moves = ref(0)
const timeElapsed = ref(0)
const status = ref<'idle' | 'playing' | 'won'>('idle')
const draggedPieceId = ref<number | null>(null)

// 拼图图片映射
const pieceImages: Record<number, string> = {
  1: piece1,
  2: piece2,
  3: piece3,
  4: piece4
}

// 拼图颜色映射
const pieceColors: Record<number, string> = {
  1: '#FF5252', // 红色
  2: '#64B5F6', // 蓝色
  3: '#81C784', // 绿色
  4: '#FFD54F'  // 黄色
}

onMounted(() => {
  game.value = new PuzzleGame()
  updateGameState()
  
  // 每秒更新一次时间
  const interval = setInterval(() => {
    if (game.value) {
      timeElapsed.value = game.value.getTimeElapsed()
    }
  }, 100)

  onUnmounted(() => {
    clearInterval(interval)
    game.value?.destroy()
  })
})

const updateGameState = () => {
  if (!game.value) return
  
  const board = game.value.getBoard()
  boardCells.value = board.getBoard()
  availablePieces.value = board.getAvailablePieces()
  moves.value = game.value.getMoves()
  status.value = game.value.getStatus()
}

const handleDragStart = (event: DragEvent, pieceId: number) => {
  draggedPieceId.value = pieceId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', pieceId.toString())
  }
}

const handleDrop = (event: DragEvent, position: number) => {
  event.preventDefault()
  
  if (!game.value || draggedPieceId.value === null) return
  
  game.value.makeMove(draggedPieceId.value, position)
  draggedPieceId.value = null
  updateGameState()
}

const resetGame = () => {
  if (game.value) {
    game.value.reset()
    updateGameState()
  }
}

const getPieceImage = (pieceId: number): string => {
  return pieceImages[pieceId] || ''
}

const getPieceStyle = (pieceId: number) => {
  return {
    backgroundColor: pieceColors[pieceId] || '#999'
  }
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.puzzle-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.game-header {
  margin-bottom: 20px;
}

.game-header h1 {
  margin: 0 0 15px 0;
  font-size: 28px;
  color: #333;
  text-align: center;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
}

.reset-btn {
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: #45a049;
}

.win-message {
  background: #4CAF50;
  color: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.game-board {
  background: #C62828;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.board-cell {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  min-height: 80px;
}

.board-cell.drop-zone {
  background: rgba(255, 255, 255, 0.15);
  cursor: pointer;
}

.board-cell.drop-zone:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.8);
}

.board-cell.has-piece {
  background: transparent;
}

.pieces-tray {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  min-height: 100px;
  align-items: center;
}

.puzzle-piece {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  transition: all 0.3s;
  border: 3px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.puzzle-piece.available {
  animation: bounce 2s infinite;
}

.puzzle-piece:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.puzzle-piece.placed {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.puzzle-piece img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .puzzle-container {
    padding: 10px;
  }

  .board-cell {
    min-height: 60px;
  }

  .puzzle-piece {
    width: 70px;
    height: 70px;
  }

  .pieces-tray {
    flex-wrap: wrap;
  }
}
</style>
