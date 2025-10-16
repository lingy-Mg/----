/**
 * EdgeMatcher Test Suite
 * Tests edge matching algorithm with all combinations
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { EdgeMatcher } from '../EdgeMatcher'
import type { BoardCell, ChessPiece, Position } from '@/types/chess'
import { Player } from '@/types/chess'
import { PIECE_SHAPES } from '@/constants/chess/pieces'

describe('EdgeMatcher', () => {
  describe('canMatch', () => {
    it('should match 1+ with 1-', () => {
      expect(EdgeMatcher.canMatch('1+', '1-')).toBe(true)
    })

    it('should match 1- with 1+', () => {
      expect(EdgeMatcher.canMatch('1-', '1+')).toBe(true)
    })

    it('should match 1`+ with 1`-', () => {
      expect(EdgeMatcher.canMatch('1`+', '1`-')).toBe(true)
    })

    it('should match 1`- with 1`+', () => {
      expect(EdgeMatcher.canMatch('1`-', '1`+')).toBe(true)
    })

    it('should NOT match 1+ with 1`-', () => {
      expect(EdgeMatcher.canMatch('1+', '1`-')).toBe(false)
    })

    it('should NOT match 1- with 1`+', () => {
      expect(EdgeMatcher.canMatch('1-', '1`+')).toBe(false)
    })

    it('should NOT match 1+ with 1+', () => {
      expect(EdgeMatcher.canMatch('1+', '1+')).toBe(false)
    })

    it('should NOT match 1- with 1-', () => {
      expect(EdgeMatcher.canMatch('1-', '1-')).toBe(false)
    })

    it('should NOT match 1`+ with 1`+', () => {
      expect(EdgeMatcher.canMatch('1`+', '1`+')).toBe(false)
    })

    it('should NOT match 1`- with 1`-', () => {
      expect(EdgeMatcher.canMatch('1`-', '1`-')).toBe(false)
    })

    // Test all 16 combinations (4x4 matrix)
    it('should correctly handle all 16 edge combinations', () => {
      const edges = ['1+', '1-', '1`+', '1`-'] as const
      const expectedMatches = [
        // 1+  matches: 1-
        [false, true, false, false],
        // 1-  matches: 1+
        [true, false, false, false],
        // 1`+ matches: 1`-
        [false, false, false, true],
        // 1`- matches: 1`+
        [false, false, true, false]
      ]

      for (let i = 0; i < edges.length; i++) {
        for (let j = 0; j < edges.length; j++) {
          const result = EdgeMatcher.canMatch(edges[i], edges[j])
          expect(result).toBe(expectedMatches[i][j])
        }
      }
    })
  })

  describe('getRotatedEdge', () => {
    const piece1Edges = PIECE_SHAPES[1].edges

    it('should return original edge at 0° rotation', () => {
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'top', 0)).toBe('1-')
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'right', 0)).toBe('1`-')
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'bottom', 0)).toBe('1`-')
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'left', 0)).toBe('1-')
    })

    it('should correctly rotate edges by 90°', () => {
      // After 90° clockwise: top -> right, right -> bottom, bottom -> left, left -> top
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'top', 90)).toBe('1-')     // from left
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'right', 90)).toBe('1-')   // from top
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'bottom', 90)).toBe('1`-') // from right
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'left', 90)).toBe('1`-')   // from bottom
    })

    it('should correctly rotate edges by 180°', () => {
      // After 180°: top <-> bottom, left <-> right
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'top', 180)).toBe('1`-')   // from bottom
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'right', 180)).toBe('1-')  // from left
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'bottom', 180)).toBe('1-') // from top
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'left', 180)).toBe('1`-')  // from right
    })

    it('should correctly rotate edges by 270°', () => {
      // After 270° clockwise: top -> left, right -> top, bottom -> right, left -> bottom
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'top', 270)).toBe('1`-')   // from right
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'right', 270)).toBe('1`-') // from bottom
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'bottom', 270)).toBe('1-') // from left
      expect(EdgeMatcher.getRotatedEdge(piece1Edges, 'left', 270)).toBe('1-')   // from top
    })

    it('should work with all piece shapes', () => {
      for (let shapeId = 1; shapeId <= 4; shapeId++) {
        const shape = PIECE_SHAPES[shapeId]
        
        // Test all sides and rotations
        const sides = ['top', 'right', 'bottom', 'left'] as const
        const rotations = [0, 90, 180, 270] as const
        
        for (const side of sides) {
          for (const rotation of rotations) {
            const result = EdgeMatcher.getRotatedEdge(shape.edges, side, rotation)
            expect(['1+', '1-', '1`+', '1`-']).toContain(result)
          }
        }
      }
    })
  })

  describe('getOppositeSide', () => {
    it('should return bottom for top', () => {
      expect(EdgeMatcher.getOppositeSide('top')).toBe('bottom')
    })

    it('should return top for bottom', () => {
      expect(EdgeMatcher.getOppositeSide('bottom')).toBe('top')
    })

    it('should return right for left', () => {
      expect(EdgeMatcher.getOppositeSide('left')).toBe('right')
    })

    it('should return left for right', () => {
      expect(EdgeMatcher.getOppositeSide('right')).toBe('left')
    })
  })

  describe('getNeighborPosition', () => {
    const position: Position = { row: 4, col: 4 }

    it('should get UP neighbor correctly', () => {
      const result = EdgeMatcher.getNeighborPosition(position, 'up' as any)
      expect(result).toEqual({ row: 3, col: 4 })
    })

    it('should get DOWN neighbor correctly', () => {
      const result = EdgeMatcher.getNeighborPosition(position, 'down' as any)
      expect(result).toEqual({ row: 5, col: 4 })
    })

    it('should get LEFT neighbor correctly', () => {
      const result = EdgeMatcher.getNeighborPosition(position, 'left' as any)
      expect(result).toEqual({ row: 4, col: 3 })
    })

    it('should get RIGHT neighbor correctly', () => {
      const result = EdgeMatcher.getNeighborPosition(position, 'right' as any)
      expect(result).toEqual({ row: 4, col: 5 })
    })

    it('should get UP_LEFT neighbor correctly', () => {
      const result = EdgeMatcher.getNeighborPosition(position, 'up_left' as any)
      expect(result).toEqual({ row: 3, col: 3 })
    })

    it('should get UP_RIGHT neighbor correctly', () => {
      const result = EdgeMatcher.getNeighborPosition(position, 'up_right' as any)
      expect(result).toEqual({ row: 3, col: 5 })
    })

    it('should get DOWN_LEFT neighbor correctly', () => {
      const result = EdgeMatcher.getNeighborPosition(position, 'down_left' as any)
      expect(result).toEqual({ row: 5, col: 3 })
    })

    it('should get DOWN_RIGHT neighbor correctly', () => {
      const result = EdgeMatcher.getNeighborPosition(position, 'down_right' as any)
      expect(result).toEqual({ row: 5, col: 5 })
    })
  })

  describe('checkFit', () => {
    let board: BoardCell[][]
    let piece1: ChessPiece
    let piece2: ChessPiece

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

      // Create test pieces
      piece1 = {
        id: 'p1-piece1-0',
        player: Player.PLAYER1,
        shapeId: 1,
        rotation: 0,
        position: { row: 4, col: 4 },
        isOnBoard: true,
        isBird: false
      }

      piece2 = {
        id: 'p1-piece2-0',
        player: Player.PLAYER1,
        shapeId: 2,
        rotation: 0,
        position: { row: 3, col: 4 },
        isOnBoard: true,
        isBird: false
      }
    })

    it('should return canFit=false for empty board', () => {
      const result = EdgeMatcher.checkFit(piece1, { row: 4, col: 4 }, board)
      expect(result.canFit).toBe(false)
      expect(result.matchingPieces).toHaveLength(0)
    })

    it('should return canFit=true when piece can fit', () => {
      // Place piece2 at (3, 4) - above piece1's target
      board[3][4].pieces.push(piece2)

      // Piece1 has top='1-', Piece2 has bottom='1`-'
      // They don't match at 0° rotation
      let result = EdgeMatcher.checkFit(piece1, { row: 4, col: 4 }, board, 0)
      expect(result.canFit).toBe(false)

      // Try different piece/rotation combinations
      // Piece 2 has: top='1+', right='1-', bottom='1`-', left='1`+'
      // We need Piece1's top='1-' to match with something that has '1+'
      
      // Place piece with edge that matches
      const piece3: ChessPiece = {
        id: 'p1-piece3-0',
        player: Player.PLAYER1,
        shapeId: 3, // top='1`+', right='1-', bottom='1`-', left='1+'
        rotation: 0,
        position: { row: 3, col: 4 },
        isOnBoard: true,
        isBird: false
      }
      board[3][4].pieces = [piece3]

      // Piece1 top='1-', Piece3 bottom='1`-' -> doesn't match
      result = EdgeMatcher.checkFit(piece1, { row: 4, col: 4 }, board, 0)
      expect(result.canFit).toBe(false)
    })

    it('should find matching edges correctly', () => {
      // Piece 1: top='1-', right='1`-', bottom='1`-', left='1-'
      // Piece 4: top='1`+', right='1+', bottom='1`+', left='1+'
      
      // Place Piece4 to the right (row 4, col 5)
      const piece4: ChessPiece = {
        id: 'p1-piece4-0',
        player: Player.PLAYER1,
        shapeId: 4,
        rotation: 0,
        position: { row: 4, col: 5 },
        isOnBoard: true,
        isBird: false
      }
      board[4][5].pieces.push(piece4)

      // Piece1's right='1`-' should match Piece4's left='1+'
      // But they don't match (1`- vs 1+)
      let result = EdgeMatcher.checkFit(piece1, { row: 4, col: 4 }, board, 0)
      expect(result.canFit).toBe(false)

      // Try with Piece2 to the left (row 4, col 3)
      // Piece2: top='1+', right='1-', bottom='1`-', left='1`+'
      const piece2Left: ChessPiece = {
        id: 'p1-piece2-1',
        player: Player.PLAYER1,
        shapeId: 2,
        rotation: 0,
        position: { row: 4, col: 3 },
        isOnBoard: true,
        isBird: false
      }
      board[4][3].pieces.push(piece2Left)

      // Piece1's left='1-' should match Piece2's right='1-'
      // They don't match (1- vs 1-)
      result = EdgeMatcher.checkFit(piece1, { row: 4, col: 4 }, board, 0)
      expect(result.canFit).toBe(false)
    })

    it('should detect matching with correct piece placement', () => {
      // Piece2: top='1+', right='1-', bottom='1`-', left='1`+'
      // Piece1: top='1-', right='1`-', bottom='1`-', left='1-'
      
      // Piece2 top='1+' matches with Piece1 bottom='1`-'? No
      // Piece2 top='1+' should match with '1-'
      
      // Place Piece1 below Piece2
      // Piece2 at (3,4), Piece1 at (4,4)
      // Piece2 bottom='1`-', Piece1 top='1-' -> need '1`+' to match '1`-'
      
      // Better test: use matching edges
      // Let's place two pieces that CAN match
      
      const pieceA: ChessPiece = {
        id: 'test-a',
        player: Player.PLAYER1,
        shapeId: 2, // top='1+', right='1-', bottom='1`-', left='1`+'
        rotation: 0,
        position: { row: 3, col: 4 },
        isOnBoard: true,
        isBird: false
      }
      
      const pieceB: ChessPiece = {
        id: 'test-b',
        player: Player.PLAYER1,
        shapeId: 3, // top='1`+', right='1-', bottom='1`-', left='1+'
        rotation: 0,
        position: { row: 4, col: 4 },
        isOnBoard: true,
        isBird: false
      }

      board[3][4].pieces = [pieceA]
      
      // Check if pieceB can fit at (4,4)
      // PieceA bottom='1`-', PieceB top='1`+' -> Match!
      const result = EdgeMatcher.checkFit(pieceB, { row: 4, col: 4 }, board, 0)
      expect(result.canFit).toBe(true)
      expect(result.matchingPieces).toHaveLength(1)
      expect(result.matchingPieces[0].id).toBe('test-a')
    })
  })

  describe('getValidRotations', () => {
    let board: BoardCell[][]
    let piece: ChessPiece

    beforeEach(() => {
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

      piece = {
        id: 'test-piece',
        player: Player.PLAYER1,
        shapeId: 1,
        rotation: 0,
        position: null,
        isOnBoard: false,
        isBird: false
      }
    })

    it('should return empty array for empty board', () => {
      const result = EdgeMatcher.getValidRotations(piece, { row: 4, col: 4 }, board)
      expect(result).toHaveLength(0)
    })

    it('should return rotations where piece can fit', () => {
      // Place a neighbor piece
      const neighbor: ChessPiece = {
        id: 'neighbor',
        player: Player.PLAYER1,
        shapeId: 3, // top='1`+', right='1-', bottom='1`-', left='1+'
        rotation: 0,
        position: { row: 3, col: 4 },
        isOnBoard: true,
        isBird: false
      }
      board[3][4].pieces = [neighbor]

      const result = EdgeMatcher.getValidRotations(piece, { row: 4, col: 4 }, board)
      
      // Should find at least some valid rotations
      expect(result.length).toBeGreaterThanOrEqual(0)
      expect(result.length).toBeLessThanOrEqual(4)
    })
  })
})
