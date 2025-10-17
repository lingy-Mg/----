/**
 * GameEngine - Main Game Logic Controller
 * Manages game state, turns, and rule enforcement
 */

import type {
  GameState,
  GameConfig,
  GameMode,
  Player,
  ChessPiece,
  Move,
  Position,
  Rotation
} from '@/types/chess'
import { Player as PlayerEnum, GameMode as GameModeEnum, generatePieceId } from '@/types/chess'
import { Board } from './Board'
import { MoveValidator } from './MoveValidator'
import { EdgeMatcher } from './EdgeMatcher'
import { DEFAULT_GAME_CONFIG, getStartRows, getFinishRows } from '@/constants/chess/board'
import { getPieceShape } from '@/constants/chess/pieces'

/**
 * GameEngine manages the entire game flow
 */
export class GameEngine {
  private gameState: GameState
  private board: Board
  private config: GameConfig

  constructor(config?: Partial<GameConfig>) {
    this.config = { 
      ...DEFAULT_GAME_CONFIG, 
      mode: config?.mode ?? GameModeEnum.PVP,
      ...config 
    }
    this.board = new Board(this.config.boardSize)
    this.gameState = this.initializeGameState()
  }

  /**
   * 初始化游戏状态
   */
  private initializeGameState(): GameState {
    return {
      mode: this.config.mode ?? GameModeEnum.PVP,
      currentPlayer: PlayerEnum.PLAYER1,
      board: this.board.getCells(),
      player1Pieces: this.createPlayerPieces(PlayerEnum.PLAYER1),
      player2Pieces: this.createPlayerPieces(PlayerEnum.PLAYER2),
      moveHistory: [],
      passCount: {
        player1: 0,
        player2: 0
      },
      player1Stats: {
        totalMoves: 0,
        totalUndos: 0,
        consecutiveUndos: 0,
        totalPasses: 0
      },
      player2Stats: {
        totalMoves: 0,
        totalUndos: 0,
        consecutiveUndos: 0,
        totalPasses: 0
      },
      winner: null,
      threatInfo: null,
      turnNumber: 0,
      gameStartTime: Date.now()
    }
  }

  /**
   * Create pieces for a player with specific shapes
   * 根据图片排列创建棋子：
   * 玩家1（底部）：橙(4)、绿(3)、蓝(2)、红(1)
   * 玩家2（顶部）：红(1)、蓝(2)、绿(3)、橙(4)
   */
  private createPlayerPieces(player: Player): ChessPiece[] {
    const pieces: ChessPiece[] = []
    
    // 根据玩家设置不同的形状顺序
    let shapeOrder: number[]
    if (player === PlayerEnum.PLAYER1) {
      // 玩家1（底部）：橙色(4)、绿色(3)、蓝色(2)、红色(1)
      shapeOrder = [4, 3, 2, 1]
    } else {
      // 玩家2（顶部）：红色(1)、蓝色(2)、绿色(3)、橙色(4)
      shapeOrder = [1, 2, 3, 4]
    }
    
    for (let i = 0; i < this.config.piecesPerPlayer; i++) {
      const shapeId = shapeOrder[i] || 1
      const piece: ChessPiece = {
        id: generatePieceId(player, shapeId, i),
        player,
        shapeId,
        rotation: this.getInitialRotation(player, i),
        position: null,
        isOnBoard: false,
        isBird: shapeId === 4 // 橙色（资源4）是鸟类
      }
      pieces.push(piece)
    }

    return pieces
  }

  /**
   * 获取初始旋转角度
   * 根据图片中的棋子方向设置
   */
  private getInitialRotation(player: Player, index: number): Rotation {
    // 根据图片观察设置旋转角度
    // 玩家2（顶部）的旋转
    if (player === PlayerEnum.PLAYER2) {
      // 从左到右：红、蓝、绿、橙
      const rotations: Rotation[] = [0, 0, 0, 0]
      return rotations[index] || 0
    }
    // 玩家1（底部）的旋转
    else {
      // 从左到右：橙、绿、蓝、红
      const rotations: Rotation[] = [180, 180, 180, 180]
      return rotations[index] || 180
    }
  }

