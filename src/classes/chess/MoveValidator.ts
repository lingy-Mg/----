/**
 * MoveValidator - 移动验证系统
 * 验证棋子移动的合法性并生成可能的移动
 */

import type {
  ChessPiece,
  Position,
  BoardCell,
  Move,
  MoveValidation,
  Direction,
  Rotation
} from '@/types/chess'
import { DIRECTION_VECTORS, isValidPosition, positionsEqual } from '@/types/chess'
import { MIN_MOVE_STEPS, MAX_MOVE_STEPS, ROTATE_MOVE_LIMIT } from '@/constants/chess/board'
import { EdgeMatcher } from './EdgeMatcher'

/**
 * MoveValidator 类处理移动验证和生成
 */
export class MoveValidator {
  /**
   * 计算曼哈顿距离（不含对角线）
   * 
   * @param from 起始位置
   * @param to 目标位置
   * @returns 距离（格数）
   */
  static calculateDistance(from: Position, to: Position): number {
    return Math.abs(to.row - from.row) + Math.abs(to.col - from.col)
  }

  /**
   * 计算切比雪夫距离（含对角线）
   * 水平和垂直距离的最大值
   * 
   * @param from 起始位置
   * @param to 目标位置
   * @returns 距离（格数，包含对角线）
   */
  static calculateChebyshevDistance(from: Position, to: Position): number {
    return Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col))
  }

  /**
   * 获取从一个位置到另一个位置的方向
   * 如果不是直线或对角线则返回 null
   * 
   * @param from 起始位置
   * @param to 目标位置
   * @returns 方向或 null
   */
  static getDirection(from: Position, to: Position): Direction | null {
    const rowDiff = to.row - from.row
    const colDiff = to.col - from.col

    // 归一化获取方向
    const rowDir = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff)
    const colDir = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff)

    // 查找匹配的方向
    for (const [dir, vector] of Object.entries(DIRECTION_VECTORS)) {
      if (vector.row === rowDir && vector.col === colDir) {
        return dir as Direction
      }
    }

    return null
  }

  /**
   * 获取从起点到终点的路径位置（不含起点，含终点）
   * 如果路径不是直线或对角线则返回空数组
   * 
   * @param from 起始位置
   * @param to 目标位置
   * @returns 路径上的位置数组
   */
  static getPath(from: Position, to: Position): Position[] {
    const direction = this.getDirection(from, to)
    if (!direction) return []

    const vector = DIRECTION_VECTORS[direction]
    const path: Position[] = []
    let current = { ...from }

    while (!positionsEqual(current, to)) {
      current = {
        row: current.row + vector.row,
        col: current.col + vector.col
      }
      path.push({ ...current })
    }

    return path
  }

  /**
   * 获取指定方向上 N 步后的位置
   * 
   * @param position 起始位置
   * @param direction 移动方向
   * @param steps 步数
   * @returns 目标位置
   */
  static getPositionInDirection(
    position: Position,
    direction: Direction,
    steps: number
  ): Position {
    const vector = DIRECTION_VECTORS[direction]
    return {
      row: position.row + vector.row * steps,
      col: position.col + vector.col * steps
    }
  }

  /**
   * 验证移动的合法性
   * 
   * @param piece 要移动的棋子
   * @param toPosition 目标位置
   * @param board 游戏棋盘
   * @param newRotation 可选的新旋转角度
   * @returns 验证结果
   */
  static validateMove(
    piece: ChessPiece,
    toPosition: Position,
    board: BoardCell[][],
    newRotation?: Rotation
  ): MoveValidation {
    // 1. 检查棋子是否在棋盘上
    if (!piece.isOnBoard || !piece.position) {
      return {
        valid: false,
        reason: 'Piece must be placed on board first'
      }
    }

    const from = piece.position

    // 2. 检查目标位置是否有效
    if (!isValidPosition(toPosition, board.length)) {
      return {
        valid: false,
        reason: 'Target position is out of bounds'
      }
    }

    // 3. 检查是否移动到相同位置（仅旋转）
    if (positionsEqual(from, toPosition)) {
      if (newRotation !== undefined && newRotation !== piece.rotation) {
        // 原地旋转：只有鸟类棋子可以
        if (!piece.isBird) {
          return {
            valid: false,
            reason: 'Only bird pieces can rotate in place'
          }
        }
        return { valid: true }
      }
      return {
        valid: false,
        reason: 'Must move to a different position or rotate'
      }
    }

    // 4. 计算距离和方向
    const distance = this.calculateChebyshevDistance(from, toPosition)
    const direction = this.getDirection(from, toPosition)

    if (!direction) {
      return {
        valid: false,
        reason: 'Must move in a straight line or diagonal'
      }
    }

    // 5. 检查目标格子是否被占用（目标必须为空）
    const targetCell = board[toPosition.row]?.[toPosition.col]
    if (!targetCell) {
      return {
        valid: false,
        reason: 'Invalid target position'
      }
    }
    
    // 目标格子必须为空（不可重叠）
    if (targetCell.pieces.length > 0) {
      return {
        valid: false,
        reason: 'Target cell is occupied - pieces cannot overlap'
      }
    }

    // 6. 旋转规则检查
    // - 如果距离 = 1：可以选择是否旋转
    // - 如果距离 > 1：不能旋转（newRotation 必须是 undefined）
    if (distance > 1 && newRotation !== undefined && newRotation !== piece.rotation) {
      return {
        valid: false,
        reason: 'Can only rotate when moving to adjacent cell (distance 1) or in place (birds only)'
      }
    }
    
    // 7. 没有距离限制 - 可以移动到棋盘任意空位置

    return { 
      valid: true
    }
  }

  /**
   * 获取棋子的所有可能移动
   * 
   * @param piece 要检查的棋子
   * @param board 游戏棋盘
   * @param includeRotations 是否包含旋转选项
   * @returns 有效移动数组
   */
  static getPossibleMoves(
    piece: ChessPiece,
    board: BoardCell[][],
    includeRotations: boolean = true
  ): Move[] {
    if (!piece.isOnBoard || !piece.position) {
      return []
    }

    const possibleMoves: Move[] = []
    const directions = Object.keys(DIRECTION_VECTORS) as Direction[]
    const rotations: Rotation[] = includeRotations ? [0, 90, 180, 270] : [piece.rotation]

    for (const direction of directions) {
      for (let steps = MIN_MOVE_STEPS; steps <= MAX_MOVE_STEPS; steps++) {
        const targetPos = this.getPositionInDirection(piece.position, direction, steps)

        // Skip if out of bounds
        if (!isValidPosition(targetPos, board.length)) {
          continue
        }

        for (const rotation of rotations) {
          const needsRotation = rotation !== piece.rotation

          // Skip if rotation requires distance limit
          if (needsRotation && steps > ROTATE_MOVE_LIMIT) {
            continue
          }

          const validation = this.validateMove(piece, targetPos, board, rotation)

          if (validation.valid) {
            possibleMoves.push({
              piece,
              from: piece.position,
              to: targetPos,
              steps,
              needRotation: needsRotation,
              newRotation: rotation,
              canFit: true,
              timestamp: Date.now()
            })
          }
        }
      }
    }

    return possibleMoves
  }

  /**
   * Get all possible positions (without rotation variations)
   * Useful for highlighting valid move targets
   * 
   * @param piece Piece to check
   * @param board Game board
   * @returns Array of valid positions
   */
  static getPossiblePositions(piece: ChessPiece, board: BoardCell[][]): Position[] {
    const moves = this.getPossibleMoves(piece, board, true)
    
    // Deduplicate positions
    const uniquePositions = new Map<string, Position>()
    
    for (const move of moves) {
      const key = `${move.to.row},${move.to.col}`
      if (!uniquePositions.has(key)) {
        uniquePositions.set(key, move.to)
      }
    }

    return Array.from(uniquePositions.values())
  }

  /**
   * Get valid rotations for a piece at a specific position
   * 
   * @param piece Piece to check
   * @param position Target position
   * @param board Game board
   * @returns Array of valid rotations
   */
  static getValidRotationsAtPosition(
    piece: ChessPiece,
    position: Position,
    board: BoardCell[][]
  ): Rotation[] {
    return EdgeMatcher.getValidRotations(piece, position, board)
  }

  /**
   * Check if a piece can move at all
   * 
   * @param piece Piece to check
   * @param board Game board
   * @returns true if piece has any valid moves
   */
  static canPieceMove(piece: ChessPiece, board: BoardCell[][]): boolean {
    return this.getPossibleMoves(piece, board, true).length > 0
  }

  /**
   * Get the best move (shortest path to goal) - simple heuristic
   * Useful for AI or hints
   * 
   * @param piece Piece to check
   * @param board Game board
   * @param goalRows Target rows to reach
   * @returns Best move or null
   */
  static getBestMove(
    piece: ChessPiece,
    board: BoardCell[][],
    goalRows: number[]
  ): Move | null {
    const moves = this.getPossibleMoves(piece, board, true)
    if (moves.length === 0) return null

    // Find move closest to goal
    let bestMove: Move | null = moves[0] ?? null
    if (!bestMove) return null
    
    let bestDistance = Math.min(...goalRows.map(row => Math.abs(bestMove!.to.row - row)))

    for (const move of moves) {
      const distance = Math.min(...goalRows.map(row => Math.abs(move.to.row - row)))
      if (distance < bestDistance) {
        bestDistance = distance
        bestMove = move
      }
    }

    return bestMove
  }
}
