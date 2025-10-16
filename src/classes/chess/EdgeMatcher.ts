/**
 * EdgeMatcher - Edge Matching Algorithm
 * Core algorithm for checking if puzzle pieces can fit together
 */

import type {
  EdgeType,
  EdgeSide,
  Edges,
  Rotation,
  ChessPiece,
  Position,
  BoardCell,
  FitCheckResult,
  EdgeMatchInfo,
  Direction
} from '@/types/chess'
import { DIRECTION_TO_EDGE, Direction as DirectionEnum } from '@/types/chess'
import { EDGE_MATCH_MAP, getPieceShape } from '@/constants/chess/pieces'

/**
 * EdgeMatcher class handles all edge matching logic
 */
export class EdgeMatcher {
  /**
   * Check if two edges can match (fit together)
   * 
   * Matching rules:
   * - 1+  matches 1-   (convex fits concave)
   * - 1`+ matches 1`-  (reverse convex fits reverse concave)
   * - Different types don't match
   * 
   * @param edge1 First edge type
   * @param edge2 Second edge type
   * @returns true if edges can match
   */
  static canMatch(edge1: EdgeType, edge2: EdgeType): boolean {
    return EDGE_MATCH_MAP[edge1] === edge2
  }

  /**
   * Get the edge type after rotation
   * 
   * When a piece rotates:
   * - 0°:   edges stay in original positions
   * - 90°:  top -> right, right -> bottom, bottom -> left, left -> top
   * - 180°: top -> bottom, right -> left, bottom -> top, left -> right
   * - 270°: top -> left, right -> top, bottom -> right, left -> bottom
   * 
   * @param edges Original edges configuration
   * @param side Which side to get
   * @param rotation Rotation angle
   * @returns Edge type after rotation
   */
  static getRotatedEdge(edges: Edges, side: EdgeSide, rotation: Rotation): EdgeType {
    // Calculate which original side maps to requested side after rotation
    const sides: EdgeSide[] = ['top', 'right', 'bottom', 'left']
    const sideIndex = sides.indexOf(side)
    const rotationSteps = rotation / 90
    
    // Rotate backwards to find original side
    // e.g., if asking for 'right' after 90° rotation, it came from 'top'
    const originalSideIndex = (sideIndex - rotationSteps + 4) % 4
    const originalSide = sides[originalSideIndex] as EdgeSide
    
    return edges[originalSide]
  }

