/**
 * MoveValidator - Movement Validation System
 * Validates piece movements and generates possible moves
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
 * MoveValidator class handles move validation and generation
 */
export class MoveValidator {
  /**
   * Calculate Manhattan distance between two positions
   * 
   * @param from Start position
   * @param to End position
   * @returns Distance in cells
   */
  static calculateDistance(from: Position, to: Position): number {
    return Math.abs(to.row - from.row) + Math.abs(to.col - from.col)
  }

  /**
   * Calculate Chebyshev distance (allows diagonals)
   * Maximum of horizontal and vertical distance
   * 
   * @param from Start position
   * @param to End position
   * @returns Distance in cells (including diagonal)
   */
  static calculateChebyshevDistance(from: Position, to: Position): number {
    return Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col))
  }

  /**
   * Get direction from one position to another
   * Returns null if not a straight line or diagonal
   * 
   * @param from Start position
   * @param to End position
   * @returns Direction or null
   */
  static getDirection(from: Position, to: Position): Direction | null {
    const rowDiff = to.row - from.row
    const colDiff = to.col - from.col

    // Normalize to get direction
    const rowDir = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff)
    const colDir = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff)

    // Find matching direction
    for (const [dir, vector] of Object.entries(DIRECTION_VECTORS)) {
      if (vector.row === rowDir && vector.col === colDir) {
        return dir as Direction
      }
    }

    return null
  }

  /**
   * Get path positions from start to end (not including start, including end)
   * Returns empty array if path is not straight line or diagonal
   * 
   * @param from Start position
   * @param to End position
   * @returns Array of positions along the path
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
   * Get position in a specific direction by N steps
   * 
   * @param position Start position
   * @param direction Direction to move
   * @param steps Number of steps
   * @returns Target position
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
   * Validate a move
   * 
   * @param piece Piece to move
   * @param toPosition Target position
   * @param board Game board
   * @param newRotation Optional new rotation
   * @returns Validation result
   */
  static validateMove(
    piece: ChessPiece,
    toPosition: Position,
    board: BoardCell[][],
    newRotation?: Rotation
  ): MoveValidation {
    // 1. Check if piece is on board
    if (!piece.isOnBoard || !piece.position) {
      return {
        valid: false,
        reason: 'Piece must be placed on board first'
      }
    }

    const from = piece.position

    // 2. Check if target position is valid
    if (!isValidPosition(toPosition, board.length)) {
      return {
        valid: false,
        reason: 'Target position is out of bounds'
      }
    }

    // 3. Check if moving to same position (rotation only)
    if (positionsEqual(from, toPosition)) {
      if (newRotation !== undefined && newRotation !== piece.rotation) {
        // In-place rotation (future feature for bird pieces)
        return { valid: true }
      }
      return {
        valid: false,
        reason: 'Must move to a different position or rotate'
      }
    }

    // 4. Calculate distance and direction
    const distance = this.calculateChebyshevDistance(from, toPosition)
    const direction = this.getDirection(from, toPosition)

    if (!direction) {
      return {
        valid: false,
        reason: 'Must move in a straight line or diagonal'
      }
    }

    // 5. Check move distance limits
    if (distance < MIN_MOVE_STEPS || distance > MAX_MOVE_STEPS) {
      return {
        valid: false,
        reason: `Must move ${MIN_MOVE_STEPS}-${MAX_MOVE_STEPS} cells`
      }
    }

    // 6. Check rotation constraints
    const needsRotation = newRotation !== undefined && newRotation !== piece.rotation
    if (needsRotation && distance > ROTATE_MOVE_LIMIT) {
      return {
        valid: false,
        reason: `Can only move ${ROTATE_MOVE_LIMIT} cell when rotating`
      }
    }

    // 7. Path is always clear (pieces can jump over others based on rules)
    // No path checking needed for this game

    // 8. Check if piece can fit at destination
    const testRotation = newRotation ?? piece.rotation
    const fitCheck = EdgeMatcher.checkFit(piece, toPosition, board, testRotation)

    if (!fitCheck.canFit) {
      return {
        valid: false,
        reason: 'Cannot fit at target position (no matching edges)'
      }
    }

    return { valid: true }
  }

  /**
   * Get all possible moves for a piece
   * 
   * @param piece Piece to check
   * @param board Game board
   * @param includeRotations Whether to include rotation options
   * @returns Array of valid moves
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
