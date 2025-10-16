# 拼图棋游戏 - 完整设计文档

## 项目概述

### 游戏简介
拼图棋是一款创新的双人策略棋类游戏，玩家通过移动和旋转拼图形状的棋子，在棋盘上进行对弈。棋子之间必须像拼图一样完美贴合，通过策略性的布局和移动，率先将所有棋子移动到对方的终点线即可获胜。

### 核心特点
- 🎮 双人对弈（PvP / PvE）
- 🧩 独特的拼图形状匹配机制
- 🔄 棋子可旋转（0°/90°/180°/270°）
- ♟️ 8向移动（直线+对角线）
- 🎯 策略性强，规则丰富

---

## 一、核心概念设计

### 1.1 棋子形状系统

#### 边缘状态定义
每个棋子有 4 个边（上/右/下/左），每条边有 4 种状态：

```
1+   : 凸出边（正向）
1-   : 凹入边（正向）
1`+  : 凸出边（反向）
1`-  : 凹入边（反向）
```

#### 拼接匹配规则
```typescript
// 边缘匹配逻辑
1+  匹配 1-   （凸凹互补）
1`+ 匹配 1`-  （反向凸凹互补）
1+  不匹配 1`-（不同类型）
1-  不匹配 1`+（不同类型）
```

#### 4 种基础棋子形状

**棋子1（资源1.svg）**
```
上:  1-
右:  1`-
下:  1`-
左:  1-
```

**棋子2（资源2.svg）**
```
上:  1+
右:  1-
下:  1`-
左:  1`+
```

**棋子3（资源3.svg）**
```
上:  1`+
右:  1-
下:  1`-
左:  1+
```

**棋子4（资源4.svg）**
```
上:  1`+
右:  1+
下:  1`+
左:  1+
```

### 1.2 棋盘系统

#### 棋盘布局
```
标准棋盘: 4x4 格子（已更新）

玩家1起始区域（顶部1行）:
  □ □ □ □
  ─────────
  空白对弈区域
  ─────────
  ■ ■ ■ ■
玩家2起始区域（底部1行）

□ = 玩家1的棋子/终点
■ = 玩家2的棋子/终点

注：原设计为8x8棋盘，已更新为4x4以匹配实际游戏图片
```

#### 坐标系统
```typescript
// 使用行列坐标系
interface Position {
  row: number    // 0-3 (从上到下) - 已从0-7更新
  col: number    // 0-3 (从左到右) - 已从0-7更新
}
```

### 1.3 移动方向系统

#### 8个移动方向
```typescript
enum Direction {
  UP = 'up',           // 上 (-1, 0)
  DOWN = 'down',       // 下 (+1, 0)
  LEFT = 'left',       // 左 (0, -1)
  RIGHT = 'right',     // 右 (0, +1)
  UP_LEFT = 'up_left',       // 左上 (-1, -1)
  UP_RIGHT = 'up_right',     // 右上 (-1, +1)
  DOWN_LEFT = 'down_left',   // 左下 (+1, -1)
  DOWN_RIGHT = 'down_right'  // 右下 (+1, +1)
}
```

#### 边缘关系映射
```typescript
// 从当前棋子的哪个边离开，到达目标棋子的哪个边
Direction.UP    -> 从上边离开 -> 到达目标的下边
Direction.DOWN  -> 从下边离开 -> 到达目标的上边
Direction.LEFT  -> 从左边离开 -> 到达目标的右边
Direction.RIGHT -> 从右边离开 -> 到达目标的左边
```

---

## 二、数据结构设计

### 2.1 核心类型定义

