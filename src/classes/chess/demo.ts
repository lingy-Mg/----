/**
 * Chess Game Demo
 * Demonstrates basic game engine usage
 */

import { GameEngine } from '@/classes/chess/GameEngine'
import { GameMode } from '@/types/chess'

/**
 * Run a demo game
 */
export function runChessDemo(): void {
  console.log('🎮 Starting Puzzle Chess Demo...\n')

  // Create game engine
  const engine = new GameEngine({
    mode: GameMode.PVP,
    boardSize: 8,
    piecesPerPlayer: 4
  })

  // Start game
  engine.startGame()
  console.log('✅ Game started!')
  console.log(`Current player: Player ${engine.getCurrentPlayer()}`)

  // Print board
  engine.getBoard().print()

  // Get game state
  const state = engine.getGameState()
  console.log(`\nPlayer 1 pieces: ${state.player1Pieces.length}`)
  console.log(`Player 2 pieces: ${state.player2Pieces.length}`)
  console.log(`Turn number: ${state.turnNumber}`)

  // Check possible moves
  const possibleMoves = engine.getPossibleMovesForCurrentPlayer()
  console.log(`\nPossible moves for current player: ${possibleMoves.length}`)

  if (possibleMoves.length > 0) {
    const firstMove = possibleMoves[0]
    console.log(`Example move: ${firstMove?.piece.id} from (${firstMove?.from?.row},${firstMove?.from?.col}) to (${firstMove?.to.row},${firstMove?.to.col})`)
  }

  console.log('\n✨ Demo completed!')
}

// Run demo if this file is executed directly
if (import.meta.env.DEV) {
  // runChessDemo()
}
