<template>
  <div class="chess-game-container">
    <!-- 游戏棋盘区域 -->
    <div class="game-board-section">
      <!-- 上方玩家指示器 (玩家1在顶部) -->
      <div
        class="board-player-indicator top"
        :class="{ active: currentPlayer === 1, 'has-winner': !!winner }"
      >
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
        <div class="chess-board" :style="boardStyle" aria-label="棋盘">
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
                (rowIndex + colIndex) % 2 === 1 ? 'board-cell--dark' : 'board-cell--light',
                isCellClickable(cell, rowIndex, colIndex) ? 'clickable' : ''
              ]"
              @click="handleCellClick(cell)"
              :title="cellTooltip(cell, rowIndex, colIndex)"
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
                    draggable="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下方玩家指示器 (玩家2在底部) -->
      <div
        class="board-player-indicator bottom"
        :class="{ active: currentPlayer === 2, 'has-winner': !!winner }"
      >
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
          <button
            @click="handleRotate"
            :disabled="!selectedCell || !!winner"
            class="btn-rotate"
            title="旋转棋子 (R 键)"
          >
            <span class="rotate-icon">🔄</span> 旋转
          </button>
          <button @click="handlePass" :disabled="!!winner" class="btn-secondary" title="结束本回合">
            跳过
          </button>
          <button
            @click="handleUndo"
            :disabled="moveHistory.length === 0 || !!winner"
            class="btn-secondary"
            title="悔棋一步"
          >
            悔棋
          </button>
          <button @click="handleReset" class="btn-primary" title="重新开始">
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

        <div v-if="winner" class="winner-announcement" aria-live="polite">
          🎉 玩家 {{ winner }} 获胜！
        </div>
      </div>
    </div>

    <!-- 规则面板 -->
    <div class="rules-panel" :class="{ collapsed: !showRules }">
      <div class="rules-header">
        <h3>🎮 游戏规则</h3>
        <button class="rules-toggle" @click="showRules = !showRules" :aria-expanded="showRules">
          {{ showRules ? '收起' : '展开' }}
        </button>
      </div>

      <div class="rules-content" v-show="showRules">
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
            <li>
              <strong>相邻移动（距离 = 1格）</strong>：
              <ul class="compact">
                <li>✅ 移动到相邻8格之一后，可以选择是否旋转</li>
                <li>⚠️ 旋转后本次移动结束，切换回合</li>
              </ul>
            </li>
            <li>
              <strong>远距离移动（距离 &gt; 1格）</strong>：
              <ul class="compact">
                <li>❌ 不能旋转，只能移动</li>
                <li>✅ 适合快速占领位置</li>
              </ul>
            </li>
            <li>
              <strong>鸟类棋子特权</strong>：
              <ul class="compact">
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
            <li>点击“跳过”按钮可提前结束回合</li>
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
/**
 * UI 改进说明（要点）：
 * 1) 引入 CSS 变量统一主题色，增强一致性与可维护性。
 * 2) 棋盘加入浅色/深色交错格（棋盘格效果），可读性更好。
 * 3) 仅当格子“可移动”或“含当前玩家顶层棋子”时显示手型光标，避免误导。
 * 4) 控件与指示器视觉层级与阴影优化，提升层次与对比。
 * 5) 规则面板支持折叠（不影响原逻辑），小屏下更友好。
 * 6) 添加 prefers-reduced-motion 支持，降低动效对敏感用户的影响。
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { GameEngine } from '@/classes/chess/GameEngine'
import { BOARD_SIZE, BOARD_DISPLAY } from '@/constants/chess/board'
import { getPieceShape } from '@/constants/chess/pieces'
import type { Player, Position, ChessPiece, BoardCell, Move } from '@/types/chess'

// 游戏引擎实例
const gameEngine = ref<GameEngine | null>(null)

// 交互状态
const selectedCell = ref<Position | null>(null)
const possibleMoves = ref<Position[]>([])
const showRules = ref(true) // 规则面板折叠开关

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
  // 仍沿用常量中的单元格尺寸，但外层 CSS 增强了自适应
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

// ===== 方法（UI/交互） =====

/**
 * 计算格子样式类
 * @param cell 棋盘格
 */
