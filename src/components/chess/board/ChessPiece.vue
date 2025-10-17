<template>
  <div
    class="piece-wrapper"
    :class="[
      ...getPieceWrapperClass(piece),
      { 'can-move': canMove }
    ]"
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

    <!-- 可移动指示器（发光圆环） -->
    <div 
      v-if="canMove && !isSelected"
      class="movable-indicator"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { ChessPiece } from '@/types/chess'
import { usePieceAnimation } from '../composables/usePieceAnimation'

// ===== Props =====
interface Props {
  piece: ChessPiece
  isSelected: boolean
  canMove: boolean  // 新增:是否可移动
  getPieceSvg: (piece: ChessPiece) => string
  getPieceClass: (piece: ChessPiece) => string[]
  getPieceWrapperClass: (piece: ChessPiece) => string[]
  getPieceStyle: (piece: ChessPiece) => Record<string, string>
  handlePieceClick: (piece: ChessPiece) => void
}

const props = defineProps<Props>()

// ===== 动画支持 =====
const pieceElement = ref<HTMLElement | null>(null)
const { animateJump } = usePieceAnimation()

// 监听棋子位置变化,触发动画
watch(
  () => props.piece.position,
  (newPos, oldPos) => {
    if (
      pieceElement.value &&
      oldPos &&
      newPos &&
      (oldPos.row !== newPos.row || oldPos.col !== newPos.col)
    ) {
      // 位置改变时触发跳跃动画
      animateJump(props.piece.id, pieceElement.value)
    }
  },
  { deep: true }
)

// 组件挂载时将 DOM 引用保存到 ref
onMounted(() => {
  // pieceElement 会通过模板 ref 自动绑定
})
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

/* 可移动棋子 - 移除浮动动画，只保留高亮和指示器 */
.piece-wrapper.can-move {
  cursor: pointer;
}

.piece-wrapper.can-move:hover {
  transform: scale(1.15);
}

.piece-wrapper.selected {
  z-index: 100;
}

/* 棋子图片基础样式 */
.piece-svg {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: all 0.4s ease;
  pointer-events: none;
}

/* 玩家1（蓝色）- 非活跃状态（稍微灰暗，但仍可见原色） */
.piece-wrapper.piece-player-1 .piece-svg {
  filter: brightness(0.75) saturate(0.8);
  opacity: 0.65;
  transition: all 0.3s ease;
}

/* 玩家2（红色）- 非活跃状态（稍微灰暗，但仍可见原色） */
.piece-wrapper.piece-player-2 .piece-svg {
  filter: brightness(0.75) saturate(0.8);
  opacity: 0.65;
  transition: all 0.3s ease;
}

/* 玩家1高亮 - 当前回合（正常显示，无辉光） */
.piece-svg.player-1-highlight {
  filter: brightness(1) saturate(1) !important;
  opacity: 1 !important;
}

/* 玩家2高亮 - 当前回合（正常显示，无辉光） */
.piece-svg.player-2-highlight {
  filter: brightness(1) saturate(1) !important;
  opacity: 1 !important;
}

/* 可移动棋子 - 增强高亮 */
.piece-wrapper.can-move .piece-svg {
  filter: brightness(1.2) saturate(1.3) drop-shadow(0 0 8px rgba(255, 215, 0, 0.6)) !important;
  opacity: 1 !important;
}

/* 可移动指示器（发光圆环） */
.movable-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 130%;
  height: 130%;
  border: 3px solid;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
  animation: movableGlow 2s ease-in-out infinite;
}

/* 玩家1的可移动指示器 - 蓝色 */
.piece-wrapper.piece-player-1.can-move .movable-indicator {
  border-color: #2196f3;
  box-shadow: 0 0 15px rgba(33, 150, 243, 0.6),
              inset 0 0 15px rgba(33, 150, 243, 0.3);
}

/* 玩家2的可移动指示器 - 红色 */
.piece-wrapper.piece-player-2.can-move .movable-indicator {
  border-color: #f44336;
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.6),
              inset 0 0 15px rgba(244, 67, 54, 0.3);
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

/* 可移动指示器发光动画 */
@keyframes movableGlow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.15);
    opacity: 1;
  }
}
</style>