  /**
   * Start the game by placing initial pieces
   */
  startGame(): boolean {
    // Place player 1's pieces in start zone
    const player1StartRows = getStartRows(PlayerEnum.PLAYER1)
    this.placeInitialPieces(this.gameState.player1Pieces, player1StartRows)

    // Place player 2's pieces in start zone
    const player2StartRows = getStartRows(PlayerEnum.PLAYER2)
    this.placeInitialPieces(this.gameState.player2Pieces, player2StartRows)

    return true
  }

  /**
   * Place initial pieces in start zone
   */
  private placeInitialPieces(pieces: ChessPiece[], rows: number[]): void {
    let pieceIndex = 0
    
    for (const row of rows) {
      for (let col = 0; col < this.board.getSize() && pieceIndex < pieces.length; col++) {
        const piece = pieces[pieceIndex]
        if (piece) {
          const position: Position = { row, col }
          this.board.placePiece(piece, position)
          pieceIndex++
        }
      }
    }
  }

  /**
   * 执行移动（每回合只能移动一次）
   */
  executeMove(move: Move): boolean {
    const { piece, from, to, newRotation } = move

    // 计算移动距离
    const distance = from ? Math.max(
      Math.abs(to.row - from.row),
      Math.abs(to.col - from.col)
    ) : 0

    // 基础验证
    const validation = MoveValidator.validateMove(piece, to, this.board.getCells(), newRotation)
    if (!validation.valid) {
      console.error('Invalid move:', validation.reason)
      return false
    }

    // 检查是否是当前玩家的棋子
    if (piece.player !== this.gameState.currentPlayer) {
      console.error('Not your turn')
      return false
    }

    // 执行移动
    if (from) {
      if (!this.board.movePiece(piece, from, to)) {
        return false
      }
    } else {
      // 初始放置
      if (!this.board.placePiece(piece, to)) {
        return false
      }
    }

    // 更新旋转
    if (newRotation !== undefined) {
      piece.rotation = newRotation
    }

    // 记录移动
    this.gameState.moveHistory.push({
      ...move,
      timestamp: Date.now()
    })

    // 更新统计：增加移动次数，重置连续悔棋次数
    if (this.gameState.currentPlayer === PlayerEnum.PLAYER1) {
      this.gameState.player1Stats.totalMoves++
      this.gameState.player1Stats.consecutiveUndos = 0
    } else {
      this.gameState.player2Stats.totalMoves++
      this.gameState.player2Stats.consecutiveUndos = 0
    }

    // Reset pass count for current player
    if (this.gameState.currentPlayer === PlayerEnum.PLAYER1) {
      this.gameState.passCount.player1 = 0
    } else {
      this.gameState.passCount.player2 = 0
    }

    // 检查胜利条件
    this.checkWinCondition()

    // 移动后自动切换回合
    this.switchTurn()

    return true
  }

  /**
   * 切换到下一个玩家的回合
   */
  switchTurn(): void {
    this.gameState.currentPlayer = 
      this.gameState.currentPlayer === PlayerEnum.PLAYER1 
        ? PlayerEnum.PLAYER2 
        : PlayerEnum.PLAYER1
    
    this.gameState.turnNumber++
  }

  /**
   * Pass turn
   */
  pass(): boolean {
    // Check if allowed to pass
    const currentPassCount = this.gameState.currentPlayer === PlayerEnum.PLAYER1
      ? this.gameState.passCount.player1
      : this.gameState.passCount.player2

    if (currentPassCount >= 1 && !this.config.allowPassTwice) {
      console.error('Cannot pass twice in a row')
      return false
    }

    // Increment pass count
    if (this.gameState.currentPlayer === PlayerEnum.PLAYER1) {
      this.gameState.passCount.player1++
      this.gameState.player1Stats.totalPasses++
      this.gameState.player1Stats.consecutiveUndos = 0  // 跳过回合时重置连续悔棋
    } else {
      this.gameState.passCount.player2++
      this.gameState.player2Stats.totalPasses++
      this.gameState.player2Stats.consecutiveUndos = 0  // 跳过回合时重置连续悔棋
    }

    // Switch turn
    this.switchTurn()

    return true
  }