```typescript
// 边缘类型
type EdgeType = '1+' | '1-' | '1`+' | '1`-'

// 旋转角度
type Rotation = 0 | 90 | 180 | 270

// 玩家
enum Player {
  PLAYER1 = 1,
  PLAYER2 = 2
}

// 游戏模式
enum GameMode {
  PVP = 'pvp',  // 玩家对玩家
  PVE = 'pve'   // 玩家对AI
}

// 棋子形状定义
interface PieceShape {
  id: number           // 1-4 对应资源
  edges: {
    top: EdgeType
    right: EdgeType
    bottom: EdgeType
    left: EdgeType
  }
}

// 棋子实例
interface Piece {
  id: string           // 唯一标识 "p1-piece1-0"
  player: Player       // 所属玩家
  shapeId: number      // 形状ID (1-4)
  rotation: Rotation   // 当前旋转角度
  position: Position   // 当前位置
  isOnBoard: boolean   // 是否已在棋盘上
  isBird: boolean      // 是否为鸟类棋子（特殊能力）
}

// 棋盘格子
interface Cell {
  position: Position
  pieces: Piece[]      // 可以堆叠多个棋子
  isStartZone: {       // 是否为起始区域
    player1: boolean
    player2: boolean
  }
  isFinishZone: {      // 是否为终点区域
    player1: boolean
    player2: boolean
  }
}

// 移动动作
interface Move {
  piece: Piece
  from: Position
  to: Position
  steps: number        // 移动格数 (1/2/3)
  needRotation: boolean // 是否需要旋转
  newRotation?: Rotation
  canFit: boolean      // 是否能拼接
}

// 游戏状态
interface GameState {
  mode: GameMode
  currentPlayer: Player
  board: Cell[][]      // 8x8 棋盘
  player1Pieces: Piece[]
  player2Pieces: Piece[]
  moveHistory: Move[]
  passCount: {         // 跳过计数
    player1: number
    player2: number
  }
  winner: Player | null
  threatInfo: ThreatInfo | null
}

// 威胁信息
interface ThreatInfo {
  threatenedPiece: Piece
  threateningPlayer: Player
  mustResolve: boolean
}
```

### 2.2 辅助类型

```typescript
// 移动验证结果
interface MoveValidation {
  valid: boolean
  reason?: string      // 失败原因
  possibleMoves?: Position[]  // 可能的移动位置
}

// AI难度
enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// 拼接检查结果
interface FitCheckResult {
  canFit: boolean
  matchingPieces: Piece[]  // 匹配的棋子
  matchingEdges: {
    direction: Direction
    myEdge: EdgeType
    theirEdge: EdgeType
  }[]
}
```

---

## 三、核心算法设计

### 3.1 边缘匹配算法

```typescript
class EdgeMatcher {
  /**
   * 检查两条边是否匹配
   */
  static canMatch(edge1: EdgeType, edge2: EdgeType): boolean {
    const matchMap: Record<EdgeType, EdgeType> = {
      '1+': '1-',
      '1-': '1+',
      '1`+': '1`-',
      '1`-': '1`+'
    }
    return matchMap[edge1] === edge2
  }

  /**
   * 获取旋转后的边缘
   */
  static getRotatedEdge(
    shape: PieceShape, 
    side: 'top' | 'right' | 'bottom' | 'left',
    rotation: Rotation
  ): EdgeType {
    const sideIndex = ['top', 'right', 'bottom', 'left'].indexOf(side)
    const rotationSteps = rotation / 90
    const newSideIndex = (sideIndex - rotationSteps + 4) % 4
    const newSide = ['top', 'right', 'bottom', 'left'][newSideIndex]
    return shape.edges[newSide]
  }

  /**
   * 检查棋子在某位置是否能与周围棋子拼接
   */
  static checkFit(
    piece: Piece,
    position: Position,
    board: Cell[][],
    rotation: Rotation
  ): FitCheckResult {
    const shape = PIECE_SHAPES[piece.shapeId]
    const directions = [
      { dir: Direction.UP, mySide: 'top', theirSide: 'bottom' },
      { dir: Direction.RIGHT, mySide: 'right', theirSide: 'left' },
      { dir: Direction.DOWN, mySide: 'bottom', theirSide: 'top' },
      { dir: Direction.LEFT, mySide: 'left', theirSide: 'right' }
    ]

    const matches = []
    
    for (const { dir, mySide, theirSide } of directions) {
      const neighborPos = getNeighborPosition(position, dir)
      if (!isValidPosition(neighborPos, board)) continue

      const neighborCell = board[neighborPos.row][neighborPos.col]
      if (neighborCell.pieces.length === 0) continue

      const myEdge = this.getRotatedEdge(shape, mySide, rotation)
      
      for (const neighborPiece of neighborCell.pieces) {
        const neighborShape = PIECE_SHAPES[neighborPiece.shapeId]
        const theirEdge = this.getRotatedEdge(
          neighborShape, 
          theirSide, 
          neighborPiece.rotation
        )

        if (this.canMatch(myEdge, theirEdge)) {
          matches.push({
            direction: dir,
            myEdge,
            theirEdge,
            piece: neighborPiece
          })
        }
      }
    }

    return {
      canFit: matches.length > 0,
      matchingPieces: matches.map(m => m.piece),
      matchingEdges: matches
    }
  }
}
```

