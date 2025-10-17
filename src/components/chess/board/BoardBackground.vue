<template>
  <div class="chess-board-background" :style="boardStyle" aria-label="棋盘">
    <div
      v-for="(row, rowIndex) in boardCells"
      :key="rowIndex"
      class="board-row"
    >
      <div
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        class="board-cell"
        :class="[
          getCellClass(cell),
          (rowIndex + colIndex) % 2 === 1 ? 'board-cell--dark' : 'board-cell--light'
        ]"
        @mouseenter="handleCellHover(cell)"
        @mouseleave="handleCellLeave(cell)"
        :title="cellTooltip(cell, rowIndex, colIndex)"
      >
        <!-- 棋子预览（悬停在可移动位置时显示） -->
        <div 
          v-if="shouldShowPiecePreview(cell)"
          class="piece-preview"
        >
          <img
            :src="getPreviewPieceSvg()"
            :alt="`预览棋子`"
            class="piece-svg piece-preview-img"
            :style="getPreviewPieceStyle()"
            draggable="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BOARD_SIZE, BOARD_DISPLAY } from '@/constants/chess/board'
import type { BoardCell } from '@/types/chess'

// ===== Props =====
interface Props {
  boardCells: BoardCell[][]
  getCellClass: (cell: BoardCell) => string[]
  cellTooltip: (cell: BoardCell, rowIndex: number, colIndex: number) => string
  shouldShowPiecePreview: (cell: BoardCell) => boolean
  getPreviewPieceSvg: () => string
  getPreviewPieceStyle: () => Record<string, string>
  handleCellHover: (cell: BoardCell) => void
  handleCellLeave: (cell: BoardCell) => void
}

const props = defineProps<Props>()

// ===== 计算属性 =====
const boardStyle = computed(() => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_SIZE}, ${BOARD_DISPLAY.cellSize}px)`,
    gridTemplateRows: `repeat(${BOARD_SIZE}, ${BOARD_DISPLAY.cellSize}px)`,
    gap: '2px',
    backgroundColor: 'var(--board-bg)',
    padding: '10px',
    borderRadius: '12px'
  }
})
</script>

<style scoped>
/* 棋盘背景样式 */
.chess-board-background {
  position: relative;
  z-index: 1;
}

.board-row {
  display: contents;
}

.board-cell {
  width: 100%;
  height: 100%;
  background: var(--cell-bg-light);
  border: 1px solid var(--cell-border);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.board-cell--dark {
  background: var(--cell-bg-dark);
}

.board-cell--light {
  background: var(--cell-bg-light);
}

.board-cell.selected {
  background: var(--cell-selected) !important;
  box-shadow: 0 0 0 3px var(--primary-color);
  z-index: 2;
}

.board-cell.possible-move {
  background: var(--cell-possible-move) !important;
  box-shadow: inset 0 0 0 3px var(--success-color);
}

.board-cell.possible-move::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: var(--success-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.6;
  z-index: 1;
}

/* 棋子预览样式 */
.piece-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

.piece-preview-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}
</style>

<style>
/* CSS 变量定义（全局，不使用 scoped） */
:root {
  --board-bg: #8d6e63;
  --cell-bg-light: #f5deb3;
  --cell-bg-dark: #daa520;
  --cell-border: #8d6e63;
  --cell-selected: #ffeb3b;
  --cell-possible-move: #c8e6c9;
  --primary-color: #ffc107;
  --success-color: #4caf50;
}
</style>