import type { PuzzlePiece, BoardCell, GameStatus } from '@/types/puzzle'

/**
 * 拼图棋盘管理类
 * 负责管理棋盘状态、拼图块的放置和移动
 */
export class PuzzleBoard {
  private board: BoardCell[]
  private pieces: PuzzlePiece[]
  private boardSize: number
  private status: GameStatus

  constructor(size: number = 4) {
    this.boardSize = size
    this.board = []
    this.pieces = []
    this.status = 'idle' as GameStatus
    this.initBoard()
    this.initPieces()
  }

  /**
   * 初始化棋盘
   */
  private initBoard(): void {
    const totalCells = this.boardSize * this.boardSize
    this.board = Array.from({ length: totalCells }, (_, index) => ({
      position: index,
      piece: null,
      isDropZone: true
    }))
  }

  /**
   * 初始化拼图块
   */
  private initPieces(): void {
    this.pieces = Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      currentPosition: -1, // -1 表示在待选区域
      isPlaced: false
    }))
  }

  /**
   * 获取棋盘
   */
  getBoard(): BoardCell[] {
    return this.board
  }

  /**
   * 获取所有拼图块
   */
  getPieces(): PuzzlePiece[] {
    return this.pieces
  }

  /**
   * 获取待选区域的拼图块（未放置的）
   */
  getAvailablePieces(): PuzzlePiece[] {
    return this.pieces.filter(piece => !piece.isPlaced)
  }

  /**
   * 放置拼图块到指定位置
   */
  placePiece(pieceId: number, position: number): boolean {
    const piece = this.pieces.find(p => p.id === pieceId)
    const cell = this.board[position]

    if (!piece || !cell || !cell.isDropZone) {
      return false
    }

    // 如果该位置已有拼图块，先移除
    if (cell.piece) {
      this.removePiece(position)
    }

    // 如果拼图块已在其他位置，先从那里移除
    if (piece.isPlaced && piece.currentPosition >= 0 && piece.currentPosition < this.board.length) {
      const previousCell = this.board[piece.currentPosition]
      if (previousCell) {
        previousCell.piece = null
      }
    }

    // 放置拼图块
    piece.currentPosition = position
    piece.isPlaced = true
    cell.piece = piece

    this.checkWinCondition()
    return true
  }

  /**
   * 从指定位置移除拼图块
   */
  removePiece(position: number): boolean {
    const cell = this.board[position]
    if (!cell || !cell.piece) {
      return false
    }

    const piece = cell.piece
    piece.currentPosition = -1
    piece.isPlaced = false
    cell.piece = null

    return true
  }

  /**
   * 移动拼图块
   */
  movePiece(fromPosition: number, toPosition: number): boolean {
    const fromCell = this.board[fromPosition]
    if (!fromCell || !fromCell.piece) {
      return false
    }

    const piece = fromCell.piece
    return this.placePiece(piece.id, toPosition)
  }

  /**
   * 检查是否获胜
   */
  private checkWinCondition(): void {
    // 检查上方4个位置是否按顺序放置了1-4号拼图
    const topRow = this.board.slice(0, 4)
    const isTopRowComplete = topRow.every((cell, index) => 
      cell.piece !== null && cell.piece.id === index + 1
    )

    if (isTopRowComplete) {
      this.status = 'won' as GameStatus
    } else if (this.pieces.every(p => p.isPlaced)) {
      this.status = 'playing' as GameStatus
    } else {
      this.status = 'idle' as GameStatus
    }
  }

  /**
   * 获取游戏状态
   */
  getStatus(): GameStatus {
    return this.status
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.initBoard()
    this.initPieces()
    this.status = 'idle' as GameStatus
  }

  /**
   * 获取指定位置的拼图块
   */
  getPieceAt(position: number): PuzzlePiece | null {
    return this.board[position]?.piece || null
  }

  /**
   * 获取棋盘大小
   */
  getBoardSize(): number {
    return this.boardSize
  }
}