### 3.2 移动验证算法

```typescript
class MoveValidator {
  /**
   * 验证移动是否合法
   */
  static validateMove(
    piece: Piece,
    toPosition: Position,
    board: Cell[][],
    newRotation?: Rotation
  ): MoveValidation {
    // 1. 检查目标位置是否有效
    if (!isValidPosition(toPosition, board)) {
      return { valid: false, reason: '目标位置超出棋盘' }
    }

    // 2. 计算移动步数和方向
    const from = piece.position
    const distance = this.calculateDistance(from, toPosition)
    const direction = this.getDirection(from, toPosition)

    // 3. 检查移动步数限制
    if (distance < 1 || distance > 3) {
      return { valid: false, reason: '移动步数必须为1-3格' }
    }

    // 4. 检查是否需要旋转
    const needsRotation = newRotation !== undefined && 
                          newRotation !== piece.rotation
    
    if (needsRotation && distance > 1) {
      return { valid: false, reason: '旋转时只能移动1格' }
    }

    // 5. 检查路径是否可通过（允许堆叠）
    const path = this.getPath(from, toPosition, direction)
    // 注意：根据规则，棋子可以越过其他棋子

    // 6. 检查目标位置是否能拼接
    const rotation = newRotation ?? piece.rotation
    const fitCheck = EdgeMatcher.checkFit(piece, toPosition, board, rotation)
    
    if (!fitCheck.canFit) {
      return { 
        valid: false, 
        reason: '目标位置无法与其他棋子拼接' 
      }
    }

    return { valid: true }
  }

  /**
   * 获取所有合法移动
   */
  static getPossibleMoves(
    piece: Piece,
    board: Cell[][],
    includeRotations: boolean = true
  ): Move[] {
    const possibleMoves: Move[] = []
    const directions = Object.values(Direction)
    const rotations = includeRotations 
      ? [0, 90, 180, 270] 
      : [piece.rotation]

    for (const dir of directions) {
      for (let steps = 1; steps <= 3; steps++) {
        const targetPos = this.getPositionInDirection(
          piece.position, 
          dir, 
          steps
        )

        if (!isValidPosition(targetPos, board)) continue

        for (const rotation of rotations) {
          const needsRotation = rotation !== piece.rotation
          
          // 如果需要旋转，只能移动1格
          if (needsRotation && steps > 1) continue

          const validation = this.validateMove(
            piece, 
            targetPos, 
            board, 
            rotation
          )

          if (validation.valid) {
            possibleMoves.push({
              piece,
              from: piece.position,
              to: targetPos,
              steps,
              needRotation: needsRotation,
              newRotation: rotation,
              canFit: true
            })
          }
        }
      }
    }

    return possibleMoves
  }
}
```

### 3.3 胜利与威胁检测

