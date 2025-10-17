/**
 * Chess Board Constants
 * Board configuration and zone definitions
 */

import { Player } from '@/types/chess'

/**
 * Standard board size (4x4)
 */
export const BOARD_SIZE = 4

/**
 * Number of pieces per player
 */
export const PIECES_PER_PLAYER = 4

/**
 * Player 1 start zone rows (bottom 1 row)
 */
export const PLAYER1_START_ROWS = [3]

/**
 * Player 2 start zone rows (top 1 row)
 */
export const PLAYER2_START_ROWS = [0]

/**
 * Player 1 finish zone rows (opponent's start = Player 2's start)
 */
export const PLAYER1_FINISH_ROWS = PLAYER2_START_ROWS

/**
 * Player 2 finish zone rows (opponent's start = Player 1's start)
 */
export const PLAYER2_FINISH_ROWS = PLAYER1_START_ROWS

/**
 * Movement rules
 */
export const MIN_MOVE_STEPS = 1
export const MAX_MOVE_STEPS = 3

/**
 * When rotating, can only move this many steps
 */
export const ROTATE_MOVE_LIMIT = 1

/**
 * Maximum consecutive passes allowed
 */
export const MAX_CONSECUTIVE_PASSES = 1

/**
 * Check if a row is in player's start zone
 */
export function isRowInStartZone(row: number, player: Player): boolean {
  const startRows = player === Player.PLAYER1 ? PLAYER1_START_ROWS : PLAYER2_START_ROWS
  return startRows.includes(row)
}

/**
 * Check if a row is in player's finish zone
 */
export function isRowInFinishZone(row: number, player: Player): boolean {
  const finishRows = player === Player.PLAYER1 ? PLAYER1_FINISH_ROWS : PLAYER2_FINISH_ROWS
  return finishRows.includes(row)
}

/**
 * Get start rows for a player
 */
export function getStartRows(player: Player): number[] {
  return player === Player.PLAYER1 ? PLAYER1_START_ROWS : PLAYER2_START_ROWS
}

/**
 * Get finish rows for a player
 */
export function getFinishRows(player: Player): number[] {
  return player === Player.PLAYER1 ? PLAYER1_FINISH_ROWS : PLAYER2_FINISH_ROWS
}

/**
 * Default game configuration
 */
export const DEFAULT_GAME_CONFIG = {
  boardSize: BOARD_SIZE,
  piecesPerPlayer: PIECES_PER_PLAYER,
  maxMoveSteps: MAX_MOVE_STEPS,
  rotateStepLimit: ROTATE_MOVE_LIMIT,
  allowPassTwice: false
}

/**
 * Board display configuration
 */
export const BOARD_DISPLAY = {
  cellSize: 100,          // px (larger for 4x4)
  gridColor: '#ffffff',
  backgroundColor: '#c62828', // Deep red background
  startZoneColor: 'rgba(255,255,255,0.1)',
  finishZoneColor: 'rgba(255,255,255,0.2)',
  highlightColor: '#4caf50',
  selectedColor: '#ffd700',
  threatColor: '#f44336',
  borderColor: '#ffffff'
}

/**
 * Player colors
 */
export const PLAYER_COLORS = {
  [Player.PLAYER1]: '#2196f3', // Blue
  [Player.PLAYER2]: '#f44336'  // Red
}

/**
 * Rotation angles array
 */
export const ROTATION_ANGLES = [0, 90, 180, 270] as const