function getCellClass(cell: BoardCell): string[] {
  const classes: string[] = []

  if (selectedCell.value?.row === cell.position.row && selectedCell.value?.col === cell.position.col) {
    classes.push('selected')
  }

  // 是否为可移动位置
  const isPossibleMove = possibleMoves.value.some(
    (pos: Position) => pos.row === cell.position.row && pos.col === cell.position.col
  )
  if (isPossibleMove) {
    classes.push('possible-move')
  }

  // 起始/目标区域弱化为描边提示，避免与棋盘底色冲突
  if (cell.isStartZone.player1) classes.push('start-zone-player1')
  if (cell.isStartZone.player2) classes.push('start-zone-player2')
  if (cell.isFinishZone.player1) classes.push('finish-zone-player1')
  if (cell.isFinishZone.player2) classes.push('finish-zone-player2')

  return classes
}

/**
 * 检测某格子是否应显示“可点击”手型光标
 * 条件：
 * - 该格子为 possible move；或
 * - 该格子顶层棋子属于当前玩家
 */
function isCellClickable(cell: BoardCell, _rowIndex: number, _colIndex: number): boolean {
  const isPossibleMove = possibleMoves.value.some(
    (pos: Position) => pos.row === cell.position.row && pos.col === cell.position.col
  )
  if (isPossibleMove) return true

  if (cell.pieces.length > 0) {
    const topPiece = cell.pieces[cell.pieces.length - 1]
    return topPiece?.player === currentPlayer.value
  }
  return false
}

/**
 * 鼠标提示文案
 */
function cellTooltip(cell: BoardCell, _rowIndex: number, _colIndex: number): string {
  const isPossibleMove = possibleMoves.value.some(
    (pos: Position) => pos.row === cell.position.row && pos.col === cell.position.col
  )
  if (isPossibleMove) return '可移动到此格'
  if (cell.pieces.length > 0) {
    const topPiece = cell.pieces[cell.pieces.length - 1]
    if (topPiece?.player === currentPlayer.value) return '选择此棋子'
  }
  return ' '
}

/**
 * 棋子外层包装样式类
 */
function getPieceWrapperClass(piece: ChessPiece): string[] {
  const classes: string[] = []
  classes.push(`player${piece.player}-wrapper`)
  if (piece.player === currentPlayer.value) classes.push('current-player-wrapper')
  return classes
}

/**
 * 棋子图片样式类
 */
function getPieceClass(piece: ChessPiece): string[] {
  const classes: string[] = []
  classes.push(`player${piece.player}`)
  if (piece.isBird) classes.push('bird')
  if (piece.player === currentPlayer.value) classes.push('current-player-piece')
  return classes
}

/**
 * 棋子内联样式（旋转）
 */
function getPieceStyle(piece: ChessPiece): Record<string, string> {
  return {
    transform: `rotate(${piece.rotation}deg)`
  }
}

/**
 * 获取棋子 SVG 资源
 */
function getPieceSvg(piece: ChessPiece): string {
  const shape = getPieceShape(piece.shapeId)
  return shape.svgPath
}

/**
 * 计算可移动位置
 */
function calculatePossibleMoves(piece: ChessPiece): void {
  if (!gameEngine.value) {
    possibleMoves.value = []
    return
  }
  const moves = gameEngine.value.getPossibleMovesForPiece(piece)
  possibleMoves.value = moves.map((move: Move) => move.to)
}

/**
 * 点击格子处理
 */
