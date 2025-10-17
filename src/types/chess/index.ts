/**
 * Chess Game Type Definitions
 * Phase 2: Puzzle Chess Board Game
 */

// ============ Edge System ============

/**
 * Edge type for puzzle piece matching
 * 1+  : Convex edge (forward)
 * 1-  : Concave edge (forward)
 * 1`+ : Convex edge (backward)
 * 1`- : Concave edge (backward)
 */
export type EdgeType = '1+' | '1-' | '1`+' | '1`-'

/**
 * Edge sides of a piece
 */
export type EdgeSide = 'top' | 'right' | 'bottom' | 'left'

/**
 * Edges configuration for a piece
 */
export interface Edges {
  top: EdgeType
  right: EdgeType
  bottom: EdgeType
  left: EdgeType
}

// ============ Rotation System ============

/**
 * Rotation angles in degrees
 */
export type Rotation = 0 | 90 | 180 | 270

// ============ Player System ============

/**
 * Player identification
 */
export enum Player {
  PLAYER1 = 1,
  PLAYER2 = 2
}

/**
 * Game mode
 */
export enum GameMode {
  PVP = 'pvp', // Player vs Player
  PVE = 'pve'  // Player vs AI
}

// ============ Direction System ============

/**
 * 8 movement directions (4 orthogonal + 4 diagonal)
 */
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  UP_LEFT = 'up_left',
  UP_RIGHT = 'up_right',
  DOWN_LEFT = 'down_left',
  DOWN_RIGHT = 'down_right'
}

/**
 * Direction vector for calculation
 */
export interface DirectionVector {
  row: number
  col: number
}

/**
 * Mapping of directions to vectors
 */
export const DIRECTION_VECTORS: Record<Direction, DirectionVector> = {
  [Direction.UP]: { row: -1, col: 0 },
  [Direction.DOWN]: { row: 1, col: 0 },
  [Direction.LEFT]: { row: 0, col: -1 },
  [Direction.RIGHT]: { row: 0, col: 1 },
  [Direction.UP_LEFT]: { row: -1, col: -1 },
  [Direction.UP_RIGHT]: { row: -1, col: 1 },
  [Direction.DOWN_LEFT]: { row: 1, col: -1 },
  [Direction.DOWN_RIGHT]: { row: 1, col: 1 }
}

/**
 * Mapping of directions to opposite edge sides
 */
export const DIRECTION_TO_EDGE: Record<Direction, { from: EdgeSide; to: EdgeSide }> = {
  [Direction.UP]: { from: 'top', to: 'bottom' },
  [Direction.DOWN]: { from: 'bottom', to: 'top' },
  [Direction.LEFT]: { from: 'left', to: 'right' },
  [Direction.RIGHT]: { from: 'right', to: 'left' },
  [Direction.UP_LEFT]: { from: 'top', to: 'bottom' },    // Diagonal: use vertical
  [Direction.UP_RIGHT]: { from: 'top', to: 'bottom' },
  [Direction.DOWN_LEFT]: { from: 'bottom', to: 'top' },
  [Direction.DOWN_RIGHT]: { from: 'bottom', to: 'top' }
}

// ============ Position System ============

/**
 * Board position using row/col coordinates
 */
export interface Position {
  row: number // 0-7 (top to bottom)
  col: number // 0-7 (left to right)
}

// ============ Piece System ============

/**
 * Piece shape definition (template)
 */
export interface PieceShape {
  id: number         // Shape ID: 1-4
  name: string       // Shape name for display
  edges: Edges       // Edge configuration at 0° rotation
  svgPath: string    // SVG file path
}

/**
 * Chess piece instance (game piece)
 */
export interface ChessPiece {
  id: string              // Unique ID: "p1-piece1-0"
  player: Player          // Owner: Player 1 or 2
  shapeId: number         // Shape ID: 1-4
  rotation: Rotation      // Current rotation: 0/90/180/270
  position: Position | null  // Current position (null if not on board)
  isOnBoard: boolean      // Whether placed on board
  isBird: boolean         // Special ability flag (future feature)
}