```typescript
class GameRules {
  /**
   * 检查是否获胜
   */
  static checkWin(gameState: GameState): Player | null {
    // 检查玩家1：所有棋子都在玩家2的终点区域
    const player1Win = gameState.player1Pieces.every(piece => {
      if (!piece.isOnBoard) return false
      const cell = gameState.board[piece.position.row][piece.position.col]
      return cell.isFinishZone.player1
    })

    if (player1Win) return Player.PLAYER1

    // 检查玩家2：所有棋子都在玩家1的终点区域
    const player2Win = gameState.player2Pieces.every(piece => {
      if (!piece.isOnBoard) return false
      const cell = gameState.board[piece.position.row][piece.position.col]
      return cell.isFinishZone.player2
    })

    if (player2Win) return Player.PLAYER2

    return null
  }

  /**
   * 检查威胁情况
   */
  static checkThreat(
    piece: Piece,
    position: Position,
    gameState: GameState
  ): ThreatInfo | null {
    const cell = gameState.board[position.row][position.col]
    const opponent = piece.player === Player.PLAYER1 
      ? Player.PLAYER2 
      : Player.PLAYER1

    // 检查是否在对手的起始线上阻挡
    const isBlockingStartZone = 
      (piece.player === Player.PLAYER1 && cell.isStartZone.player2) ||
      (piece.player === Player.PLAYER2 && cell.isStartZone.player1)

    if (!isBlockingStartZone) return null

    // 检查是否真的阻止了对手的胜利路径
    const opponentPieces = piece.player === Player.PLAYER1
      ? gameState.player2Pieces
      : gameState.player1Pieces

    const isBlockingWin = opponentPieces.some(opPiece => {
      // 检查该对手棋子是否需要经过此位置才能获胜
      return this.isPositionCriticalForWin(opPiece, position, gameState)
    })

    if (isBlockingWin) {
      return {
        threatenedPiece: piece,
        threateningPlayer: opponent,
        mustResolve: true
      }
    }

    return null
  }

  /**
   * 检查玩家是否完全被封锁
   */
  static isPlayerBlocked(player: Player, gameState: GameState): boolean {
    const pieces = player === Player.PLAYER1 
      ? gameState.player1Pieces 
      : gameState.player2Pieces

    // 检查所有棋子是否都无法移动
    for (const piece of pieces) {
      if (!piece.isOnBoard) {
        // 如果有棋子还未放置，检查是否能放置
        const possiblePlacements = this.getPossiblePlacements(
          piece, 
          gameState
        )
        if (possiblePlacements.length > 0) return false
      } else {
        // 检查是否有合法移动
        const possibleMoves = MoveValidator.getPossibleMoves(
          piece, 
          gameState.board
        )
        if (possibleMoves.length > 0) return false
      }
    }

    return true
  }
}
```

---

## 四、游戏流程设计

### 4.1 游戏初始化流程

```
开始
  ↓
选择游戏模式 (PvP / PvE)
  ↓
[如果是PvE] 选择AI难度
  ↓
选择起始布局方案
  ↓
初始化棋盘
  ↓
放置玩家1的棋子（顶部区域）
  ↓
放置玩家2的棋子（底部区域）
  ↓
确定先手玩家（随机或选择）
  ↓
进入游戏主循环
```

### 4.2 回合流程

```
当前玩家回合开始
  ↓
显示可操作选项：
  1. 选择棋子并移动
  2. 原地旋转（仅鸟类棋子）
  3. 跳过回合 (Pass)
  ↓
[选择1] 棋子移动流程
  ├─ 选择要移动的棋子
  ├─ 高亮显示合法移动位置
  ├─ 选择目标位置
  ├─ [可选] 选择旋转角度
  ├─ 验证移动合法性
  ├─ 执行移动
  └─ 更新棋盘状态
  ↓
[选择2] 原地旋转流程
  ├─ 选择鸟类棋子
  ├─ 选择旋转角度
  ├─ 验证旋转后仍能拼接
  ├─ 执行旋转
  └─ 更新棋子状态
  ↓
[选择3] 跳过回合
  ├─ 检查是否连续两次跳过（不允许）
  ├─ 记录跳过次数
  └─ 切换玩家
  ↓
检查威胁情况
  ├─ 是否阻挡对手终点线
  ├─ [是] 声明威胁 "Threat on XXX"
  └─ [否] 继续
  ↓
检查胜利条件
  ├─ 所有棋子到达终点？
  ├─ 对手完全封锁？
  ├─ 威胁无法解除？
  └─ [是] 游戏结束
  ↓
切换到对手回合
```

### 4.3 AI决策流程 (PvE模式)

```
AI回合开始
  ↓
评估当前局面
  ├─ 计算所有可能的移动
  ├─ 评估每个移动的分数
  └─ 考虑因素：
      • 接近终点的距离
      • 拼接的牢固程度
      • 对对手的威胁程度
      • 己方的防御能力
  ↓
根据难度选择策略
  ├─ EASY: 随机选择合法移动
  ├─ MEDIUM: 选择评分前3的移动之一
  └─ HARD: 使用Minimax算法预测3步
  ↓
执行选定的移动
  ↓
动画展示AI的思考过程
  ↓
完成回合
```

---

## 五、UI/UX 设计

### 5.1 主界面布局

