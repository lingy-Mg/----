<template>
  <div
    class="piece-wrapper"
    :class="getPieceWrapperClass(piece)"
    @click.stop="handlePieceClick(piece)"
  >
    <img
      :src="getPieceSvg(piece)"
      :alt="`Piece ${piece.shapeId}`"
      class="piece-svg"
      :class="getPieceClass(piece)"
      :style="getPieceStyle(piece)"
      draggable="false"
    />
    
    <!-- 选中指示器 -->
    <div 
      v-if="isSelected"
      class="selection-indicator"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { ChessPiece } from '@/types/chess'

// ===== Props =====
interface Props {
  piece: ChessPiece
  isSelected: boolean
  getPieceSvg: (piece: ChessPiece) => string
  getPieceClass: (piece: ChessPiece) => string[]
  getPieceWrapperClass: (piece: ChessPiece) => string[]
  getPieceStyle: (piece: ChessPiece) => Record<string, string>
  handlePieceClick: (piece: ChessPiece) => void
}

defineProps<Props>()
</script>

<style scoped>
.piece-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.piece-wrapper:hover {
  transform: scale(1.05);
}

.piece-wrapper.selected {
  z-index: 100;
}

/* 玩家特定样式 */
.piece-wrapper.piece-player-1 .piece-svg {
  filter: drop-shadow(0 0 8px rgba(33, 150, 243, 0.6));
}

.piece-wrapper.piece-player-2 .piece-svg {
  filter: drop-shadow(0 0 8px rgba(244, 67, 54, 0.6));
}

/* 棋子图片样式 */
.piece-svg {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: all 0.3s ease;
  pointer-events: none;
}

/* 玩家高亮动画（只对当前回合玩家生效） */
.piece-svg.player-1-highlight {
  animation: pulse-blue 2s ease-in-out infinite;
}

.piece-svg.player-2-highlight {
  animation: pulse-red 2s ease-in-out infinite;
}

@keyframes pulse-blue {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(33, 150, 243, 0.6)) brightness(1);
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(33, 150, 243, 0.9)) brightness(1.2);
  }
}

@keyframes pulse-red {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(244, 67, 54, 0.6)) brightness(1);
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(244, 67, 54, 0.9)) brightness(1.2);
  }
}

/* 选中指示器 */
.selection-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  border: 3px solid #ffc107;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
  animation: selection-pulse 1.5s ease-in-out infinite;
}

@keyframes selection-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
}
</style>