// ============ Board System ============

/**
 * Zone markers for a cell
 */
export interface ZoneMarkers {
  player1: boolean  // Player 1's zone
  player2: boolean  // Player 2's zone
}

/**
 * Board cell (can contain stacked pieces)
 */
export interface BoardCell {
  position: Position
  pieces: ChessPiece[]     // Stack of pieces
  isStartZone: ZoneMarkers // Start zone markers
  isFinishZone: ZoneMarkers // Finish zone markers
}

// ============ Move System ============

/**
 * Move action
 */
export interface Move {
  piece: ChessPiece
  from: Position | null     // null if placing from hand
  to: Position
  steps: number             // Number of cells: 1-3
  needRotation: boolean     // Whether rotation required
  newRotation?: Rotation    // New rotation if changed
  canFit: boolean           // Whether can fit at destination
  timestamp?: number        // Move timestamp
}

/**
 * Move validation result
 */
export interface MoveValidation {
  valid: boolean
  reason?: string           // Failure reason
  possibleMoves?: Position[] // Alternative valid positions
}

/**
 * Fit check result (edge matching result)
 */
export interface FitCheckResult {
  canFit: boolean
  matchingPieces: ChessPiece[]  // Pieces that fit
  matchingEdges: EdgeMatchInfo[] // Edge matching details
}

/**
 * Edge matching information
 */
export interface EdgeMatchInfo {
  direction: Direction
  myEdge: EdgeType
  theirEdge: EdgeType
  neighborPiece: ChessPiece
}

// ============ Game State ============

/**
 * Threat information
 */
export interface ThreatInfo {
  threatenedPiece: ChessPiece  // Piece being threatened
  threateningPlayer: Player     // Player making threat
  mustResolve: boolean          // Whether must resolve
}

/**
 * 玩家统计信息
 */
export interface PlayerStats {
  totalMoves: number           // 总移动次数
  totalUndos: number           // 总悔棋次数
  consecutiveUndos: number     // 连续悔棋次数
  totalPasses: number          // 总跳过次数
}

/**
 * 游戏状态
 */
export interface GameState {
  mode: GameMode
  currentPlayer: Player
  board: BoardCell[][]          // 棋盘（4×4 或 8×8）
  player1Pieces: ChessPiece[]   // 玩家1的棋子
  player2Pieces: ChessPiece[]   // 玩家2的棋子
  moveHistory: Move[]           // 移动历史
  passCount: {                  // 跳过次数
    player1: number
    player2: number
  }
  player1Stats: PlayerStats     // 玩家1统计
  player2Stats: PlayerStats     // 玩家2统计
  winner: Player | null         // 获胜者
  threatInfo: ThreatInfo | null // 威胁信息（未使用）
  turnNumber: number            // 回合数
  gameStartTime: number         // 游戏开始时间戳
}

/**
 * Game configuration
 */
export interface GameConfig {
  mode: GameMode
  boardSize: number             // Default: 8
  piecesPerPlayer: number       // Default: 4
  maxMoveSteps: number          // Default: 3
  rotateStepLimit: number       // Default: 1 (when rotating)
  allowPassTwice: boolean       // Default: false
}

// ============ AI System ============

/**
 * AI difficulty levels
 */
export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

/**
 * AI evaluation result
 */
export interface AIEvaluation {
  score: number                 // Position score
  bestMove: Move | null
  depth: number                 // Search depth
  nodesEvaluated: number        // Nodes evaluated
}

// ============ Utility Types ============

/**
 * Helper to check if position is valid
 */
export function isValidPosition(pos: Position, boardSize: number = 8): boolean {
  return pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize
}

/**
 * Helper to check if two positions are equal
 */
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col
}

/**
 * Helper to generate unique piece ID
 */
export function generatePieceId(player: Player, shapeId: number, index: number): string {
  return `p${player}-piece${shapeId}-${index}`
}
