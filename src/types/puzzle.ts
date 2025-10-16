// 拼图块接口
export interface PuzzlePiece {
  id: number // 拼图块ID (1-4)
  currentPosition: number // 当前位置 (0-15)
  isPlaced: boolean // 是否已放置在棋盘上
}

// 棋盘单元格接口
export interface BoardCell {
  position: number // 位置索引 (0-15)
  piece: PuzzlePiece | null // 当前位置的拼图块
  isDropZone: boolean // 是否可放置区域
}

// 游戏状态
export enum GameStatus {
  IDLE = 'idle',
  PLAYING = 'playing',
  WON = 'won'
}