function handleCellClick(cell: BoardCell): void {
  if (winner.value || !gameEngine.value) return

  const pos = cell.position

  // 无选中 && 点到当前玩家顶层棋子 -> 选中并展示可移动
  if (!selectedCell.value && cell.pieces.length > 0) {
    const topPiece = cell.pieces[cell.pieces.length - 1]
    if (topPiece && topPiece.player === currentPlayer.value) {
      selectedCell.value = pos
      calculatePossibleMoves(topPiece)
    }
    return
  }

  // 已有选中
  if (selectedCell.value) {
    // 点击同格 -> 取消
    if (selectedCell.value.row === pos.row && selectedCell.value.col === pos.col) {
      selectedCell.value = null
      possibleMoves.value = []
      return
    }

    // 取当前选中格子的顶层棋子
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

    const success = gameEngine.value.executeMove(move)
    if (success) {
      selectedCell.value = null
      possibleMoves.value = []
    } else {
      // 失败则尝试选中新格子的当前玩家棋子
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

/**
 * 跳过回合
 */
function handlePass(): void {
  if (gameEngine.value && !winner.value) {
    gameEngine.value.pass()
    selectedCell.value = null
    possibleMoves.value = []
  }
}

/**
 * 悔棋
 */
function handleUndo(): void {
  if (gameEngine.value && moveHistory.value.length > 0 && !winner.value) {
    gameEngine.value.undo()
    selectedCell.value = null
    possibleMoves.value = []
  }
}

/**
 * 重置游戏
 */
function handleReset(): void {
  if (gameEngine.value) {
    gameEngine.value.startGame()
    selectedCell.value = null
    possibleMoves.value = []
  }
}

/**
 * 旋转棋子
 */
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

/**
 * 键盘事件
 */
function handleKeyPress(event: KeyboardEvent): void {
  if (winner.value) return
  switch (event.key.toLowerCase()) {
    case 'r':
      handleRotate()
      break
    case 'escape':
      selectedCell.value = null
      possibleMoves.value = []
      break
  }
}

// 绑定与解绑键盘事件
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
/* =========================================
   主题变量（统一色板与尺寸）
   ========================================= */
.chess-game-container {
  /* 主色（玩家1/玩家2） */
  --p1: #1e88e5;            /* 蓝：玩家1主色 */
  --p1-strong: #1565c0;
  --p1-glow: rgba(33, 150, 243, 0.6);

  --p2: #e53935;            /* 红：玩家2主色 */
  --p2-strong: #c62828;
  --p2-glow: rgba(244, 67, 54, 0.6);

  /* 辅助与状态色 */
  --accent: #7e57c2;        /* 旋转按钮渐变一端 */
  --accent-2: #5c6bc0;      /* 旋转按钮渐变另一端 */
  --success: #43a047;
  --warning: #fdd835;
  --gold: #ffd700;

  /* 中性色 */
  --bg: #f7f8fa;
  --panel-bg: #ffffff;
  --text: #333;
  --text-weak: #666;
  --muted: #e0e0e0;

  /* 棋盘与格子 */
  --board-bg: #f0f1f5;
  --cell-light: #fbfdff;
  --cell-dark: #e9edf3;
  --cell-border: #ffffff;

  /* 布局尺寸 */
  --radius: 12px;
  --gap-lg: 2rem;
  --gap-md: 1rem;
  --gap-sm: 0.5rem;

  display: flex;
  gap: var(--gap-lg);
  padding: var(--gap-lg);
  min-height: 100vh;
  align-items: flex-start;
  background: var(--bg);
}

/* =========================================
   布局：棋盘区域
   ========================================= */
.game-board-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-md);
  min-width: 320px;
}

/* 玩家指示器（顶部/底部） */
.board-player-indicator {
  width: 100%;
  max-width: 520px;
  padding: 0.9rem 1.25rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #eaeaea 100%);
  border-radius: var(--radius);
  opacity: 0.6;
  transition: all 0.3s ease;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.board-player-indicator.active {
  opacity: 1;
  transform: translateY(0);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
}

.board-player-indicator.top.active {
  background: linear-gradient(135deg, #eaf4ff 0%, #d8ecff 100%);
  border: 2px solid var(--p1);
}

.board-player-indicator.bottom.active {
  background: linear-gradient(135deg, #ffecee 0%, #ffd9dc 100%);
  border: 2px solid var(--p2);
}

.board-player-indicator.has-winner {
  opacity: 0.35;
}

.board-player-indicator.has-winner.active {
  opacity: 1;
}

.player-badge {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
}

.player-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
}

.player-icon.player1 {
  background: linear-gradient(135deg, var(--p1) 0%, var(--p1-strong) 100%);
}
.player-icon.player2 {
  background: linear-gradient(135deg, var(--p2) 0%, var(--p2-strong) 100%);
}

.player-number {
  font-family: 'Arial Black', sans-serif;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.player-label {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
}

.turn-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: linear-gradient(135deg, var(--success) 0%, #45a049 100%);
  color: #fff;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(67, 160, 71, 0.35);
}

.winner-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: linear-gradient(135deg, var(--gold) 0%, #ffef79 100%);
  color: #333;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.35);
}

/* =========================================
   棋盘
   ========================================= */
.chess-board-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: auto;
  padding: 0.25rem;
}

.chess-board {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
  border: 1px solid #e8ebf1;
}

.board-row {
  display: contents;
}

.board-cell {
  position: relative;
  background-color: var(--cell-light);
  border: 2px solid var(--cell-border);
  transition: background-color 0.2s ease, transform 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

/* 交错底色（棋盘格） */
.board-cell--dark {
  background-color: var(--cell-dark);
}
.board-cell--light {
  background-color: var(--cell-light);
}

/* 鼠标交互：仅可点击的格子才显示指针 */
.board-cell.clickable {
  cursor: pointer;
}
.board-cell:not(.clickable) {
  cursor: default;
}

.board-cell:hover.clickable {
  transform: translateY(-1px);
}

.board-cell.selected {
  outline: 3px solid var(--warning);
  outline-offset: -3px;
}

/* 可移动位置提示：采用环形描边，避免遮挡棋子 */
.board-cell.possible-move::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 10px;
  border: 3px dashed rgba(67, 160, 71, 0.85);
  box-shadow: inset 0 0 0 2px rgba(67, 160, 71, 0.15);
  pointer-events: none;
}

/* 起始/目标区域：弱化为边框高亮，减少底色干扰 */
.board-cell.start-zone-player1 {
  box-shadow: inset 0 0 0 2px rgba(30, 136, 229, 0.45);
}
.board-cell.start-zone-player2 {
  box-shadow: inset 0 0 0 2px rgba(229, 57, 53, 0.45);
}
.board-cell.finish-zone-player1 {
  box-shadow: inset 0 0 0 2px rgba(76, 175, 80, 0.35);
}
.board-cell.finish-zone-player2 {
  box-shadow: inset 0 0 0 2px rgba(156, 39, 176, 0.35);
}

/* 棋子容器 */
.pieces-stack {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

/* 棋子包装（柔和发光背景） */
.piece-wrapper {
  width: 88%;
  height: 88%;
  border-radius: 16px;
  display: grid;
  place-items: center;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 70%, transparent 100%);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.piece-wrapper.player1-wrapper {
  box-shadow:
    0 0 0 2px rgba(30, 136, 229, 0.25) inset,
    0 10px 20px rgba(30, 136, 229, 0.12);
}
.piece-wrapper.player2-wrapper {
  box-shadow:
    0 0 0 2px rgba(229, 57, 53, 0.25) inset,
    0 10px 20px rgba(229, 57, 53, 0.12);
}

/* 当前玩家的棋子更显眼 */
.piece-wrapper.current-player-wrapper {
  transform: translateY(-1px);
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.85) inset,
    0 0 24px rgba(0, 0, 0, 0.08);
}

.piece-svg {
  width: 74%;
  height: 74%;
  object-fit: contain;
  transition: transform 0.2s ease, filter 0.2s ease;
  pointer-events: none;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  border-radius: 10px;
  will-change: transform, filter;
}

.piece-svg.player1 {
  filter: drop-shadow(0 1px 3px rgba(30, 136, 229, 0.5))
          drop-shadow(0 0 10px rgba(30, 136, 229, 0.28));
}
.piece-svg.player2 {
  filter: drop-shadow(0 1px 3px rgba(229, 57, 53, 0.5))
          drop-shadow(0 0 10px rgba(229, 57, 53, 0.28));
}

.piece-svg.current-player-piece {
  filter: drop-shadow(0 0 14px rgba(0, 0, 0, 0.18))
          drop-shadow(0 0 22px rgba(0, 0, 0, 0.08));
}

/* =========================================
   控制区
   ========================================= */
.game-controls {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 520px;
}

.player-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  background: var(--panel-bg);
  border-radius: var(--radius);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #eef1f6;
}

.player-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  color: var(--text-weak);
  background: #fafbff;
  border: 1px solid #f0f3f9;
  opacity: 0.7;
}

.player-indicator.active {
  opacity: 1;
  background: #fffbe6;
  border-color: #ffe58f;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.indicator-dot.player1 { background: var(--p1); }
.indicator-dot.player2 { background: var(--p2); }

.turn-display {
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--text);
}

.control-buttons {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.control-buttons button {
  padding: 0.75rem 1rem;
  font-size: 0.98rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease, opacity 0.2s ease;
  font-weight: 600;
  outline: none;
}

.btn-primary {
  background: var(--p1);
  color: #fff;
  box-shadow: 0 8px 18px rgba(30, 136, 229, 0.22);
}
.btn-primary:hover:not(:disabled) {
  background: var(--p1-strong);
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f6f8fc;
  color: var(--text);
  border: 1px solid #eef1f6;
}
.btn-secondary:hover:not(:disabled) {
  background: #eef2f8;
  transform: translateY(-1px);
}

.btn-rotate {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  color: #fff;
  font-weight: 800;
  box-shadow: 0 10px 22px rgba(94, 109, 203, 0.28);
}
.btn-rotate:hover:not(:disabled) {
  transform: translateY(-1px) rotate(-2deg);
}
.btn-rotate .rotate-icon {
  display: inline-block;
  transition: transform 0.24s ease;
}
.btn-rotate:hover:not(:disabled) .rotate-icon {
  transform: rotate(180deg);
}

.control-buttons button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.keyboard-hints {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  padding: 0.5rem 0.65rem;
  background: #f9fbff;
  border: 1px solid #eef1f6;
  border-radius: 10px;
  color: var(--text-weak);
}
.hint-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.hint-item kbd {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #fff;
  border: 2px solid #e5e7ef;
  border-bottom-width: 3px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-weight: 800;
  font-size: 0.85rem;
  color: #2c3e50;
  box-shadow: 0 2px 0 #cbd2e4;
}

.winner-announcement {
  padding: 0.9rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, var(--accent-2) 0%, var(--accent) 100%);
  color: white;
  border-radius: var(--radius);
  font-size: 1.08rem;
  font-weight: 800;
  box-shadow: 0 10px 22px rgba(94, 109, 203, 0.28);
}

/* =========================================
   规则面板
   ========================================= */
.rules-panel {
  width: 420px;
  min-width: 360px;
  background: var(--panel-bg);
  border-radius: var(--radius);
  padding: 1.25rem 1.25rem 1.5rem;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.08);
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid #eef1f6;
  position: sticky;
  top: 1.25rem;
}

