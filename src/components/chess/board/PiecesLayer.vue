<template>
  <div class="chess-pieces-layer">
    <div
      v-for="(row, rowIndex) in boardCells"
      :key="`pieces-${rowIndex}`"
      class="pieces-row"
    >
      <div
        v-for="(cell, colIndex) in row"
        :key="`pieces-${colIndex}`"
        class="pieces-cell"
        :style="getPieceCellPosition(rowIndex, colIndex)"
        @click="handleEmptyCellClick(cell)"
        @mouseenter="handleCellHover(cell)"
        @mouseleave="handleCellLeave(cell)"
      >
        <!-- 渲染棋子 -->
        <div v-if="cell.pieces.length > 0" class="pieces-stack">
          <ChessPiece
            v-for="piece in cell.pieces"
            :key="piece.id"
            :piece="piece"
            :is-selected="isSelectedPiece(piece)"
            :can-move="canPieceMove(piece)"
            :get-piece-svg="getPieceSvg"
            :get-piece-class="getPieceClass"
            :get-piece-wrapper-class="getPieceWrapperClass"
            :get-piece-style="getPieceStyle"
            :handle-piece-click="handlePieceClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChessPiece from './ChessPiece.vue'
import type { BoardCell, ChessPiece as ChessPieceType } from '@/types/chess'

// ===== Props =====
interface Props {
  boardCells: BoardCell[][]
  isSelectedPiece: (piece: ChessPieceType) => boolean
  canPieceMove: (piece: ChessPieceType) => boolean
  getPieceCellPosition: (rowIndex: number, colIndex: number) => Record<string, string>
  getPieceSvg: (piece: ChessPieceType) => string
  getPieceClass: (piece: ChessPieceType) => string[]
  getPieceWrapperClass: (piece: ChessPieceType) => string[]
  getPieceStyle: (piece: ChessPieceType) => Record<string, string>
  handlePieceClick: (piece: ChessPieceType) => void
  handleEmptyCellClick: (cell: BoardCell) => void
  handleCellHover: (cell: BoardCell) => void
  handleCellLeave: (cell: BoardCell) => void
}

defineProps<Props>()
</script>

<style scoped>
.chess-pieces-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  pointer-events: none; /* 让空白区域的点击穿透 */
}

.pieces-row {
  display: contents;
}

.pieces-cell {
  pointer-events: auto; /* 恢复格子的点击事件 */
}

.pieces-stack {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>