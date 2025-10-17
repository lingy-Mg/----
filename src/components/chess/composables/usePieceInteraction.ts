import { computed } from 'vue'
import type { ChessPiece, Position, BoardCell } from '@/types/chess'
import { BOARD_DISPLAY } from '@/constants/chess/board'

/**
 * 棋子交互逻辑组合式函数
 */
export function usePieceInteraction(gameState: any, debugSettings: any) {
  // ===== 棋子样式计算 =====
  
  /**
   * 获取棋子 SVG 路径
   */
  function getPieceSvg(piece: ChessPiece): string {
    return `/SVG/资源 ${piece.shapeId}.svg`
  }

  /**
   * 获取棋子样式类
   */
  function getPieceClass(piece: ChessPiece): string[] {
    const classes: string[] = []
    
    // 玩家高亮（只有当前回合的玩家棋子才高亮）
    if (piece.player === gameState.currentPlayer.value) {
      classes.push(`player-${piece.player}-highlight`)
    }
    
    return classes
  }

  /**
   * 获取棋子包装器样式类
   */
  function getPieceWrapperClass(piece: ChessPiece): string[] {
    const classes: string[] = [`piece-player-${piece.player}`]
    
    if (gameState.isSelectedPiece(piece)) {
      classes.push('selected')
    }
    
    return classes
  }

  /**
   * 获取棋子样式（包括调试样式）
   */
  function getPieceStyle(piece: ChessPiece): Record<string, string> {
    const baseStyle = {
      transform: `rotate(${piece.rotation}deg)`,
      transformOrigin: 'center center'
    }

    // 合并调试样式
    const debugStyle = debugSettings.getPieceDebugStyle(piece.shapeId)
    
    // 合并变换
    if (debugStyle.transform) {
      const rotateMatch = baseStyle.transform.match(/rotate\([^)]+\)/)
      const scaleTranslateMatch = debugStyle.transform.match(/(scale\([^)]+\)\s*translate\([^)]+\))/)
      
      if (rotateMatch && scaleTranslateMatch) {
        baseStyle.transform = `${rotateMatch[0]} ${scaleTranslateMatch[1]}`
      }
    }

    return {
      ...baseStyle,
      ...debugStyle
    }
  }

  /**
   * 计算棋子格子的绝对位置（用于浮动层）
   */
  function getPieceCellPosition(rowIndex: number, colIndex: number): Record<string, string> {
    const cellSize = BOARD_DISPLAY.cellSize
    const gap = 2 // 格子间距，与CSS中的gap保持一致
    const padding = 10 // 背景棋盘的 padding，需要加上这个偏移
    
    return {
      position: 'absolute',
      left: `${padding + colIndex * (cellSize + gap)}px`,
      top: `${padding + rowIndex * (cellSize + gap)}px`,
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      pointerEvents: 'auto' // 允许棋子响应点��事件
    }
  }

  // ===== 预览相关 =====

  /**
   * 是否应该显示棋子预览
   */
  function shouldShowPiecePreview(cell: BoardCell): boolean {
    if (!gameState.hoveredCell.value || !gameState.selectedCell.value) return false
    
    // 只在悬停的可移动位置且为空格时显示预览
    return (
      cell.position.row === gameState.hoveredCell.value.row &&
      cell.position.col === gameState.hoveredCell.value.col &&
      cell.pieces.length === 0 &&
      gameState.isPossibleMove(cell.position)
    )
  }

  /**
   * 获取预览棋子的 SVG
   */
  function getPreviewPieceSvg(): string {
    if (!gameState.selectedCell.value || !gameState.gameEngine.value) return ''
    
    const cell = gameState.gameEngine.value.getBoard().getCell(gameState.selectedCell.value)
    if (!cell || cell.pieces.length === 0) return ''
    
    const piece = cell.pieces[cell.pieces.length - 1]
    return getPieceSvg(piece)
  }

  /**
   * 获取预览棋子的样式
   */
  function getPreviewPieceStyle(): Record<string, string> {
    if (!gameState.selectedCell.value || !gameState.gameEngine.value) return {}
    
    const cell = gameState.gameEngine.value.getBoard().getCell(gameState.selectedCell.value)
    if (!cell || cell.pieces.length === 0) return {}
    
    const topPiece = cell.pieces[cell.pieces.length - 1]
    return {
      transform: `rotate(${topPiece.rotation}deg)`,
      opacity: '0.5'  // 半透明预览效果
    }
  }

  // ===== 格子相关 =====

  /**
   * 计算格子样式类
   */
  function getCellClass(cell: BoardCell): string[] {
    const classes: string[] = []

    if (gameState.selectedCell.value?.row === cell.position.row && 
        gameState.selectedCell.value?.col === cell.position.col) {
      classes.push('selected')
    }

    if (gameState.isPossibleMove(cell.position)) {
      classes.push('possible-move')
    }

    return classes
  }

  /**
   * 格子提示文本
   */
  function cellTooltip(cell: BoardCell, rowIndex: number, colIndex: number): string {
    let tooltip = `格子 (${rowIndex}, ${colIndex})`
    
    if (cell.pieces.length > 0) {
      const topPiece = cell.pieces[cell.pieces.length - 1]
      if (topPiece) {
        tooltip += ` - 玩家 ${topPiece.player} 的棋子 ${topPiece.shapeId}`
      }
    } else {
      tooltip += ' - 空'
    }
    
    if (gameState.isPossibleMove(cell.position)) {
      tooltip += ' [可移动]'
    }
    
    return tooltip
  }

  // ===== 事件处理 =====

  /**
   * 处理格子悬停
   */
  function handleCellHover(cell: BoardCell) {
    gameState.setHoveredCell(cell.position)
  }

  /**
   * 处理格子离开
   */
  function handleCellLeave(cell: BoardCell) {
    gameState.setHoveredCell(null)
  }

  /**
   * 处理棋子点击
   */
  function handlePieceClick(piece: ChessPiece) {
    gameState.selectPiece(piece)
  }

  /**
   * 处理空位点击
   */
  function handleEmptyCellClick(cell: BoardCell) {
    if (gameState.winner.value || !gameState.gameEngine.value) return

    const pos = cell.position

    // 如果有选中的棋子，尝试移动
    if (gameState.selectedCell.value) {
      // 如果点击的是当前选中的位置，取消选中
      if (gameState.selectedCell.value.row === pos.row && 
          gameState.selectedCell.value.col === pos.col) {
        gameState.clearSelection()
        return
      }

      // 尝试移动到该位置
      const fromCell = gameState.gameEngine.value.getBoard().getCell(gameState.selectedCell.value)
      if (!fromCell || fromCell.pieces.length === 0) {
        gameState.clearSelection()
        return
      }
      
      const piece = fromCell.pieces[fromCell.pieces.length - 1]
      if (!piece) {
        gameState.clearSelection()
        return
      }

      // 执行移动
      gameState.executeMove(piece, pos)
    }
    // 如果点击空位且有该位置的棋子属于当前玩家，选中棋子
    else if (cell.pieces.length > 0) {
      const topPiece = cell.pieces[cell.pieces.length - 1]
      if (topPiece && topPiece.player === gameState.currentPlayer.value) {
        gameState.selectPiece(topPiece)
      }
    }
  }

  return {
    // 样式计算
    getPieceSvg,
    getPieceClass,
    getPieceWrapperClass,
    getPieceStyle,
    getPieceCellPosition,
    
    // 预览相关
    shouldShowPiecePreview,
    getPreviewPieceSvg,
    getPreviewPieceStyle,
    
    // 格子相关
    getCellClass,
    cellTooltip,
    
    // 事件处理
    handleCellHover,
    handleCellLeave,
    handlePieceClick,
    handleEmptyCellClick
  }
}