```
┌─────────────────────────────────────┐
│  拼图棋游戏 - Puzzle Chess          │
├─────────────────────────────────────┤
│                                     │
│  [玩家1信息栏]                       │
│  ● 玩家1  棋子: 4/4  回合时间: 1:23  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│      ┌─────────────────┐            │
│      │                 │            │
│      │   8x8 棋盘      │            │
│      │                 │            │
│      │   [棋子显示]    │            │
│      │                 │            │
│      └─────────────────┘            │
│                                     │
├─────────────────────────────────────┤
│  [玩家2信息栏]                       │
│  ● 玩家2  棋子: 4/4  回合时间: 1:45  │
│                                     │
├─────────────────────────────────────┤
│  [操作面板]                          │
│  • 当前选中: 棋子3                   │
│  • 可移动步数: 1-3格                 │
│  [旋转] [移动] [跳过] [悔棋]        │
└─────────────────────────────────────┘
```

### 5.2 交互设计

#### 棋子选择
- 点击己方棋子进行选择
- 选中后高亮显示（发光边框）
- 显示该棋子的所有合法移动位置（半透明标记）

#### 移动操作
- **方式1**: 点击选择棋子 → 点击目标位置
- **方式2**: 拖拽棋子到目标位置
- 移动过程中实时显示拼接预览
- 移动完成后播放拼接动画

#### 旋转操作
- 右键点击棋子显示旋转菜单
- 或显示旋转按钮组（0°/90°/180°/270°）
- 实时预览旋转后的拼接效果
- 非法旋转时显示红色警告

#### 视觉反馈
- **可移动位置**: 绿色半透明标记
- **无法移动位置**: 灰色标记
- **威胁位置**: 红色警告标记
- **拼接成功**: 绿光闪烁动画
- **拼接失败**: 红光闪烁 + 震动

### 5.3 棋子可视化

#### SVG渲染方案
```typescript
// 每个棋子由以下元素组成：
{
  base: SVG路径（棋子基本形状）,
  edges: {
    top: 边缘凸凹形状,
    right: 边缘凸凹形状,
    bottom: 边缘凸凹形状,
    left: 边缘凸凹形状
  },
  color: 玩家颜色（玩家1: 蓝色, 玩家2: 红色）,
  icon: 棋子编号图标,
  rotation: 旋转角度
}
```

#### 拼接可视化
- 当两个棋子拼接时，接触边缘产生连接线动画
- 使用不同颜色表示拼接强度
- 完美拼接：金色连接线
- 普通拼接：白色连接线

---

## 六、开发步骤规划

### 阶段1：基础框架搭建 (2-3天)

#### 1.1 项目初始化
- [x] ~~初始化 Vue 3 + TypeScript 项目~~ (已完成)
- [ ] 安装必要依赖
  - pinia (状态管理)
  - vue-router (路由)
  - @vueuse/core (工具函数)
- [ ] 配置项目结构
  - types/ - 类型定义
  - classes/ - 游戏逻辑类
  - components/ - UI组件
  - stores/ - 状态管理
  - utils/ - 工具函数
  - assets/ - 静态资源

#### 1.2 核心类型定义
- [ ] 创建 `types/game.ts`
  - EdgeType, Rotation, Player, GameMode
  - PieceShape, Piece, Cell
  - Position, Direction, Move
  - GameState, GameConfig
- [ ] 创建 `types/ui.ts`
  - UIState, SelectedPiece
  - HighlightedCells, AnimationState

#### 1.3 常量定义
- [ ] 创建 `constants/pieces.ts`
  - 定义4种棋子的形状数据
  - PIECE_SHAPES: Record<number, PieceShape>
- [ ] 创建 `constants/board.ts`
  - BOARD_SIZE = 8
  - PLAYER1_START_ROWS = [0, 1]
  - PLAYER2_START_ROWS = [6, 7]
- [ ] 创建 `constants/rules.ts`
  - MAX_MOVE_STEPS = 3
  - MIN_MOVE_STEPS = 1
  - ROTATE_MOVE_LIMIT = 1

### 阶段2：核心逻辑实现 (4-5天)

#### 2.1 边缘匹配系统
- [ ] 实现 `classes/EdgeMatcher.ts`
  - canMatch(edge1, edge2): boolean
  - getRotatedEdge(shape, side, rotation): EdgeType
  - getOppositeEdge(direction): EdgeSide
  - checkFit(piece, position, board, rotation): FitCheckResult

#### 2.2 移动验证系统
- [ ] 实现 `classes/MoveValidator.ts`
  - validateMove(piece, to, board, rotation): MoveValidation
  - getPossibleMoves(piece, board): Move[]
  - calculateDistance(from, to): number
  - getDirection(from, to): Direction
  - getPath(from, to, direction): Position[]

