/**
 * Board - Chess Board Management System
 * Manages the 8x8 game board, piece placement, and zone definitions
 */

import type { BoardCell, ChessPiece, Position } from '@/types/chess'
import { Player, positionsEqual } from '@/types/chess'
import {
  BOARD_SIZE,
  PLAYER1_START_ROWS,
  PLAYER2_START_ROWS,
  PLAYER1_FINISH_ROWS,
  PLAYER2_FINISH_ROWS,
  isRowInStartZone,
  isRowInFinishZone
} from '@/constants/chess/board'

/**
 * Board class manages game board state
 */
export class Board {
  private cells: BoardCell[][]
  private size: number

  constructor(size: number = BOARD_SIZE) {
    this.size = size
    this.cells = this.initializeBoard()
  }

  /**
   * Initialize empty board with zone markers
   */
  private initializeBoard(): BoardCell[][] {
    const board: BoardCell[][] = []

    for (let row = 0; row < this.size; row++) {
      const boardRow: BoardCell[] = []
      
      for (let col = 0; col < this.size; col++) {
        const cell: BoardCell = {
          position: { row, col },
          pieces: [],
          isStartZone: {
            player1: isRowInStartZone(row, Player.PLAYER1),
            player2: isRowInStartZone(row, Player.PLAYER2)
          },
          isFinishZone: {
            player1: isRowInFinishZone(row, Player.PLAYER1),
            player2: isRowInFinishZone(row, Player.PLAYER2)
          }
        }
        boardRow.push(cell)
      }
      
      board.push(boardRow)
    }

    return board
  }

  /**
   * Get board size
   */
  getSize(): number {
    return this.size
  }

  /**
   * Get all cells
   */
  getCells(): BoardCell[][] {
    return this.cells
  }

  /**
   * Get cell at position
   */
  getCell(position: Position): BoardCell | null {
    if (!this.isValidPosition(position)) {
      return null
    }
    return this.cells[position.row]?.[position.col] ?? null
  }

  /**
   * Get all pieces at position
   */
  getPiecesAt(position: Position): ChessPiece[] {
    const cell = this.getCell(position)
    return cell ? cell.pieces : []
  }

  /**
   * Check if position is valid
   */
  isValidPosition(position: Position): boolean {
    return (
      position.row >= 0 &&
      position.row < this.size &&
      position.col >= 0 &&
      position.col < this.size
    )
  }

  /**
   * Check if position is in a player's start zone
   */
  isInStartZone(position: Position, player: Player): boolean {
    const cell = this.getCell(position)
    if (!cell) return false
    
    return player === Player.PLAYER1 
      ? cell.isStartZone.player1 
      : cell.isStartZone.player2
  }

  /**
   * Check if position is in a player's finish zone
   */
  isInFinishZone(position: Position, player: Player): boolean {
    const cell = this.getCell(position)
    if (!cell) return false
    
    return player === Player.PLAYER1 
      ? cell.isFinishZone.player1 
      : cell.isFinishZone.player2
  }

  /**
   * Place a piece at a position
   * Supports stacking multiple pieces
   */
  placePiece(piece: ChessPiece, position: Position): boolean {
    const cell = this.getCell(position)
    if (!cell) return false

    // Add piece to cell (stacking)
    cell.pieces.push(piece)
    
    // Update piece state
    piece.position = position
    piece.isOnBoard = true

    return true
  }

  /**
   * Remove a piece from a position
   */
  removePiece(piece: ChessPiece, position: Position): boolean {
    const cell = this.getCell(position)
    if (!cell) return false

    const index = cell.pieces.findIndex(p => p.id === piece.id)
    if (index === -1) return false

    // Remove piece from cell
    cell.pieces.splice(index, 1)
    
    // Update piece state
    piece.position = null
    piece.isOnBoard = false

    return true
  }

  /**
   * Move a piece from one position to another
   */
  movePiece(piece: ChessPiece, from: Position, to: Position): boolean {
    // Remove from old position
    if (!this.removePiece(piece, from)) {
      return false
    }

    // Place at new position
    if (!this.placePiece(piece, to)) {
      // Restore old position if placement fails
      this.placePiece(piece, from)
      return false
    }

    return true
  }

  /**
   * Get all cells in a zone
   */
  getCellsInZone(zone: 'start' | 'finish', player: Player): BoardCell[] {
    const cells: BoardCell[] = []
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.cells[row]?.[col]
        if (!cell) continue

        const inZone = zone === 'start'
          ? (player === Player.PLAYER1 ? cell.isStartZone.player1 : cell.isStartZone.player2)
          : (player === Player.PLAYER1 ? cell.isFinishZone.player1 : cell.isFinishZone.player2)

        if (inZone) {
          cells.push(cell)
        }
      }
    }

    return cells
  }

  /**
   * Get all pieces on the board
   */
  getAllPieces(): ChessPiece[] {
    const pieces: ChessPiece[] = []
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.cells[row]?.[col]
        if (cell) {
          pieces.push(...cell.pieces)
        }
      }
    }

    return pieces
  }

  /**
   * Get all pieces for a specific player
   */
  getPlayerPieces(player: Player): ChessPiece[] {
    return this.getAllPieces().filter(p => p.player === player)
  }

  /**
   * Check if a cell is empty
   */
  isEmpty(position: Position): boolean {
    const cell = this.getCell(position)
    return cell ? cell.pieces.length === 0 : true
  }

  /**
   * Clear all pieces from the board
   */
  clear(): void {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.cells[row]?.[col]
        if (cell) {
          cell.pieces = []
        }
      }
    }
  }

  /**
   * Clone the board (deep copy)
   */
  clone(): Board {
    const newBoard = new Board(this.size)
    
    // Copy all pieces
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.cells[row]?.[col]
        if (cell && cell.pieces.length > 0) {
          const newCell = newBoard.cells[row]?.[col]
          if (newCell) {
            newCell.pieces = cell.pieces.map(p => ({ ...p }))
          }
        }
      }
    }

    return newBoard
  }

  /**
   * Get board state as 2D array (for display/debugging)
   */
  toArray(): (ChessPiece[] | null)[][] {
    const arr: (ChessPiece[] | null)[][] = []
    
    for (let row = 0; row < this.size; row++) {
      const rowArray: (ChessPiece[] | null)[] = []
      
      for (let col = 0; col < this.size; col++) {
        const cell = this.cells[row]?.[col]
        rowArray.push(cell ? cell.pieces : null)
      }
      
      arr.push(rowArray)
    }

    return arr
  }

  /**
   * Print board to console (for debugging)
   */
  print(): void {
    console.log('Board State:')
    console.log('  ', Array.from({ length: this.size }, (_, i) => i).join(' '))
    
    for (let row = 0; row < this.size; row++) {
      let rowStr = `${row} `
      
      for (let col = 0; col < this.size; col++) {
        const cell = this.cells[row]?.[col]
        if (!cell || cell.pieces.length === 0) {
          rowStr += '· '
        } else {
          const piece = cell.pieces[0]!
          const symbol = piece.player === Player.PLAYER1 ? '○' : '●'
          rowStr += `${symbol} `
        }
      }
      
      console.log(rowStr)
    }
  }
}
