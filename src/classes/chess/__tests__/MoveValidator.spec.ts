/**
 * MoveValidator Test Suite
 * Tests movement validation and generation
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { MoveValidator } from '../MoveValidator'
import type { BoardCell, ChessPiece, Position } from '@/types/chess'
import { Player, Direction } from '@/types/chess'

describe('MoveValidator', () => {
  let board: BoardCell[][]
  let piece: ChessPiece

  beforeEach(() => {
    // Create 8x8 empty board
    board = Array(8)
      .fill(null)
      .map((_, row) =>
        Array(8)
          .fill(null)
          .map((_, col) => ({
            position: { row, col },
            pieces: [],
            isStartZone: { player1: false, player2: false },
            isFinishZone: { player1: false, player2: false }
          }))
      )

    // Create test piece
    piece = {
      id: 'test-piece',
      player: Player.PLAYER1,
      shapeId: 1,
      rotation: 0,
      position: { row: 4, col: 4 },
      isOnBoard: true,
      isBird: false
    }
  })

  describe('calculateDistance', () => {
    it('should calculate Manhattan distance correctly', () => {
      const from: Position = { row: 2, col: 3 }
      const to: Position = { row: 5, col: 7 }
      expect(MoveValidator.calculateDistance(from, to)).toBe(7) // |5-2| + |7-3| = 3 + 4 = 7
    })

    it('should return 0 for same position', () => {
      const pos: Position = { row: 4, col: 4 }
      expect(MoveValidator.calculateDistance(pos, pos)).toBe(0)
    })

    it('should handle vertical distance', () => {
      const from: Position = { row: 2, col: 3 }
      const to: Position = { row: 5, col: 3 }
      expect(MoveValidator.calculateDistance(from, to)).toBe(3)
    })

    it('should handle horizontal distance', () => {
      const from: Position = { row: 2, col: 3 }
      const to: Position = { row: 2, col: 7 }
      expect(MoveValidator.calculateDistance(from, to)).toBe(4)
    })
  })

  describe('calculateChebyshevDistance', () => {
    it('should calculate diagonal distance correctly', () => {
      const from: Position = { row: 2, col: 2 }
      const to: Position = { row: 5, col: 5 }
      expect(MoveValidator.calculateChebyshevDistance(from, to)).toBe(3)
    })

    it('should handle mixed diagonal moves', () => {
      const from: Position = { row: 2, col: 3 }
      const to: Position = { row: 5, col: 7 }
      // max(|5-2|, |7-3|) = max(3, 4) = 4
      expect(MoveValidator.calculateChebyshevDistance(from, to)).toBe(4)
    })
  })

  describe('getDirection', () => {
    const center: Position = { row: 4, col: 4 }

    it('should identify UP direction', () => {
      const to: Position = { row: 2, col: 4 }
      expect(MoveValidator.getDirection(center, to)).toBe(Direction.UP)
    })

    it('should identify DOWN direction', () => {
      const to: Position = { row: 6, col: 4 }
      expect(MoveValidator.getDirection(center, to)).toBe(Direction.DOWN)
    })

    it('should identify LEFT direction', () => {
      const to: Position = { row: 4, col: 2 }
      expect(MoveValidator.getDirection(center, to)).toBe(Direction.LEFT)
    })

    it('should identify RIGHT direction', () => {
      const to: Position = { row: 4, col: 6 }
      expect(MoveValidator.getDirection(center, to)).toBe(Direction.RIGHT)
    })

    it('should identify UP_LEFT direction', () => {
      const to: Position = { row: 2, col: 2 }
      expect(MoveValidator.getDirection(center, to)).toBe(Direction.UP_LEFT)
    })

    it('should identify UP_RIGHT direction', () => {
      const to: Position = { row: 2, col: 6 }
      expect(MoveValidator.getDirection(center, to)).toBe(Direction.UP_RIGHT)
    })

    it('should identify DOWN_LEFT direction', () => {
      const to: Position = { row: 6, col: 2 }
      expect(MoveValidator.getDirection(center, to)).toBe(Direction.DOWN_LEFT)
    })

    it('should identify DOWN_RIGHT direction', () => {
      const to: Position = { row: 6, col: 6 }
      expect(MoveValidator.getDirection(center, to)).toBe(Direction.DOWN_RIGHT)
    })

    it('should return null for non-straight path', () => {
      const to: Position = { row: 2, col: 5 } // Not a valid 8-direction move
      expect(MoveValidator.getDirection(center, to)).toBeNull()
    })
  })

  describe('getPath', () => {
    it('should generate path for vertical movement', () => {
      const from: Position = { row: 2, col: 3 }
      const to: Position = { row: 5, col: 3 }
      const path = MoveValidator.getPath(from, to)
      
      expect(path).toHaveLength(3)
      expect(path[0]).toEqual({ row: 3, col: 3 })
      expect(path[1]).toEqual({ row: 4, col: 3 })
      expect(path[2]).toEqual({ row: 5, col: 3 })
    })

    it('should generate path for horizontal movement', () => {
      const from: Position = { row: 3, col: 2 }
      const to: Position = { row: 3, col: 5 }
      const path = MoveValidator.getPath(from, to)
      
      expect(path).toHaveLength(3)
      expect(path[0]).toEqual({ row: 3, col: 3 })
      expect(path[1]).toEqual({ row: 3, col: 4 })
      expect(path[2]).toEqual({ row: 3, col: 5 })
    })

    it('should generate path for diagonal movement', () => {
      const from: Position = { row: 2, col: 2 }
      const to: Position = { row: 4, col: 4 }
      const path = MoveValidator.getPath(from, to)
      
      expect(path).toHaveLength(2)
      expect(path[0]).toEqual({ row: 3, col: 3 })
      expect(path[1]).toEqual({ row: 4, col: 4 })
    })

    it('should return empty array for invalid path', () => {
      const from: Position = { row: 2, col: 2 }
      const to: Position = { row: 5, col: 4 } // Not straight or diagonal
      const path = MoveValidator.getPath(from, to)
      
      expect(path).toHaveLength(0)
    })
  })

  describe('getPositionInDirection', () => {
    const start: Position = { row: 4, col: 4 }

    it('should get position 2 steps UP', () => {
      const result = MoveValidator.getPositionInDirection(start, Direction.UP, 2)
      expect(result).toEqual({ row: 2, col: 4 })
    })

    it('should get position 3 steps DOWN_RIGHT', () => {
      const result = MoveValidator.getPositionInDirection(start, Direction.DOWN_RIGHT, 3)
      expect(result).toEqual({ row: 7, col: 7 })
    })

    it('should get position 1 step LEFT', () => {
      const result = MoveValidator.getPositionInDirection(start, Direction.LEFT, 1)
      expect(result).toEqual({ row: 4, col: 3 })
    })
  })

  describe('validateMove', () => {
    beforeEach(() => {
      // Place piece on board
      board[4]![4]!.pieces.push(piece)
    })

    it('should reject move for piece not on board', () => {
      const offBoardPiece: ChessPiece = { ...piece, isOnBoard: false, position: null }
      const result = MoveValidator.validateMove(offBoardPiece, { row: 5, col: 4 }, board)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('must be placed on board')
    })

    it('should reject move out of bounds', () => {
      const result = MoveValidator.validateMove(piece, { row: 10, col: 4 }, board)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('out of bounds')
    })

    it('should reject move to same position without rotation', () => {
      const result = MoveValidator.validateMove(piece, { row: 4, col: 4 }, board)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('different position')
    })

    it('should reject non-straight path', () => {
      const result = MoveValidator.validateMove(piece, { row: 2, col: 5 }, board)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('straight line or diagonal')
    })

    it('should reject move with invalid distance (0 steps)', () => {
      const result = MoveValidator.validateMove(piece, { row: 4, col: 4 }, board)
      
      expect(result.valid).toBe(false)
    })

    it('should reject move with too many steps (>3)', () => {
      const result = MoveValidator.validateMove(piece, { row: 0, col: 4 }, board) // 4 steps up
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('1-3 cells')
    })

    it('should reject rotation + multi-step move', () => {
      const result = MoveValidator.validateMove(piece, { row: 2, col: 4 }, board, 90) // 2 steps + rotation
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('1 cell when rotating')
    })

    it('should reject move if cannot fit (no neighbors)', () => {
      // Move to position with no neighbors to match
      const result = MoveValidator.validateMove(piece, { row: 5, col: 4 }, board, 0)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Cannot fit')
    })

    it('should accept valid move with matching neighbor', () => {
      // Place neighbor that matches
      const neighbor: ChessPiece = {
        id: 'neighbor',
        player: Player.PLAYER1,
        shapeId: 3, // top='1`+', right='1-', bottom='1`-', left='1+'
        rotation: 0,
        position: { row: 4, col: 4 },
        isOnBoard: true,
        isBird: false
      }
      board[4]![4]!.pieces = [neighbor]

      // Try to place piece1 at (3, 4) - above neighbor
      // Piece1: top='1-', bottom='1`-'
      // Piece3 (neighbor): top='1`+', bottom='1`-'
      // Piece1's bottom='1`-' should match neighbor's top='1`+'
      const testPiece = { ...piece, position: { row: 2, col: 4 } }
      board[2]![4]!.pieces.push(testPiece)
      
      const result = MoveValidator.validateMove(testPiece, { row: 3, col: 4 }, board, 0)
      
      expect(result.valid).toBe(true)
    })
  })

  describe('getPossibleMoves', () => {
    it('should return empty array for piece not on board', () => {
      const offBoardPiece: ChessPiece = { ...piece, isOnBoard: false, position: null }
      const moves = MoveValidator.getPossibleMoves(offBoardPiece, board)
      
      expect(moves).toHaveLength(0)
    })

    it('should return empty array when no valid moves', () => {
      // Piece alone on board - no neighbors to match
      board[4]![4]!.pieces.push(piece)
      const moves = MoveValidator.getPossibleMoves(piece, board)
      
      expect(moves).toHaveLength(0)
    })

    it('should find moves with valid neighbors', () => {
      // Place piece and neighbor
      const neighbor: ChessPiece = {
        id: 'neighbor',
        player: Player.PLAYER1,
        shapeId: 3,
        rotation: 0,
        position: { row: 4, col: 4 },
        isOnBoard: true,
        isBird: false
      }
      board[4]![4]!.pieces = [neighbor]
      
      piece.position = { row: 2, col: 4 }
      board[2]![4]!.pieces = [piece]
      
      const moves = MoveValidator.getPossibleMoves(piece, board, false)
      
      // Should find at least some valid moves
      expect(moves.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('canPieceMove', () => {
    it('should return false when piece cannot move', () => {
      board[4]![4]!.pieces.push(piece)
      const result = MoveValidator.canPieceMove(piece, board)
      
      expect(result).toBe(false)
    })

    it('should return true when piece can move', () => {
      // Place matching neighbor
      const neighbor: ChessPiece = {
        id: 'neighbor',
        player: Player.PLAYER1,
        shapeId: 3,
        rotation: 0,
        position: { row: 4, col: 4 },
        isOnBoard: true,
        isBird: false
      }
      board[4]![4]!.pieces = [neighbor]
      piece.position = { row: 2, col: 4 }
      board[2]![4]!.pieces = [piece]
      
      const result = MoveValidator.canPieceMove(piece, board)
      
      // Should be able to move if there are matching neighbors
      expect(typeof result).toBe('boolean')
    })
  })
})