#### 2.3 棋盘管理系统
- [ ] 实现 `classes/Board.ts`
  - initializeBoard(size): Cell[][]
  - getPiece(position): Piece[]
  - placePiece(piece, position): boolean
  - removePiece(piece, position): boolean
  - movePiece(from, to): boolean
  - getCellsInZone(zone): Cell[]

#### 2.4 游戏规则系统
- [ ] 实现 `classes/GameRules.ts`
  - checkWin(gameState): Player | null
  - checkThreat(piece, position, gameState): ThreatInfo | null
  - isPlayerBlocked(player, gameState): boolean
  - canPass(player, gameState): boolean
  - validatePass(player, gameState): boolean

#### 2.5 游戏状态管理
- [ ] 实现 `classes/GameEngine.ts`
  - initialize(config): GameState
  - startGame(): void
  - executeMove(move): boolean
  - rotatePiece(piece, rotation): boolean
  - pass(): boolean
  - undo(): boolean
  - getGameState(): GameState
  - subscribeToChanges(callback): void

### 阶段3：UI组件开发 (4-5天)

#### 3.1 基础组件
- [ ] `components/game/GameBoard.vue`
  - 渲染8x8棋盘网格
  - 显示坐标标识
  - 响应点击事件
- [ ] `components/game/GameCell.vue`
  - 单个格子组件
  - 显示格子状态（起始区/终点区）
  - 高亮显示（可移动/选中）
- [ ] `components/game/GamePiece.vue`
  - 渲染棋子SVG
  - 支持旋转动画
  - 拖拽功能
  - 显示拼接边缘

#### 3.2 游戏控制组件
- [ ] `components/game/PlayerInfo.vue`
  - 玩家头像/名称
  - 剩余棋子数
  - 回合计时器
  - 当前状态（思考中/等待）
- [ ] `components/game/ControlPanel.vue`
  - 旋转按钮组
  - 移动确认按钮
  - 跳过按钮
  - 悔棋按钮
- [ ] `components/game/MoveHistory.vue`
  - 移动历史记录
  - 支持回放
  - 支持跳转到某步

#### 3.3 模式选择组件
- [ ] `components/menu/GameModeSelector.vue`
  - PvP / PvE 选择
  - AI难度选择
  - 起始布局选择
- [ ] `components/menu/MainMenu.vue`
  - 开始游戏
  - 规则说明
  - 设置选项
  - 游戏历史

#### 3.4 辅助组件
- [ ] `components/game/ThreatNotification.vue`
  - 显示威胁警告
  - "Threat on XXX" 提示
- [ ] `components/game/WinDialog.vue`
  - 胜利动画
  - 游戏统计
  - 再来一局/返回菜单
- [ ] `components/game/RuleHelper.vue`
  - 规则提示浮窗
  - 合法移动提示
  - 拼接规则说明

### 阶段4：交互与动画 (2-3天)

#### 4.1 拖拽系统
- [ ] 实现棋子拖拽
  - 使用 HTML5 Drag & Drop API
  - 或使用 @vueuse/core 的 useDraggable
  - 拖拽时显示半透明预览
  - 拖拽到非法位置时禁用放置

#### 4.2 动画效果
- [ ] 棋子移动动画
  - 平滑移动过渡（0.3s ease-out）
  - 沿路径移动（多格移动）
- [ ] 旋转动画
  - 3D翻转效果
  - 持续时间：0.5s
- [ ] 拼接动画
  - 边缘连接闪光
  - 成功：绿色波纹
  - 失败：红色震动
- [ ] 胜利动画
  - 烟花效果
  - 棋子闪烁
  - 胜利文字飞入

#### 4.3 交互反馈
- [ ] 音效系统
  - 棋子选择音效
  - 移动音效
  - 拼接成功/失败音效
  - 胜利音效
  - 背景音乐
- [ ] 触觉反馈（移动端）
  - 选中棋子时震动
  - 非法操作时震动

### 阶段5：AI系统实现 (3-4天)

#### 5.1 AI基础架构
- [ ] 创建 `classes/AIPlayer.ts`
  - evaluate(gameState): number
  - selectMove(gameState): Move
  - think(duration): Promise<Move>

