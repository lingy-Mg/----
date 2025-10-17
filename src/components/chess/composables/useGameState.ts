import { ref, computed, reactive } from 'vue'
import type { GameEngine } from '@/classes/chess/GameEngine'
import type { ChessPiece, Position, Move, PlayerStats } from '@/types/chess'

/**
 * 游戏状态管理组合式函数
 */
export function useGameState() {
  // ===== 响应式状态 =====
  const gameEngine = ref<GameEngine | null>(null)
  const selectedCell = ref<Position | null>(null)
  const possibleMoves = ref<Position[]>([])
  const hoveredCell = ref<Position | null>(null)

  // ===== 计算属性 =====
  const boardCells = computed(() => {
    return gameEngine.value?.getBoard().getCells() || []
  })

  const currentPlayer = computed(() => {
    return gameEngine.value?.getGameState().currentPlayer || 1
  })

  const winner = computed(() => {
    return gameEngine.value?.getGameState().winner || null
  })

  const moveHistory = computed(() => {
    return gameEngine.value?.getGameState().moveHistory || []
  })

  const player1Stats = computed((): PlayerStats => {
    return gameEngine.value?.getGameState().player1Stats || {
      totalMoves: 0,
      totalUndos: 0,
      consecutiveUndos: 0,
      totalPasses: 0
    }
  })

  const player2Stats = computed((): PlayerStats => {
    return gameEngine.value?.getGameState().player2Stats || {
      totalMoves: 0,
      totalUndos: 0,
      consecutiveUndos: 0,
      totalPasses: 0
    }
  })

  const canUndo = computed(() => {
    return (gameEngine.value?.getGameState().moveHistory.length || 0) > 0
  })

  // ===== 游戏操作方法 =====
  
  /**
   * 初始化游戏引擎
   */
  function initializeGame(engine: GameEngine) {
    gameEngine.value = engine
  }

  /**
   * 选中棋子
   */
  function selectPiece(piece: ChessPiece) {
    if (!gameEngine.value || piece.player !== currentPlayer.value) return
    
    const pos = piece.position
    if (!pos) return
    
    selectedCell.value = pos
    calculatePossibleMoves(piece)
  }

  /**
   * 计算可能的移动
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
   * 执行移动
   */
  function executeMove(piece: ChessPiece, to: Position, rotation?: number): boolean {
    if (!gameEngine.value || !selectedCell.value) return false

    const move: Move = {
      piece,
      from: selectedCell.value,
      to,
      steps: Math.max(
        Math.abs(to.row - selectedCell.value.row), 
        Math.abs(to.col - selectedCell.value.col)
      ),
      needRotation: !!rotation,
      newRotation: rotation as any, // 临时类型断言
      canFit: true
    }

    const success = gameEngine.value.executeMove(move)
    if (success) {
      clearSelection()
    }
    return success
  }

  /**
   * 清除选中状态
   */
  function clearSelection() {
    selectedCell.value = null
    possibleMoves.value = []
  }

  /**
   * 重置游戏
   */
  function resetGame() {
    if (gameEngine.value) {
      gameEngine.value.reset()
      clearSelection()
    }
  }

  /**
   * 悔棋
   */
  function undoMove() {
    if (gameEngine.value) {
      gameEngine.value.undo()
      clearSelection()
    }
  }

  /**
   * 跳过回合
   */
  function skipTurn() {
    if (gameEngine.value) {
      gameEngine.value.pass()
      clearSelection()
    }
  }

  /**
   * 旋转棋子
   */
  function rotatePiece(): boolean {
    if (!gameEngine.value || !selectedCell.value) return false

    const cell = gameEngine.value.getBoard().getCell(selectedCell.value)
    if (!cell || cell.pieces.length === 0) return false

    const piece = cell.pieces[cell.pieces.length - 1]
    if (!piece) return false
    
    return gameEngine.value.rotatePiece(piece)
  }

  // ===== 辅助方法 =====

  /**
   * 检查是否为选中的棋子
   */
  function isSelectedPiece(piece: ChessPiece): boolean {
    if (!selectedCell.value || !piece.position) return false
    return (
      selectedCell.value.row === piece.position.row &&
      selectedCell.value.col === piece.position.col
    )
  }

  /**
   * 检查是否为可移动位置
   */
  function isPossibleMove(position: Position): boolean {
    return possibleMoves.value.some(pos => 
      pos.row === position.row && pos.col === position.col
    )
  }

  /**
   * 设置悬停格子
   */
  function setHoveredCell(position: Position | null) {
    hoveredCell.value = position
  }

  return {
    // 状态
    gameEngine,
    selectedCell,
    possibleMoves,
    hoveredCell,
    
    // 计算属性
    boardCells,
    currentPlayer,
    winner,
    moveHistory,
    player1Stats,
    player2Stats,
    canUndo,
    
    // 方法
    initializeGame,
    selectPiece,
    calculatePossibleMoves,
    executeMove,
    clearSelection,
    resetGame,
    undoMove,
    skipTurn,
    rotatePiece,
    
    // 辅助方法
    isSelectedPiece,
    isPossibleMove,
    setHoveredCell
  }
}