  /**
   * Get the opposite edge side
   * Used when checking neighbor connections
   * 
   * @param side Edge side
   * @returns Opposite side
   */
  static getOppositeSide(side: EdgeSide): EdgeSide {
    const opposites: Record<EdgeSide, EdgeSide> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left'
    }
    return opposites[side]
  }

  /**
   * Get neighbor position in a direction
   * 
   * @param position Current position
   * @param direction Direction to move
   * @returns Neighbor position
   */
  static getNeighborPosition(position: Position, direction: Direction): Position {
    const vectors = {
      [DirectionEnum.UP]: { row: -1, col: 0 },
      [DirectionEnum.DOWN]: { row: 1, col: 0 },
      [DirectionEnum.LEFT]: { row: 0, col: -1 },
      [DirectionEnum.RIGHT]: { row: 0, col: 1 },
      [DirectionEnum.UP_LEFT]: { row: -1, col: -1 },
      [DirectionEnum.UP_RIGHT]: { row: -1, col: 1 },
      [DirectionEnum.DOWN_LEFT]: { row: 1, col: -1 },
      [DirectionEnum.DOWN_RIGHT]: { row: 1, col: 1 }
    }

    const vector = vectors[direction]
    return {
      row: position.row + vector.row,
      col: position.col + vector.col
    }
  }

  /**
   * Check if a piece can fit at a position
   * Tests matching against all neighboring pieces
   * 
   * @param piece Chess piece to check
   * @param position Target position
   * @param board Game board
   * @param rotation Rotation to test (uses piece's current rotation if not specified)
   * @returns Fit check result with matching details
   */
  static checkFit(
    piece: ChessPiece,
    position: Position,
    board: BoardCell[][],
    rotation?: Rotation
  ): FitCheckResult {
    const testRotation = rotation ?? piece.rotation
    const shape = getPieceShape(piece.shapeId)
    const matchingEdges: EdgeMatchInfo[] = []
    const matchingPieces: ChessPiece[] = []

    // Check all 4 orthogonal directions (up, right, down, left)
    const directionsToCheck: Direction[] = [
      DirectionEnum.UP,
      DirectionEnum.RIGHT,
      DirectionEnum.DOWN,
      DirectionEnum.LEFT
    ]

    for (const direction of directionsToCheck) {
      const neighborPos = this.getNeighborPosition(position, direction)

      // Check if neighbor position is valid
      if (
        neighborPos.row < 0 ||
        neighborPos.row >= board.length ||
        neighborPos.col < 0 ||
        neighborPos.col >= (board[0]?.length ?? 0)
      ) {
        continue
      }

      const neighborCell = board[neighborPos.row]?.[neighborPos.col]
      
      // Skip if no cell or no pieces at neighbor
      if (!neighborCell || neighborCell.pieces.length === 0) {
        continue
      }

      // Get edge info for this direction
      const edgeInfo = DIRECTION_TO_EDGE[direction]
      const myEdge = this.getRotatedEdge(shape.edges, edgeInfo.from, testRotation)

      // Check against all pieces in neighbor cell (stacking support)
      for (const neighborPiece of neighborCell.pieces) {
        const neighborShape = getPieceShape(neighborPiece.shapeId)
        const theirEdge = this.getRotatedEdge(
          neighborShape.edges,
          edgeInfo.to,
          neighborPiece.rotation
        )

        // Test if edges match
        if (this.canMatch(myEdge, theirEdge)) {
          matchingEdges.push({
            direction,
            myEdge,
            theirEdge,
            neighborPiece
          })

          // Add to matching pieces (avoid duplicates)
          if (!matchingPieces.find(p => p.id === neighborPiece.id)) {
            matchingPieces.push(neighborPiece)
          }
        }
      }
    }

    return {
      canFit: matchingEdges.length > 0,
      matchingPieces,
      matchingEdges
    }
  }

  /**
   * Get all valid rotations for a piece at a position
   * Returns rotations where the piece can fit
   * 
   * @param piece Chess piece
   * @param position Target position
   * @param board Game board
   * @returns Array of valid rotations
   */
  static getValidRotations(
    piece: ChessPiece,
    position: Position,
    board: BoardCell[][]
  ): Rotation[] {
    const validRotations: Rotation[] = []
    const rotations: Rotation[] = [0, 90, 180, 270]

    for (const rotation of rotations) {
      const fitResult = this.checkFit(piece, position, board, rotation)
      if (fitResult.canFit) {
        validRotations.push(rotation)
      }
    }

    return validRotations
  }

  /**
   * Check if a specific edge connection exists between two positions
   * 
   * @param position1 First position
   * @param position2 Second position
   * @param board Game board
   * @returns true if edges match
   */
  static arePositionsConnected(
    position1: Position,
    position2: Position,
    board: BoardCell[][]
  ): boolean {
    // Determine direction from position1 to position2
    const rowDiff = position2.row - position1.row
    const colDiff = position2.col - position1.col

    // Must be adjacent (orthogonal only)
    if (Math.abs(rowDiff) + Math.abs(colDiff) !== 1) {
      return false
    }

    let direction: Direction
    if (rowDiff === -1) direction = DirectionEnum.UP
    else if (rowDiff === 1) direction = DirectionEnum.DOWN
    else if (colDiff === -1) direction = DirectionEnum.LEFT
    else direction = DirectionEnum.RIGHT

    const cell1 = board[position1.row]?.[position1.col]
    const cell2 = board[position2.row]?.[position2.col]

    if (!cell1 || !cell2 || cell1.pieces.length === 0 || cell2.pieces.length === 0) {
      return false
    }

    const edgeInfo = DIRECTION_TO_EDGE[direction]

    // Check if any pieces from cell1 match with any from cell2
    for (const piece1 of cell1?.pieces ?? []) {
      const shape1 = getPieceShape(piece1.shapeId)
      const edge1 = this.getRotatedEdge(shape1.edges, edgeInfo.from, piece1.rotation)

      for (const piece2 of cell2?.pieces ?? []) {
        const shape2 = getPieceShape(piece2.shapeId)
        const edge2 = this.getRotatedEdge(shape2.edges, edgeInfo.to, piece2.rotation)

        if (this.canMatch(edge1, edge2)) {
          return true
        }
      }
    }

    return false
  }
}