#### 5.2 AI评估函数
- [ ] 实现局面评估
  - 计算距离终点的距离
  - 计算拼接的稳定性
  - 计算对对手的威胁度
  - 计算己方的防御能力
  - 综合评分

#### 5.3 AI策略
- [ ] EASY难度
  - 随机选择合法移动
  - 偶尔选择较优移动（30%概率）
- [ ] MEDIUM难度
  - 贪心算法
  - 选择当前评分最高的移动
  - 考虑1步后的局面
- [ ] HARD难度
  - Minimax算法（深度3-4）
  - Alpha-Beta剪枝优化
  - 开局库和残局库
  - 时间限制（3秒）

#### 5.4 AI可视化
- [ ] 显示AI思考过程
  - 正在考虑的移动方案
  - 评估分数
  - 思考进度条

### 阶段6：状态管理与持久化 (2天)

#### 6.1 Pinia Store
- [ ] `stores/gameStore.ts`
  - gameState: GameState
  - uiState: UIState
  - actions: {
      initGame(), selectPiece(), 
      makeMove(), rotatePiece(),
      pass(), undo()
    }
  - getters: {
      currentPlayer, possibleMoves,
      isGameOver, winner
    }

#### 6.2 数据持久化
- [ ] 游戏存档
  - 自动保存当前游戏
  - 恢复未完成的游戏
  - 多存档支持（最多3个）
- [ ] 历史记录
  - 保存已完成的游戏
  - 查看历史对局
  - 统计数据（胜率、平均步数等）

#### 6.3 设置管理
- [ ] 用户设置
  - 音效开关
  - 音乐开关
  - 动画速度
  - 主题颜色
  - 语言选择（中/英）

### 阶段7：测试与优化 (2-3天)

#### 7.1 单元测试
- [ ] 边缘匹配测试
  - 测试所有边缘组合
  - 测试旋转后的边缘匹配
- [ ] 移动验证测试
  - 测试各种移动场景
  - 测试边界情况
- [ ] 游戏规则测试
  - 测试胜利条件
  - 测试威胁机制
  - 测试封锁判定

#### 7.2 集成测试
- [ ] 完整对局测试
  - PvP模式完整流程
  - PvE模式（各难度）
  - 边界情况处理

#### 7.3 性能优化
- [ ] 渲染优化
  - 虚拟滚动（如果需要）
  - 减少不必要的重渲染
  - 使用 computed 缓存计算结果
- [ ] AI优化
  - 移动生成优化
  - 评估函数优化
  - 并行计算（Web Worker）

#### 7.4 UI/UX优化
- [ ] 响应式适配
  - 桌面端（1920x1080）
  - 平板端（1024x768）
  - 移动端（375x667）
- [ ] 可访问性
  - 键盘导航支持
  - 屏幕阅读器支持
  - 高对比度模式

### 阶段8：文档与部署 (1-2天)

#### 8.1 文档编写
- [ ] 用户手册
  - 游戏规则详解
  - 操作指南
  - 常见问题
- [ ] 开发文档
  - API文档
  - 架构说明
  - 扩展指南

#### 8.2 部署
- [ ] 构建优化
  - 代码分割
  - 资源压缩
  - CDN配置
- [ ] 部署到服务器
  - Vercel / Netlify
  - 配置域名
  - HTTPS配置

---

## 七、技术选型

### 7.1 核心技术栈
```
前端框架: Vue 3.5+
开发语言: TypeScript 5.x
构建工具: Vite 7.x
状态管理: Pinia 3.x
路由管理: Vue Router 4.x
```

### 7.2 UI相关
```
样式方案: CSS3 + SCSS
动画库: @vueuse/motion 或 GSAP
SVG处理: 原生SVG + vue-svg-loader
图标库: @iconify/vue (可选)
```

### 7.3 工具库
```
工具函数: @vueuse/core
日期处理: dayjs
深拷贝: lodash-es (cloneDeep)
UUID生成: nanoid
```

### 7.4 测试工具
```
单元测试: Vitest
组件测试: @vue/test-utils
E2E测试: Playwright (可选)
```

### 7.5 代码质量
```
代码规范: ESLint + Prettier
Git Hooks: husky + lint-staged
类型检查: vue-tsc
```

---

## 八、风险评估与应对

### 8.1 技术风险