  /**
   * Undo last move
   */
  undo(): boolean {
    if (this.gameState.moveHistory.length === 0) {
      return false
    }

    const lastMove = this.gameState.moveHistory.pop()
    if (!lastMove) return false

    const { piece, from, to, newRotation } = lastMove

    // Restore position
    if (from) {
      this.board.movePiece(piece, to, from)
    } else {
      this.board.removePiece(piece, to)
    }

    // Restore rotation
    if (newRotation !== undefined && lastMove.needRotation) {
      // Calculate original rotation
      const rotations: Rotation[] = [0, 90, 180, 270]
      const currentIndex = rotations.indexOf(newRotation)
      const originalIndex = (currentIndex - 1 + 4) % 4
      piece.rotation = rotations[originalIndex]!
    }

    // 更新统计：增加悔棋次数和连续悔棋次数
    if (this.gameState.currentPlayer === PlayerEnum.PLAYER1) {
      this.gameState.player1Stats.totalUndos++
      this.gameState.player1Stats.consecutiveUndos++
      // 悔棋时减少移动次数
      if (this.gameState.player1Stats.totalMoves > 0) {
        this.gameState.player1Stats.totalMoves--
      }
    } else {
      this.gameState.player2Stats.totalUndos++
      this.gameState.player2Stats.consecutiveUndos++
      // 悔棋时减少移动次数
      if (this.gameState.player2Stats.totalMoves > 0) {
        this.gameState.player2Stats.totalMoves--
      }
    }

    // Switch back turn
    this.switchTurn()

    return true
  }

  /**
   * Rotate a piece by 90 degrees clockwise (原地旋转，仅鸟类可用)
   * @param piece Piece to rotate
   * @returns true if rotation successful, false otherwise
   */
  rotatePiece(piece: ChessPiece): boolean {
    // 只有鸟类棋子可以原地旋转
    if (!piece.isBird) {
      console.error('Only bird pieces can rotate in place')
      return false
    }

    // 检查是否是当前玩家的棋子
    if (piece.player !== this.gameState.currentPlayer) {
      console.error('Not your piece')
      return false
    }

    // 执行旋转
    const rotations: Rotation[] = [0, 90, 180, 270]
    const currentIndex = rotations.indexOf(piece.rotation)
    const nextIndex = (currentIndex + 1) % 4
    piece.rotation = rotations[nextIndex]!

    // 鸟类原地旋转后结束回合
    this.switchTurn()

    return true
  }

  /**
   * Check win condition
   */
  private checkWinCondition(): void {
    // Check Player 1 win: all pieces in finish zone
    const player1Finish = getFinishRows(PlayerEnum.PLAYER1)
    const player1Win = this.gameState.player1Pieces.every(piece => {
      if (!piece.isOnBoard || !piece.position) return false
      return player1Finish.includes(piece.position.row)
    })

    if (player1Win) {
      this.gameState.winner = PlayerEnum.PLAYER1
      return
    }

    // Check Player 2 win: all pieces in finish zone
    const player2Finish = getFinishRows(PlayerEnum.PLAYER2)
    const player2Win = this.gameState.player2Pieces.every(piece => {
      if (!piece.isOnBoard || !piece.position) return false
      return player2Finish.includes(piece.position.row)
    })

    if (player2Win) {
      this.gameState.winner = PlayerEnum.PLAYER2
    }
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return { ...this.gameState }
  }

  /**
   * Get board
   */
  getBoard(): Board {
    return this.board
  }

  /**
   * Get current player
   */
  getCurrentPlayer(): Player {
    return this.gameState.currentPlayer
  }

  /**
   * Get winner
   */
  getWinner(): Player | null {
    return this.gameState.winner
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.gameState.winner !== null
  }

  /**
   * Get possible moves for current player
   */
  getPossibleMovesForCurrentPlayer(): Move[] {
    const pieces = this.gameState.currentPlayer === PlayerEnum.PLAYER1
      ? this.gameState.player1Pieces
      : this.gameState.player2Pieces

    const allMoves: Move[] = []

    for (const piece of pieces) {
      if (piece.isOnBoard) {
        const moves = MoveValidator.getPossibleMoves(piece, this.board.getCells())
        allMoves.push(...moves)
      }
    }

    return allMoves
  }

  /**
   * Get possible moves for a specific piece
   */
  getPossibleMovesForPiece(piece: ChessPiece): Move[] {
    return MoveValidator.getPossibleMoves(piece, this.board.getCells())
  }

  /**
   * Check if current player can move
   */
  canCurrentPlayerMove(): boolean {
    return this.getPossibleMovesForCurrentPlayer().length > 0
  }

  /**
   * Reset game
   */
  reset(): void {
    this.board.clear()
    this.gameState = this.initializeGameState()
  }
}
