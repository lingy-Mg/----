# 拼图棋盘游戏 - 完整项目文档

> **版本**: v1.1  
> **更新日期**: 2025-10-17  
> **状态**: ✅ MVP 完成，模块化架构重构完成

---

## 📋 目录

1. [项目概述](#项目概述)
2. [游戏规则](#游戏规则)
3. [技术架构](#技术架构)
4. [代码结构](#代码结构)
5. [开发指南](#开发指南)
6. [API 文档](#api-文档)
7. [测试说明](#测试说明)
8. [版本历史](#版本历史)

---

## 项目概述

### 项目简介

**拼图棋盘游戏（Puzzle Chess）** 是一款双人回合制策略游戏，玩家需要将己方的拼图形状棋子从起始位置移动到对方的起始区域。游戏简洁易懂，但充满策略性。

### 技术栈

- **框架**: Vue 3 + TypeScript (Composition API)
- **构建工具**: Vite 6.0.3
- **路由**: Vue Router 4.5.0
- **状态管理**: OOP 类管理（无需 Pinia）
- **测试**: Vitest
- **开发环境**: VS Code + Node.js 18+

### 项目架构特点

- **模块化组件**: ChessBoard 拆分为 12+ 个子组件
- **Composables 模式**: 3 个核心 composable 函数
- **OOP 游戏引擎**: 纯 TypeScript 类管理游戏逻辑
- **层级分离**: 棋盘背景层 + 棋子浮动层
- **页面级工具**: 调试面板在页面层管理

### 项目结构

```
src/
├── types/
│   ├── puzzle.ts              # 简单拼图类型（Phase 1）
│   └── chess/                 # 棋盘游戏类型（Phase 2）✅
│       └── index.ts
├── classes/
│   ├── Puzzle*.ts             # 简单拼图逻辑
│   └── chess/                 # 棋盘游戏核心类 ✅
│       ├── EdgeMatcher.ts     # 边缘匹配（暂未启用）
│       ├── MoveValidator.ts   # 移动验证
│       ├── Board.ts           # 棋盘管理
│       ├── GameEngine.ts      # 游戏引擎
│       ├── PieceManager.ts    # 棋子管理
│       └── __tests__/         # 单元测试
├── constants/
│   └── chess/                 # 棋盘配置 ✅
│       ├── pieces.ts          # 棋子定义
│       └── board.ts           # 棋盘常量（玩家起始位置）
├── components/
│   ├── PuzzleBoard.vue        # 简单拼图
│   └── chess/                 # 棋盘游戏 UI（模块化架构）✅
│       ├── ChessBoardNew.vue  # 主容器（新架构）✅
│       ├── ChessBoard.vue     # 旧版本（2100+行，已废弃）
│       ├── composables/       # 组合式函数 ✅
│       │   ├── useGameState.ts          # 游戏状态管理
│       │   ├── useDebugSettings.ts      # 调试设置
│       │   └── usePieceInteraction.ts   # 棋子交互逻辑
│       ├── board/             # 棋盘组件 ✅
│       │   ├── BoardBackground.vue      # 棋盘背景层
│       │   ├── PiecesLayer.vue          # 棋子浮动层
│       │   └── ChessPiece.vue           # 单个棋子组件
│       ├── ui/                # UI 组件 ✅
│       │   ├── PlayerIndicator.vue      # 玩家指示器（游戏风格）
│       │   └── GameStatus.vue           # 游戏状态显示
│       └── panels/            # 面板组件 ✅
│           ├── GameControlPanel.vue     # 游戏控制面板
│           ├── DebugPanel.vue           # 调试面板
│           └── RulesPanel.vue           # 规则面板
├── views/
│   └── ChessView.vue          # 棋盘游戏视图（首页，含页面级调试面板）✅
└── router/
    └── index.ts               # 路由配置（首页=棋盘）✅

docs/
├── PROJECT_DOCUMENTATION.md   ⭐ 完整项目文档（本文档）
├── TODO.md                    📝 待办事项清单
├── COMPONENT_REFACTORING.md   📐 组件重构文档
└── DEBUG_PANEL_ARCHITECTURE.md 🛠️ 调试面板架构说明
```

### 模块化架构说明

**v1.1 重构**（2025-10-17）:
- ✅ 将 2100+ 行的 ChessBoard.vue 拆分为 12+ 个模块
- ✅ 使用 Composables 模式管理逻辑复用
- ✅ 分离棋盘背景层和棋子浮动层（解决 DOM 干扰问题）
- ✅ 调试面板移至页面级别（ChessView.vue）
- ✅ 每个组件职责单一，易于维护和测试

---

## 游戏规则

### 🎯 游戏目标

- **棋盘**: 4×4 网格（16 个格子）
- **棋子**: 每方 4 个拼图形状棋子
- **起始位置**:
  - 玩家 1（蓝色）：第 3 行（底部）
  - 玩家 2（红色）：第 0 行（顶部）
- **目标**: 将己方所有棋子移至对方起始行
  - 玩家 1 目标：到达第 0 行（顶部）↑
  - 玩家 2 目标：到达第 3 行（底部）↓
- **胜利条件**: 率先完成目标的玩家获胜

### ♟️ 核心规则

#### 1. 回合制

- 游戏采用**轮流行动**制
- 每回合玩家只能执行**一个动作**：移动棋子或旋转棋子（仅鸟类）
- 完成动作后，**自动切换**到对方回合

#### 2. 移动规则

**移动范围**:
- 可移动到棋盘上**任意空位置**（无距离限制）
- 目标格子**必须为空**（不可重叠）

**移动方向**:
- 必须沿**直线**或**对角线**移动
- 支持 **8 个方向**: 上、下、左、右、左上、右上、左下、右下

**示例**:
```
✅ 合法移动:
- 从 (0,0) 移动到 (0,3)  // 水平直线
- 从 (0,0) 移动到 (3,0)  // 垂直直线
- 从 (0,0) 移动到 (2,2)  // 对角线

❌ 非法移动:
- 从 (0,0) 移动到 (1,2)  // 不是直线或对角线
- 移动到已有棋子的位置   // 不可重叠
```

#### 3. 旋转规则

**相邻移动（距离 = 1 格）**:
- ✅ 移动到相邻 8 格之一后，可选择是否旋转
- 旋转角度: 90° 增量（0°、90°、180°、270°）
- ⚠️ 旋转后本次移动结束，切换回合

**远距离移动（距离 > 1 格）**:
- ❌ 不能旋转，只能移动
- ✅ 适合快速占领战略位置

**鸟类棋子特权**:
- 🦅 可以原地旋转（不移动）
- ⚠️ 原地旋转也算一个动作，会结束回合

### 🎮 操作指南

| 操作 | 方法 |
|------|------|
| 选择棋子 | 点击己方棋子（黄色高亮 + 绿色可移动提示） |
| 移动棋子 | 点击绿色提示的目标格子 |
| 旋转棋子 | 按 `R` 键或点击"旋转"按钮 |
| 取消选择 | 按 `ESC` 键 |
| 跳过回合 | 点击"跳过"按钮 |

### ⚡ 策略要点

1. **一回合一动作**: 需谨慎选择移动或旋转
2. **远近平衡**: 远距离移动快速，相邻移动灵活
3. **鸟类优势**: 善用鸟类的原地旋转能力
4. **位置卡位**: 占据关键位置，控制局势
5. **快速推进**: 利用无距离限制，快速抵达目标

---

## 技术架构

### 设计模式

项目采用 **面向对象编程（OOP）** + **组合式函数（Composables）** 混合架构：

**游戏逻辑层（OOP）**:
```typescript
// 游戏引擎 - 管理游戏状态
class GameEngine {
  private gameState: GameState
  
  initializeGame(): void { }
  executeMove(piece, toPosition, rotation?): boolean { }
  switchTurn(): void { }
  checkWinCondition(): void { }
}

// 移动验证器 - 验证移动合法性
class MoveValidator {
  static validateMove(piece, toPosition, board, rotation?): MoveValidation { }
  static getPossibleMoves(piece, board): Move[] { }
  static calculateChebyshevDistance(from, to): number { }
}

// 棋盘管理 - 管理棋盘状态
class Board {
  private cells: BoardCell[][]
  
  initializeBoard(): void { }
  getPieceAt(position): ChessPiece | null { }
  movePiece(from, to): boolean { }
}

// 棋子管理器 - 创建和管理棋子
class PieceManager {
  static createInitialPieces(player, startRows): ChessPiece[] { }
}
```

**UI 逻辑层（Composables）**:
```typescript
// useGameState.ts - 游戏状态管理
export function useGameState() {
  const gameEngine = ref<GameEngine | null>(null)
  const selectedCell = ref<ChessPiece | null>(null)
  const currentPlayer = computed(() => gameEngine.value?.gameState.currentPlayer)
  
  function executeMove(piece, to, rotation?) { }
  function rotatePiece() { }
  function undoMove() { }
  function resetGame() { }
  
  return { gameEngine, selectedCell, currentPlayer, ... }
}

// useDebugSettings.ts - 调试设置（localStorage 持久化）
export function useDebugSettings() {
  const showDebug = ref(false)
  const debugSettings = reactive({ ... })
  
  function toggleDebugPanel() { }
  function resetAllDebugSettings() { }
  function exportDebugSettings() { }
  
  return { showDebug, debugSettings, ... }
}

// usePieceInteraction.ts - 棋子交互逻辑
export function usePieceInteraction(gameState, debugState) {
  function handlePieceClick(piece) { }
  function handleEmptyCellClick(cell) { }
  function getPieceCellPosition(piece) { }  // 含 padding 修正
  function getPieceStyle(piece) { }
  
  return { handlePieceClick, getPieceCellPosition, ... }
}
```

### 组件架构

**ChessBoardNew.vue（主容器）**:
- 组合 3 个 composables
- 协调子组件通信
- 管理键盘事件
- 使用 `defineExpose` 导出状态供页面访问

**子组件分类**:

1. **棋盘组件**（board/）:
   - `BoardBackground.vue`: 背景格子层（Grid 布局）
   - `PiecesLayer.vue`: 棋子浮动层（绝对定位）
   - `ChessPiece.vue`: 单个棋子（SVG + 点击事件）

2. **UI 组件**（ui/）:
   - `PlayerIndicator.vue`: 玩家指示器（游戏风格设计）
     - 圆形头像 + 发光效果
     - 回合徽章 + 脉冲动画
     - 目标显示（↑/↓）
   - `GameStatus.vue`: 游戏状态（获胜提示 + 键盘提示）

3. **面板组件**（panels/）:
   - `GameControlPanel.vue`: 游戏控制（旋转/跳过/悔棋/重置）
   - `DebugPanel.vue`: 调试面板（棋子缩放/偏移调整）
   - `RulesPanel.vue`: 规则面板（浮动显示）

### 关键架构决策

**1. 层级分离**（解决 DOM 干扰）:
```vue
<div class="chess-board-wrapper">
  <!-- 背景层：Grid 布局 -->
  <BoardBackground :board-cells="boardCells" />
  
  <!-- 棋子层：绝对定位浮动层 -->
  <PiecesLayer :board-cells="boardCells" />
</div>
```

**2. 点击事件优化**:
- ❌ 旧版：棋盘格子绑定点击事件（事件冲突）
- ✅ 新版：直接在棋子和空格子上绑定（事件清晰）

**3. 位置计算修正**:
```typescript
// usePieceInteraction.ts
function getPieceCellPosition(piece: ChessPiece) {
  const { cellSize, gap, padding } = BOARD_DISPLAY
  return {
    left: colIndex * (cellSize + gap) + padding,  // 修正 10px padding
    top: rowIndex * (cellSize + gap) + padding
  }
}
```

**4. 调试面板架构**:
- **旧版**: 在 ChessBoardNew.vue 内部
- **新版**: 移至 ChessView.vue 页面级别
- **优点**: 组件职责单一，开发工具与游戏逻辑分离
- **实现**: 使用 `defineExpose` 导出 `debugState` 供父组件访问

---

## 代码结构

### Composables 详解

#### 1. useGameState（游戏状态管理）

**职责**: 封装游戏引擎交互逻辑

**核心状态**:
```typescript
const gameEngine = ref<GameEngine | null>(null)
const selectedCell = ref<ChessPiece | null>(null)
const boardCells = computed(() => gameEngine.value?.gameState.board || [])
const currentPlayer = computed(() => gameEngine.value?.gameState.currentPlayer || 1)
const winner = computed(() => gameEngine.value?.gameState.winner)
const moveHistory = computed(() => gameEngine.value?.gameState.moveHistory || [])
```

**核心方法**:
- `initializeGame(engine)`: 初始化游戏引擎
- `executeMove(piece, to, rotation?)`: 执行移动
- `rotatePiece()`: 旋转选中棋子（仅鸟类原地旋转）
- `skipTurn()`: 跳过回合
- `undoMove()`: 悔棋
- `resetGame()`: 重置游戏
- `clearSelection()`: 清除选择

#### 2. useDebugSettings（调试设置）

**职责**: 管理调试面板状态和 localStorage 持久化

**核心状态**:
```typescript
const showDebug = ref(false)
const debugSettings = reactive({
  resource1: { scale: 1, offsetX: 0, offsetY: 0 },
  resource2: { scale: 1, offsetX: 0, offsetY: 0 },
  resource3: { scale: 1, offsetX: 0, offsetY: 0 },
  resource4: { scale: 1, offsetX: 0, offsetY: 0 }
})
```

**核心方法**:
- `toggleDebugPanel()`: 切换调试面板
- `resetAllDebugSettings()`: 重置所有设置
- `resetShape(shapeId)`: 重置指定棋子设置
- `updateShapeSettings(shapeId, settings)`: 更新棋子设置
- `exportDebugSettings()`: 导出设置（JSON）
- `importDebugSettings(json)`: 导入设置

#### 3. usePieceInteraction（棋子交互）

**职责**: 管理棋子点击、移动提示、样式计算

**核心方法**:
```typescript
// 点击事件
function handlePieceClick(piece: ChessPiece) {
  // 选中/取消选中己方棋子
}

function handleEmptyCellClick(cell: BoardCell) {
  // 移动选中棋子到空格子
}

// 位置和样式计算
function getPieceCellPosition(piece: ChessPiece) {
  // 计算棋子在棋盘上的绝对位置（含 padding 修正）
}

function getPieceStyle(piece: ChessPiece) {
  // 应用调试设置（缩放 + 偏移）
}

function getPieceSvg(piece: ChessPiece) {
  // 返回 SVG 路径
}

// 移动提示
function getCellClass(cell: BoardCell) {
  // 返回格子 CSS 类（selected/possible-move）
}

function shouldShowPiecePreview(cell: BoardCell) {
  // 是否显示棋子预览（悬停在可移动位置）
}
```

### 组件详解

### 核心类型定义

```typescript
// 位置
interface Position {
  row: number
  col: number
}

// 旋转角度
type Rotation = 0 | 90 | 180 | 270

// 棋子
interface ChessPiece {
  id: number
  shapeId: number        // 1-4（对应 SVG 资源）
  player: Player         // 1 或 2
  position: Position | null
  rotation: Rotation
  edges: EdgeConfig      // 边缘配置（暂未使用）
  isOnBoard: boolean
  isBird: boolean        // 是否是鸟类（资源 4）
}

// 游戏状态
interface GameState {
  currentPlayer: Player
  board: BoardCell[][]
  player1Pieces: ChessPiece[]
  player2Pieces: ChessPiece[]
  moveHistory: Move[]
  winner: Player | null
  turnNumber: number
}

// 棋盘格子
interface BoardCell {
  position: Position
  pieces: ChessPiece[]   // 支持多棋子（当前规则不允许重叠）
}
```

### 边缘匹配系统（暂未启用）

项目设计了边缘匹配机制，但当前版本为**自由模式**，未启用此功能。

**边缘类型**:
```typescript
type EdgeType = '1+' | '1-' | '1`+' | '1`-'

// 匹配规则
'1+'  ←→ '1-'   ✓ （凸配凹）
'1`+' ←→ '1`-'  ✓ （反凸配反凹）
'1+'  ←→ '1`-'  ✗ （类型不同不匹配）
```

**4 种棋子形状**（来自 `/SVG/资源 X.svg`）:
- 资源 1: `top:'1-'`, `right:'1\`-'`, `bottom:'1\`-'`, `left:'1-'`
- 资源 2: `top:'1+'`, `right:'1-'`, `bottom:'1\`-'`, `left:'1\`+'`
- 资源 3: `top:'1\`+'`, `right:'1-'`, `bottom:'1\`-'`, `left:'1+'`
- 资源 4: `top:'1\`+'`, `right:'1+'`, `bottom:'1\`+'`, `left:'1+'` （鸟类）

---

## 代码结构

### 核心类详解

#### 1. GameEngine（游戏引擎）

**职责**: 管理游戏状态和生命周期

**关键方法**:
```typescript
class GameEngine {
  // 初始化游戏状态
  initializeGameState(): GameState
  
  // 执行移动（移动后自动切换回合）
  executeMove(piece: ChessPiece, toPosition: Position, newRotation?: Rotation): boolean
  
  // 切换回合
  switchTurn(): void
  
  // 旋转棋子（仅鸟类原地旋转）
  rotatePiece(piece: ChessPiece): boolean
  
  // 检查胜利条件
  private checkWinCondition(): void
  
  // 悔棋
  undoMove(): boolean
}
```

**游戏状态流程**:
```
初始化 → 玩家1回合 → 执行动作 → 检查胜利 → 切换回合 → 玩家2回合 → ...
```

#### 2. MoveValidator（移动验证器）

**职责**: 验证移动合法性，生成可能的移动

**关键方法**:
```typescript
class MoveValidator {
  // 验证移动
  static validateMove(
    piece: ChessPiece,
    toPosition: Position,
    board: BoardCell[][],
    newRotation?: Rotation
  ): MoveValidation
  
  // 获取所有可能的移动
  static getPossibleMoves(
    piece: ChessPiece,
    board: BoardCell[][],
    includeRotations?: boolean
  ): Move[]
  
  // 计算切比雪夫距离（含对角线）
  static calculateChebyshevDistance(from: Position, to: Position): number
  
  // 获取移动方向
  static getDirection(from: Position, to: Position): Direction | null
}
```

**验证流程**:
```
1. 检查棋子是否在棋盘上
2. 检查目标位置是否有效
3. 检查是否原地旋转（仅鸟类）
4. 计算距离和方向
5. 检查目标格子是否为空（不可重叠）
6. 检查旋转限制（距离 > 1 不可旋转）
7. 返回验证结果
```

#### 3. Board（棋盘管理）

**职责**: 管理棋盘状态和棋子放置

**关键方法**:
```typescript
class Board {
  // 初始化棋盘
  initializeBoard(size: number): void
  
  // 获取指定位置的棋子
  getPieceAt(position: Position): ChessPiece | null
  
  // 移动棋子
  movePiece(from: Position, to: Position): boolean
  
  // 放置棋子
  placePiece(piece: ChessPiece, position: Position): boolean
  
  // 移除棋子
  removePiece(position: Position): ChessPiece | null
}
```

#### 4. PieceManager（棋子管理器）

**职责**: 创建和管理棋子

**关键方法**:
```typescript
class PieceManager {
  // 创建初始棋子
  static createInitialPieces(player: Player, startRows: number[]): ChessPiece[]
  
  // 根据玩家和形状ID创建棋子
  private static createPiece(player: Player, shapeId: number, id: number): ChessPiece
}
```

**棋子初始化**:
```typescript
// 玩家 1: 第 0 行，4 个棋子
Player 1 Pieces: [
  { id: 0, shapeId: 1, position: {row: 0, col: 0} },
  { id: 1, shapeId: 2, position: {row: 0, col: 1} },
  { id: 2, shapeId: 3, position: {row: 0, col: 2} },
  { id: 3, shapeId: 4, position: {row: 0, col: 3}, isBird: true }
]

// 玩家 2: 第 3 行，4 个棋子
Player 2 Pieces: [同上，row: 3]
```

---

## 开发指南

### 环境搭建

```bash
# 1. 克隆项目
git clone <repository-url>
cd puzzle-chess

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 运行测试
pnpm test:unit

# 5. 构建生产版本
pnpm build
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 类型检查并构建 |
| `pnpm test:unit` | 运行 Vitest 单元测试 |
| `pnpm preview` | 预览构建结果 |
| `pnpm type-check` | 运行 TypeScript 类型检查 |

### 开发工作流

1. **添加新功能**:
   ```typescript
   // 1. 在 types/chess/index.ts 定义类型
   export interface NewFeature { }
   
   // 2. 在 classes/chess/ 实现逻辑
   export class NewFeatureClass { }
   
   // 3. 在 components/chess/ 添加 UI
   // ChessBoard.vue
   
   // 4. 编写测试
   // classes/chess/__tests__/NewFeature.spec.ts
   ```

2. **修改游戏规则**:
   - 更新 `constants/chess/board.ts`（配置常量）
   - 修改 `MoveValidator.ts`（验证逻辑）
   - 更新 `GameEngine.ts`（游戏引擎）
   - 修改 `ChessBoard.vue`（UI 和规则面板）

3. **调试技巧**:
   ```typescript
   // GameEngine.ts 中添加日志
   console.log('Current state:', this.gameState)
   
   // ChessBoard.vue 中监听状态
   watch(gameState, (newState) => {
     console.log('Game state changed:', newState)
   })
   ```

### 代码规范

1. **TypeScript 类型**:
   - 使用 `type-only` 导入: `import type { ... }`
   - 所有函数都要有类型注解
   - 避免使用 `any` 类型

2. **命名约定**:
   - 类名: PascalCase（如 `GameEngine`）
   - 方法/变量: camelCase（如 `executeMove`）
   - 常量: UPPER_SNAKE_CASE（如 `BOARD_SIZE`）
   - 接口: PascalCase（如 `GameState`）

3. **注释**:
   - 类和公共方法使用 JSDoc 注释
   - 关键逻辑添加中文注释
   - 复杂算法添加示例

---

## API 文档

### GameEngine API

#### `initializeGameState(): GameState`

初始化游戏状态，创建棋盘和棋子。

**返回**: 初始化的游戏状态

**示例**:
```typescript
const engine = new GameEngine()
const state = engine.initializeGameState()
```

#### `executeMove(piece: ChessPiece, toPosition: Position, newRotation?: Rotation): boolean`

执行棋子移动，移动后自动切换回合。

**参数**:
- `piece`: 要移动的棋子
- `toPosition`: 目标位置
- `newRotation`: 可选的新旋转角度

**返回**: `true` 移动成功，`false` 移动失败

**示例**:
```typescript
const piece = gameState.player1Pieces[0]
const success = engine.executeMove(piece, { row: 1, col: 0 })

// 相邻移动时可旋转
const successWithRotate = engine.executeMove(piece, { row: 1, col: 0 }, 90)
```

#### `rotatePiece(piece: ChessPiece): boolean`

旋转棋子（仅鸟类可原地旋转），旋转后切换回合。

**参数**:
- `piece`: 要旋转的棋子

**返回**: `true` 旋转成功，`false` 旋转失败

**示例**:
```typescript
const birdPiece = gameState.player1Pieces[3] // 假设是鸟类
const success = engine.rotatePiece(birdPiece)
```

#### `getGameState(): GameState`

获取当前游戏状态（只读）。

**返回**: 当前游戏状态

#### `undoMove(): boolean`

撤销上一步移动。

**返回**: `true` 撤销成功，`false` 无法撤销

---

### MoveValidator API

#### `validateMove(piece, toPosition, board, newRotation?): MoveValidation`

验证移动是否合法。

**参数**:
- `piece`: ChessPiece - 要移动的棋子
- `toPosition`: Position - 目标位置
- `board`: BoardCell[][] - 当前棋盘
- `newRotation`: Rotation (可选) - 新旋转角度

**返回**: MoveValidation
```typescript
interface MoveValidation {
  valid: boolean
  reason?: string  // 失败原因
}
```

**验证规则**:
1. 棋子必须在棋盘上
2. 目标位置必须有效
3. 必须沿直线或对角线移动
4. 目标格子必须为空
5. 距离 > 1 时不可旋转

#### `getPossibleMoves(piece, board, includeRotations?): Move[]`

获取棋子的所有可能移动。

**参数**:
- `piece`: ChessPiece - 要检查的棋子
- `board`: BoardCell[][] - 当前棋盘
- `includeRotations`: boolean (默认 true) - 是否包含旋转选项

**返回**: Move[]
```typescript
interface Move {
  from: Position
  to: Position
  rotation?: Rotation
}
```

**用途**: 用于 UI 提示可移动位置（绿色圆圈）

#### `calculateChebyshevDistance(from, to): number`

计算切比雪夫距离（含对角线）。

**公式**: `max(|row1 - row2|, |col1 - col2|)`

**示例**:
```typescript
const dist = MoveValidator.calculateChebyshevDistance(
  { row: 0, col: 0 },
  { row: 2, col: 1 }
) // 返回 2
```

---

## 测试说明

### 单元测试

项目使用 **Vitest** 进行单元测试。

**运行测试**:
```bash
pnpm test:unit
```

**测试文件位置**:
```
src/classes/chess/__tests__/
├── EdgeMatcher.spec.ts
├── MoveValidator.spec.ts (待添加)
├── Board.spec.ts (待添加)
└── GameEngine.spec.ts (待添加)
```

### 测试示例

```typescript
// EdgeMatcher.spec.ts
import { describe, it, expect } from 'vitest'
import { EdgeMatcher } from '../EdgeMatcher'

describe('EdgeMatcher', () => {
  it('应正确匹配凸与凹', () => {
    expect(EdgeMatcher.canMatch('1+', '1-')).toBe(true)
  })

  it('不应匹配不同类型', () => {
    expect(EdgeMatcher.canMatch('1+', '1`-')).toBe(false)
  })
})
```

### 功能测试

由于游戏的交互性，建议进行**手动功能测试**：

**测试清单**:
- [ ] 棋子选择（点击高亮）
- [ ] 移动提示（绿色圆圈）
- [ ] 合法移动（8 方向）
- [ ] 非法移动（被阻止）
- [ ] 相邻移动旋转（按 R 键）
- [ ] 远距离移动不可旋转
- [ ] 鸟类原地旋转
- [ ] 回合自动切换
- [ ] 胜利条件检测
- [ ] 悔棋功能
- [ ] 重置游戏

---

## 版本历史

### v1.1 - 模块化重构（当前）- 2025-10-17

**架构重构**:
- ✅ 拆分 ChessBoard.vue（2100+ 行 → 12+ 个模块）
- ✅ 创建 3 个 Composables（useGameState, useDebugSettings, usePieceInteraction）
- ✅ 分离棋盘背景层和棋子浮动层（解决 DOM 干扰）
- ✅ 调试面板移至页面级别（ChessView.vue）
- ✅ 使用 defineExpose 实现父子组件通信

**玩家位置修正**:
- ✅ 玩家 1：起始第 3 行（底部）→ 目标第 0 行（顶部）↑
- ✅ 玩家 2：起始第 0 行（顶部）→ 目标第 3 行（底部）↓

**UI 优化**:
- ✅ 重新设计 PlayerIndicator 为游戏风格
  - 圆形头像 + 用户图标
  - 发光效果 + 脉冲动画
  - 回合徽章（"回合中"）
  - 动态边框发光
  - 目标显示（↑/↓箭头）
- ✅ 修复 CSS 变量作用域问题（棋盘格子显示）
- ✅ 修复棋子位置计算偏移（10px padding 修正）
- ✅ 点击事件从棋盘移至棋子（避免事件冲突）

**文档更新**:
- ✅ 更新 PROJECT_DOCUMENTATION.md（反映新架构）
- ✅ 创建 COMPONENT_REFACTORING.md（重构说明）
- ✅ 创建 DEBUG_PANEL_ARCHITECTURE.md（架构说明）

---

### v1.0 - 简化版本 - 2025-10-17

**核心机制**:
- ✅ 一回合一动作（移动或旋转）
- ✅ 移动后自动切换回合
- ✅ 移除行动力系统

**移动规则**:
- ✅ 无距离限制，可移动到任意空位置
- ✅ 必须沿直线或对角线（8 方向）
- ✅ 目标必须为空（不可重叠）

**旋转规则**:
- ✅ 相邻移动（距离=1）可旋转
- ✅ 远距离移动（距离>1）不可旋转
- ✅ 鸟类可原地旋转

**文档**:
- ✅ 创建完整游戏规则文档
- ✅ 合并所有项目文档

---

### v0.5 - 行动力系统（已废弃）- 2025-10-16

- ❌ 每回合 3 点行动力
- ❌ 移动消耗 1 点行动力
- ❌ 每回合限旋转 1 次
- 原因：规则过于复杂，简化为 v1.0

---

### v0.4 - 自由移动模式（已废弃）- 2025-10-15

- ❌ 无距离限制
- ❌ 允许重叠堆叠
- ❌ 移除边缘匹配
- 原因：缺乏策略性，改进为 v0.5

---

### MVP 1.0 完成（2025-10-16）

**已完成功能**:
- ✅ 核心游戏引擎
- ✅ 移动验证系统
- ✅ 棋盘管理
- ✅ UI 组件（ChessBoard.vue）
- ✅ 玩家指示器
- ✅ 移动提示功能
- ✅ 规则面板
- ✅ 旋转控制

**UI 优化**:
- ✅ 删除棋子呼吸动画
- ✅ 规则面板宽度优化（320px → 420px）
- ✅ 玩家归属视觉指示器（彩色边框）

---

## 附录

### 常见问题 FAQ

**Q: 为什么要进行模块化重构？**  
A: 原 ChessBoard.vue 超过 2100 行，难以维护。重构后拆分为 12+ 个模块，每个组件职责单一，使用 Composables 复用逻辑，大大提高了代码可维护性和可测试性。

**Q: 为什么没有使用 Pinia 状态管理？**  
A: 游戏逻辑采用 OOP 设计，GameEngine 类封装了所有状态。UI 层使用 Composables 管理响应式状态，无需额外的全局状态管理库。

**Q: Composables 和 Classes 如何协同工作？**  
A: Classes（GameEngine, MoveValidator）负责纯游戏逻辑，Composables（useGameState）负责将逻辑封装为 Vue 响应式状态，并提供给组件使用。这种混合架构兼顾了逻辑封装和响应式更新。

**Q: 为什么将调试面板移至页面级别？**  
A: 调试面板是开发工具，不属于游戏核心功能。移至 ChessView.vue 后，ChessBoardNew.vue 职责更单一，符合单一职责原则。通过 defineExpose 导出 debugState，父组件仍可访问。

**Q: 如何解决棋子位置偏移问题？**  
A: 在 `usePieceInteraction.ts` 的 `getPieceCellPosition` 函数中，添加了 10px 的 padding 偏移修正：
```typescript
left: colIndex * (cellSize + gap) + padding  // padding = 10px
```

**Q: 边缘匹配功能什么时候启用？**  
A: 当前版本为自由模式，边缘匹配已实现但未启用。未来版本可能会添加为高级模式。

**Q: 如何添加新的棋子类型？**  
A: 在 `constants/chess/pieces.ts` 中定义新的 `PIECE_DEFINITIONS`，然后在 `PieceManager` 中处理创建逻辑。

**Q: 如何修改棋盘大小？**  
A: 修改 `constants/chess/board.ts` 中的 `BOARD_SIZE` 常量，并调整起始行配置（PLAYER1_START_ROWS, PLAYER2_START_ROWS）。

**Q: 测试覆盖率如何？**  
A: 当前仅有 EdgeMatcher 的单元测试，建议添加更多测试覆盖核心逻辑（GameEngine, MoveValidator, Composables）。

**Q: 如何调试组件通信问题？**  
A: 使用 Vue DevTools 查看组件树和 props 传递。在 Composables 中添加 `console.log` 跟踪状态变化。启用调试面板（按 D 键）查看实时游戏状态。

### 术语表

| 术语 | 定义 |
|------|------|
| **回合** | 一个玩家的完整行动周期（一个动作） |
| **动作** | 移动或旋转 |
| **相邻移动** | 移动到周围 8 格之一（距离 = 1） |
| **远距离移动** | 移动距离 > 1 格 |
| **切比雪夫距离** | 包含对角线的距离计算方式 |
| **鸟类棋子** | 可以原地旋转的特殊棋子（资源 4） |
| **起始行** | 玩家开局时棋子所在的行 |
| **目标行** | 玩家需要抵达的对方起始行 |
| **OOP** | 面向对象编程（Object-Oriented Programming） |
| **MVP** | 最小可行产品（Minimum Viable Product） |

### 参考资料

- **Vue 3 官方文档**: https://cn.vuejs.org/
- **TypeScript 官方文档**: https://www.typescriptlang.org/
- **Vite 官方文档**: https://cn.vitejs.dev/
- **Vitest 官方文档**: https://cn.vitest.dev/
- **Vue 3 Composition API**: https://cn.vuejs.org/guide/extras/composition-api-faq.html

### 相关文档

- [完整项目文档](./PROJECT_DOCUMENTATION.md) - 本文档
- [待办事项清单](./TODO.md) - 开发进度跟踪
- [组件重构文档](./COMPONENT_REFACTORING.md) - 重构详细说明
- [调试面板架构](./DEBUG_PANEL_ARCHITECTURE.md) - 调试工具设计

---

**项目维护者**: [Your Name]  
**许可证**: MIT  
**最后更新**: 2025-10-17  
**版本**: v1.1（模块化重构版本）

---

> 📝 **文档说明**: 本文档整合了项目的所有核心信息，包括游戏规则、技术架构、组件设计、开发指南、API 文档等。v1.1 版本完成了重大架构重构，将单一的 2100+ 行组件拆分为模块化架构，大幅提升了代码质量和可维护性。如有疑问，请参考源代码或相关文档。