**风险1：拼接算法复杂度高**
- 影响：可能导致性能问题
- 应对：
  - 使用缓存优化重复计算
  - 限制搜索深度
  - 使用 Web Worker 处理密集计算

**风险2：SVG渲染性能**
- 影响：大量棋子和动画可能卡顿
- 应对：
  - 使用 Canvas 替代 SVG（如需要）
  - 减少DOM节点数量
  - 使用 CSS transform 而非 top/left

**风险3：AI算法性能**
- 影响：高难度AI思考时间过长
- 应对：
  - 设置思考时间上限
  - 使用迭代加深搜索
  - 实现开局库减少计算

### 8.2 业务风险

**风险1：规则理解偏差**
- 影响：实现的游戏规则与预期不符
- 应对：
  - 与需求方充分沟通
  - 制作原型快速验证
  - 迭代式开发

**风险2：用户体验不佳**
- 影响：玩家难以理解或操作
- 应对：
  - 提供详细的新手教程
  - 实时提示系统
  - 多轮用户测试

### 8.3 时间风险

**风险：开发时间超出预期**
- 影响：延期交付
- 应对：
  - MVP优先（最小可玩版本）
  - 分阶段交付
  - 保留缓冲时间

---

## 九、MVP功能清单

### MVP 1.0（基础可玩版本）

**必须有的功能：**
- ✅ 8x8棋盘显示
- ✅ 4种棋子形状
- ✅ 基础移动（1-3格）
- ✅ 旋转功能
- ✅ 拼接检测
- ✅ PvP模式
- ✅ 胜利判定
- ✅ 基础UI和交互

**可以延后的功能：**
- ⏸️ PvE模式（AI）
- ⏸️ 威胁机制
- ⏸️ 跳过功能
- ⏸️ 悔棋功能
- ⏸️ 音效和音乐
- ⏸️ 复杂动画
- ⏸️ 历史记录
- ⏸️ 多语言

### MVP 2.0（完整功能版本）
在MVP 1.0基础上添加：
- ✅ PvE模式（EASY AI）
- ✅ 威胁机制
- ✅ 跳过和悔棋
- ✅ 基础音效
- ✅ 游戏存档

### MVP 3.0（高级功能版本）
- ✅ MEDIUM/HARD AI
- ✅ 完整动画系统
- ✅ 历史回放
- ✅ 统计系统
- ✅ 多语言支持
- ✅ 在线对战（可选）

---

## 十、开发时间估算

```
阶段1：基础框架搭建      2-3天
阶段2：核心逻辑实现      4-5天
阶段3：UI组件开发        4-5天
阶段4：交互与动画        2-3天
阶段5：AI系统实现        3-4天
阶段6：状态管理与持久化  2天
阶段7：测试与优化        2-3天
阶段8：文档与部署        1-2天
─────────────────────────────
总计：                 20-27天

MVP 1.0 预计：         10-12天
MVP 2.0 预计：         15-18天
MVP 3.0 预计：         20-27天
```

---

## 十一、后续扩展方向

### 11.1 功能扩展
- 🎮 在线多人对战
- 🏆 排行榜系统
- 📊 详细数据分析
- 🎨 自定义皮肤/主题
- 📱 移动端APP
- 🎥 对局录像和分享

### 11.2 游戏性扩展
- 🎲 更多棋子形状（6种、8种）
- 📏 不同棋盘尺寸（6x6、10x10）
- ⚡ 限时模式
- 🎯 挑战模式/谜题模式
- 👥 团队对战（2v2）

### 11.3 社交功能
- 💬 聊天系统
- 👫 好友系统
- 🎁 成就系统
- 📝 对局点评

---

## 十二、总结

本设计文档全面规划了拼图棋游戏的开发方案，从核心算法、数据结构到UI设计、开发流程都有详细说明。

**关键要点：**
1. **核心难点**：边缘匹配算法和移动验证系统
2. **开发策略**：MVP迭代式开发，先实现可玩版本
3. **技术选型**：Vue 3 + TypeScript + Pinia，成熟稳定
4. **预计周期**：MVP 1.0 约10-12天，完整版本约20-27天

**下一步行动：**
1. 确认游戏规则细节
2. 开始实现核心逻辑类
3. 构建基础UI框架
4. 快速迭代到MVP 1.0

---

**文档版本：** v1.0  
**创建日期：** 2025-10-16  
**最后更新：** 2025-10-16
