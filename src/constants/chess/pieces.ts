/**
 * Chess Pieces Constants
 * Defines the 4 base piece shapes with their edge configurations
 */

import type { PieceShape, EdgeType } from '@/types/chess'

/**
 * Piece 1 Shape Configuration
 * SVG: piece1.svg
 * 
 * Edge Pattern:
 *     1-
 *  1- [] 1`-
 *     1`-
 */
export const PIECE_1: PieceShape = {
  id: 1,
  name: 'Piece 1',
  edges: {
    top: '1-',
    right: '1`-',
    bottom: '1`-',
    left: '1-'
  },
  svgPath: '/src/assets/pieces/piece1.svg'
}

/**
 * Piece 2 Shape Configuration
 * SVG: piece2.svg
 * 
 * Edge Pattern:
 *      1+
 *  1`+ [] 1-
 *      1`-
 */
export const PIECE_2: PieceShape = {
  id: 2,
  name: 'Piece 2',
  edges: {
    top: '1+',
    right: '1-',
    bottom: '1`-',
    left: '1`+'
  },
  svgPath: '/src/assets/pieces/piece2.svg'
}

/**
 * Piece 3 Shape Configuration
 * SVG: piece3.svg
 * 
 * Edge Pattern:
 *     1`+
 *  1+ [] 1-
 *     1`-
 */
export const PIECE_3: PieceShape = {
  id: 3,
  name: 'Piece 3',
  edges: {
    top: '1`+',
    right: '1-',
    bottom: '1`-',
    left: '1+'
  },
  svgPath: '/src/assets/pieces/piece3.svg'
}

/**
 * Piece 4 Shape Configuration
 * SVG: piece4.svg
 * 
 * Edge Pattern:
 *     1`+
 *  1+ [] 1+
 *     1`+
 */
export const PIECE_4: PieceShape = {
  id: 4,
  name: 'Piece 4',
  edges: {
    top: '1`+',
    right: '1+',
    bottom: '1`+',
    left: '1+'
  },
  svgPath: '/src/assets/pieces/piece4.svg'
}

/**
 * All piece shapes indexed by ID
 */
export const PIECE_SHAPES: Record<number, PieceShape> = {
  1: PIECE_1,
  2: PIECE_2,
  3: PIECE_3,
  4: PIECE_4
}

/**
 * Edge matching rules
 * Key: edge type -> Value: matching edge type
 */
export const EDGE_MATCH_MAP: Record<EdgeType, EdgeType> = {
  '1+': '1-',
  '1-': '1+',
  '1`+': '1`-',
  '1`-': '1`+'
}

/**
 * Get the shape definition by ID
 */
export function getPieceShape(shapeId: number): PieceShape {
  const shape = PIECE_SHAPES[shapeId]
  if (!shape) {
    throw new Error(`Invalid piece shape ID: ${shapeId}`)
  }
  return shape
}

/**
 * Get all valid shape IDs
 */
export function getValidShapeIds(): number[] {
  return [1, 2, 3, 4]
}

/**
 * Validate if a shape ID is valid
 */
export function isValidShapeId(shapeId: number): boolean {
  return shapeId >= 1 && shapeId <= 4
}