.rules-panel.collapsed {
  max-height: max-content;
}

.rules-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  border-bottom: 2px solid var(--p1);
  padding-bottom: 0.5rem;
}
.rules-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.2rem;
}
.rules-toggle {
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #e6e9f2;
  background: #f7f9ff;
  color: #3b4a6b;
  font-weight: 700;
  cursor: pointer;
}
.rules-toggle:hover {
  background: #eff3ff;
}

.rules-content {
  color: var(--text-weak);
  line-height: 1.8;
  font-size: 1rem;
  margin-top: 0.25rem;
  overflow-y: auto;
  max-height: calc(90vh - 4.5rem);
  padding-right: 0.25rem;
}

.rule-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.1rem;
  border-bottom: 1px solid #f1f3f8;
}
.rule-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.rule-section h4 {
  margin: 0 0 0.7rem 0;
  color: var(--p1);
  font-size: 1.05rem;
  font-weight: 700;
}
.rule-section ul {
  margin: 0.4rem 0;
  padding-left: 1.35rem;
}
.rule-section ul.compact { padding-left: 1.2rem; }
.rule-section li { margin: 0.35rem 0; }
.rule-section ol {
  margin: 0.4rem 0;
  padding-left: 1.35rem;
  counter-reset: item;
}
.rule-section ol li { margin: 0.35rem 0; }

