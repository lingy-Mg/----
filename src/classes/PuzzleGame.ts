import { PuzzleBoard } from './PuzzleBoard'
import type { GameStatus } from '@/types/puzzle'

/**
 * 拼图游戏控制类
 * 负责游戏流程控制、计时、计分等
 */
export class PuzzleGame {
  private board: PuzzleBoard
  private startTime: number | null
  private moves: number
  private timeElapsed: number
  private timerInterval: number | null

  constructor() {
    this.board = new PuzzleBoard(4)
    this.startTime = null
    this.moves = 0
    this.timeElapsed = 0
    this.timerInterval = null
  }

  /**
   * 获取棋盘实例
   */
  getBoard(): PuzzleBoard {
    return this.board
  }

  /**
   * 开始游戏
   */
  start(): void {
    this.startTime = Date.now()
    this.moves = 0
    this.timeElapsed = 0
    this.startTimer()
  }

  /**
   * 开始计时
   */
  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }

    this.timerInterval = window.setInterval(() => {
      if (this.startTime) {
        this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000)
      }
    }, 1000)
  }

  /**
   * 停止计时
   */
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  /**
   * 执行移动
   */
  makeMove(pieceId: number, position: number): boolean {
    if (!this.startTime) {
      this.start()
    }

    const success = this.board.placePiece(pieceId, position)
    if (success) {
      this.moves++
      
      // 检查是否获胜
      if (this.board.getStatus() === 'won') {
        this.stopTimer()
      }
    }

    return success
  }

  /**
   * 获取移动次数
   */
  getMoves(): number {
    return this.moves
  }

  /**
   * 获取游戏时长（秒）
   */
  getTimeElapsed(): number {
    return this.timeElapsed
  }

  /**
   * 获取游戏状态
   */
  getStatus(): GameStatus {
    return this.board.getStatus()
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.stopTimer()
    this.board.reset()
    this.startTime = null
    this.moves = 0
    this.timeElapsed = 0
  }

  /**
   * 销毁游戏实例
   */
  destroy(): void {
    this.stopTimer()
  }
}