.rule-section code {
  background: #f5f7fb;
  padding: 2px 6px;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #e91e63;
  font-weight: 700;
}
.rule-section p { margin: 0.5rem 0; }
.rule-section p.tip {
  background: #fff9e6;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border-left: 3px solid #ffd666;
  margin-top: 0.6rem;
  font-size: 0.92rem;
}

.tip-box {
  background: linear-gradient(135deg, #eef6ff 0%, #f6efff 100%);
  padding: 1rem;
  border-radius: 10px;
  border: none;
}
.tip-box p {
  margin: 0.3rem 0;
}
.tip-box strong {
  color: var(--p1);
}

/* 滚动条样式 */
.rules-content::-webkit-scrollbar { width: 8px; }
.rules-content::-webkit-scrollbar-track { background: #f4f6fb; border-radius: 10px; }
.rules-content::-webkit-scrollbar-thumb { background: #cdd6ec; border-radius: 10px; }
.rules-content::-webkit-scrollbar-thumb:hover { background: #b8c4e6; }

/* =========================================
   响应式
   ========================================= */
@media (max-width: 1100px) {
  .chess-game-container {
    flex-direction: column;
    align-items: stretch;
  }
  .rules-panel {
    position: relative;
    top: 0;
    width: 100%;
    min-width: 0;
    order: -1;
  }
  .game-board-section {
    order: 0;
  }
}

/* =========================================
   降低动效（系统偏好）
   ========================================= */
@media (prefers-reduced-motion: reduce) {
  .board-player-indicator,
  .piece-wrapper,
  .piece-svg,
  .control-buttons button,
  .btn-rotate .rotate-icon {
    transition: none !important;
    animation: none !important;
  }
}
</style>
