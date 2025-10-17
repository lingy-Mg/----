# Copilot 使用说明：拼图棋盘游戏项目

> **📖 完整文档**: 查看 `docs/PROJECT_DOCUMENTATION.md` 获取详细的项目信息

## 项目概述

该项目分为**两个阶段的游戏开发**：

1. **简单拼图游戏**（已完成 ✅）
   - 位于 `src/components/PuzzleBoard.vue`
   - 4×4 拖拽拼图游戏
   
2. **拼图棋盘游戏（Puzzle Chess）**（v1.1 已完成 ✅）
   - 4×4 双人回合制策略游戏
   - 一回合一动作机制（移动或旋转）
   - 核心类完成：GameEngine, MoveValidator, Board, PieceManager
   - **模块化架构**：ChessBoardNew.vue（主组件）+ 12+ 个子组件
   - **Composables 模式**：useGameState, useDebugSettings, usePieceInteraction
   - 已设为首页，可直接访问

**当前版本**: v1.1（模块化重构版本）- 2025-10-17  
**状态**: MVP 完成，架构重构完成，可玩测试版

---

## 🎮 游戏规则（v1.1）

### 玩家起始位置（已修正）

- **玩家 1（蓝色）**: 起始第 3 行（底部）→ 目标第 0 行（顶部）↑
- **玩家 2（红色）**: 起始第 0 行（顶部）→ 目标第 3 行（底部）↓

### 核心机制

- **回合制**: 玩家轮流行动
- **一回合一动作**: 每回合只能执行一个动作（移动或旋转）
- **自动切换**: 完成动作后自动切换到对方回合

### 移动规则

- ✅ **无距离限制**: 可移动到棋盘任意空位置
- ✅ **8 个方向**: 直线（上/下/左/右）+ 对角线（4个）
- ✅ **不可重叠**: 目标格子必须为空
- ✅ **必须直线或对角线**: 使用切比雪夫距离计算

### 旋转规则

- **相邻移动（距离 = 1）**: 移动到相邻 8 格后，可选择是否旋转
- **远距离移动（距离 > 1）**: 不能旋转，只能移动
- **鸟类特权**: 资源 4 棋子可原地旋转（不移动）
- **旋转角度**: 90° 增量（0°、90°、180°、270°）

### 胜利条件

- **玩家 1**: 将所有棋子移至第 0 行（顶部）
- **玩家 2**: 将所有棋子移至第 3 行（底部）

---

## 架构核心

### 混合架构设计

项目采用 **OOP（游戏逻辑）+ Composables（UI 逻辑）** 混合架构：

**游戏逻辑层（OOP）**:
```typescript
// 游戏引擎 - 管理游戏状态
class GameEngine {
  private gameState: GameState
  
  initializeGameState(): GameState
  executeMove(piece, toPosition, rotation?): boolean  // 移动后自动切换回合
  rotatePiece(piece): boolean  // 仅鸟类原地旋转
  switchTurn(): void
  checkWinCondition(): void
}

// 移动验证器 - 验证移动合法性
class MoveValidator {
  static validateMove(piece, toPosition, board, rotation?): MoveValidation
  static getPossibleMoves(piece, board): Move[]
  static calculateChebyshevDistance(from, to): number
}
```

**UI 逻辑层（Composables）**:
```typescript
// useGameState.ts - 游戏状态管理
export function useGameState() {
  const gameEngine = ref<GameEngine | null>(null)
  const selectedCell = ref<ChessPiece | null>(null)
  
  function executeMove(piece, to, rotation?) { }
  function rotatePiece() { }
  function undoMove() { }
  
  return { gameEngine, selectedCell, ... }
}

// useDebugSettings.ts - 调试设置（localStorage 持久化）
export function useDebugSettings() {
  const showDebug = ref(false)
  const debugSettings = reactive({ ... })
  
  return { showDebug, debugSettings, ... }
}

// usePieceInteraction.ts - 棋子交互逻辑
export function usePieceInteraction(gameState, debugState) {
  function handlePieceClick(piece) { }
  function getPieceCellPosition(piece) { }  // 含 10px padding 修正
  
  return { handlePieceClick, getPieceCellPosition, ... }
}
```

### 核心类型（v1.1）

```typescript
// 游戏状态（简化版本）
interface GameState {
  currentPlayer: Player          // 当前玩家（1 或 2）
  board: BoardCell[][]          // 4×4 棋盘
  player1Pieces: ChessPiece[]   // 玩家 1 的棋子
  player2Pieces: ChessPiece[]   // 玩家 2 的棋子
  moveHistory: Move[]           // 移动历史
  winner: Player | null         // 获胜者
  turnNumber: number            // 回合数
  // ❌ 已移除: actionPoints, maxActionPoints, hasRotatedThisTurn
}

// 棋子
interface ChessPiece {
  id: number
  shapeId: number        // 1-4（对应 SVG 资源）
  player: Player
  position: Position | null
  rotation: Rotation     // 0 | 90 | 180 | 270
  isOnBoard: boolean
  isBird: boolean        // 资源 4 = 鸟类（可原地旋转）
}
```

---

## 文件结构（v1.1 模块化架构）

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
│       ├── MoveValidator.ts   # 移动验证（已添加中文注释）
│       ├── Board.ts           # 棋盘管理
│       ├── GameEngine.ts      # 游戏引擎（v1.0 简化版）
│       ├── PieceManager.ts    # 棋子管理
│       └── __tests__/         # 单元测试
├── constants/
│   └── chess/                 # 棋盘配置 ✅
│       ├── pieces.ts          # 棋子定义
│       └── board.ts           # BOARD_SIZE = 4, 玩家起始位置
├── components/
│   ├── PuzzleBoard.vue        # 简单拼图
│   └── chess/                 # 棋盘游戏 UI（模块化架构）✅
│       ├── ChessBoardNew.vue  # 主容器（新架构，200+ 行）✅
│       ├── ChessBoard.vue.old # 旧版本（2100+ 行，已废弃）
│       ├── composables/       # 组合式函数 ✅
│       │   ├── useGameState.ts          # 游戏状态管理
│       │   ├── useDebugSettings.ts      # 调试设置
│       │   └── usePieceInteraction.ts   # 棋子交互逻辑
│       ├── board/             # 棋盘组件 ✅
│       │   ├── BoardBackground.vue      # 棋盘背景层（Grid 布局）
│       │   ├── PiecesLayer.vue          # 棋子浮动层（绝对定位）
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
    └── index.ts               # 路由配置 ✅

docs/
├── PROJECT_DOCUMENTATION.md   ⭐ 完整项目文档（v1.1）
├── TODO.md                    📝 待办事项清单
├── COMPONENT_REFACTORING.md   📐 组件重构文档
└── DEBUG_PANEL_ARCHITECTURE.md �️ 调试面板架构说明
```

### 模块化架构说明（v1.1 重构）

**重构成果**:
- ✅ 将 2100+ 行的 ChessBoard.vue 拆分为 12+ 个模块
- ✅ 创建 3 个 Composables 封装逻辑
- ✅ 分离棋盘背景层和棋子浮动层（解决 DOM 干扰）
- ✅ 调试面板移至页面级别（ChessView.vue）
- ✅ 使用 defineExpose 实现父子组件通信

**组件职责**:
- **ChessBoardNew.vue**: 主容器，协调子组件
- **Composables**: 逻辑复用（游戏状态、调试设置、棋子交互）
- **board/**: 棋盘渲染（背景、棋子层、单个棋子）
- **ui/**: UI 显示（玩家指示器、游戏状态）
- **panels/**: 功能面板（游戏控制、调试、规则）

---

## 开发工作流

### 运行项目

```bash
pnpm install      # 安装依赖
pnpm dev          # 启动开发服务器（首页为棋盘游戏）
pnpm build        # 类型检查并构建
pnpm test:unit    # 运行 Vitest 单元测试
```

### 代码规范

1. **TypeScript 类型**:
   ```typescript
   // ✅ 使用 type-only 导入
   import type { ChessPiece, GameState } from '@/types/chess'
   
   // ✅ 所有函数都要有类型注解
   function executeMove(piece: ChessPiece, to: Position): boolean { }
   
   // ❌ 避免使用 any
   ```

2. **命名约定**:
   - 类名: `PascalCase`（如 `GameEngine`）
   - 方法/变量: `camelCase`（如 `executeMove`）
   - 常量: `UPPER_SNAKE_CASE`（如 `BOARD_SIZE`）
   - Composables: `use` 前缀（如 `useGameState`）

3. **注释**:
   - 类和公共方法使用 JSDoc 注释
   - 关键逻辑添加中文注释
   - 复杂算法添加示例

4. **组件设计原则**:
   - 单一职责原则（每个组件只做一件事）
   - Props down, Events up（单向数据流）
   - 使用 Composables 复用逻辑
   - 避免深层 Props drilling（使用 provide/inject 或 Composables）

---

## 重要特性和限制

### ✅ 当前版本特性（v1.1）

**游戏功能**:
1. **一回合一动作**: 简洁易懂的回合机制
2. **无距离限制**: 可快速移动到棋盘任意位置
3. **智能旋转**: 相邻移动可旋转，远距离不可旋转
4. **鸟类特权**: 资源 4 棋子可原地旋转
5. **移动提示**: 选中棋子后绿色圆圈显示可移动位置

**UI 优化**:
6. **玩家指示器**: 游戏风格设计（圆形头像 + 发光效果 + 回合徽章）
7. **层级分离**: 棋盘背景层 + 棋子浮动层（解决显示问题）
8. **完整规则面板**: UI 右侧显示详细游戏规则

**架构优势**:
9. **模块化组件**: 12+ 个独立组件，易于维护
10. **Composables 复用**: 3 个核心 composable 封装逻辑
11. **页面级调试**: 调试面板在 ChessView.vue 管理
12. **位置修正**: 10px padding 偏移修正

### ❌ 已移除的功能

1. **行动力系统**（v0.5 已废弃）:
   - ❌ 每回合 3 点行动力
   - ❌ 移动消耗 1 点行动力
   - ❌ 每回合限旋转 1 次

2. **棋子重叠**（v0.4 已废弃）:
   - ❌ 允许棋子堆叠
   - ❌ 只能移动最顶层棋子

3. **距离限制**（早期版本）:
   - ❌ 1-3 步距离限制
   - ✅ 现在无距离限制

### 🔧 暂未启用的功能

- **边缘匹配**: EdgeMatcher 类已实现，但当前为自由模式
  - 边缘类型: `'1+'`, `'1-'`, `'1\`+'`, `'1\`-'`
  - 匹配规则: `'1+' ←→ '1-'`, `'1\`+' ←→ '1\`-'`
  - 未来版本可能作为高级模式启用

---

## 关键 API

### GameEngine

```typescript
// 初始化游戏
const engine = new GameEngine()
const state = engine.initializeGameState()

// 执行移动（移动后自动切换回合）
const piece = state.player1Pieces[0]
engine.executeMove(piece, { row: 1, col: 0 })

// 相邻移动时可旋转
engine.executeMove(piece, { row: 1, col: 1 }, 90)

// 鸟类原地旋转
const birdPiece = state.player1Pieces[3]  // 资源 4
engine.rotatePiece(birdPiece)

// 悔棋
engine.undoMove()
```

### Composables

```typescript
// 在组件中使用
import { useGameState } from './composables/useGameState'
import { useDebugSettings } from './composables/useDebugSettings'
import { usePieceInteraction } from './composables/usePieceInteraction'

const gameState = useGameState()
const debugState = useDebugSettings()
const interaction = usePieceInteraction(gameState, debugState)

// 使用 Composable 提供的方法
gameState.executeMove(piece, position)
interaction.handlePieceClick(piece)
```

### MoveValidator

```typescript
// 验证移动
const validation = MoveValidator.validateMove(
  piece,
  { row: 2, col: 2 },
  state.board,
  90  // 可选旋转角度
)

// 获取所有可能的移动（用于 UI 提示）
const possibleMoves = MoveValidator.getPossibleMoves(piece, state.board)

// 计算切比雪夫距离
const distance = MoveValidator.calculateChebyshevDistance(
  { row: 0, col: 0 },
  { row: 2, col: 1 }
) // 返回 2
```

---

## 架构关键点

### 1. 层级分离（解决 DOM 干扰）

```vue
<div class="chess-board-wrapper">
  <!-- 背景层：Grid 布局 -->
  <BoardBackground :board-cells="boardCells" />
  
  <!-- 棋子层：绝对定位浮动层 -->
  <PiecesLayer :board-cells="boardCells" />
</div>
```

### 2. 位置计算修正

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

### 3. 页面级调试面板

```vue
<!-- ChessView.vue -->
<template>
  <ChessBoardNew ref="chessBoardRef" />
  <DebugPanel
    v-if="chessBoardRef?.debugState"
    :show-debug="chessBoardRef.debugState.showDebug.value"
    ...
  />
</template>

<!-- ChessBoardNew.vue -->
<script setup>
defineExpose({
  debugState,
  gameState
})
</script>
```

### 4. Props 传递模式

- **ChessBoardNew.vue**: 协调器，不接收 props
- **子组件**: 接收特定 props，职责单一
- **Composables**: 提供响应式状态和方法

---

## 文档导航

- **完整项目文档**: `docs/PROJECT_DOCUMENTATION.md` ⭐
  - 项目概述、游戏规则、技术架构
  - 代码结构、开发指南、API 文档
  - 测试说明、版本历史、FAQ

- **待办事项**: `docs/TODO.md`
  - 当前进度、已完成任务
  - 版本演化历史

- **组件重构文档**: `docs/COMPONENT_REFACTORING.md`
  - 重构详细说明
  - 组件拆分方案

- **调试面板架构**: `docs/DEBUG_PANEL_ARCHITECTURE.md`
  - 架构设计说明
  - 页面级工具模式

---

## 进度管理

- **实时更新**: 修改代码后更新 `docs/TODO.md`
- **问题追踪**: 遇到新问题创建待办事项
- **版本控制**: 由用户手动提交 Git
- **文档同步**: 重大变更后更新 `PROJECT_DOCUMENTATION.md`

---

## 常见问题

### Q: 为什么要进行模块化重构？
A: 原 ChessBoard.vue 超过 2100 行，难以维护。重构后拆分为 12+ 个模块，每个组件职责单一，使用 Composables 复用逻辑。

### Q: Composables 和 Classes 如何协同工作？
A: Classes（GameEngine, MoveValidator）负责纯游戏逻辑，Composables（useGameState）负责将逻辑封装为 Vue 响应式状态。

### Q: 为什么将调试面板移至页面级别？
A: 调试面板是开发工具，不属于游戏核心功能。移至 ChessView.vue 后，ChessBoardNew.vue 职责更单一。

### Q: 如何添加新的子组件？
A: 
1. 在 `components/chess/` 对应目录创建组件
2. 在父组件（ChessBoardNew.vue）中导入
3. 传递必要的 props 或使用 Composables
4. 遵循单一职责原则

---

## 若遇不清楚部分

1. **完整文档**: 查阅 `docs/PROJECT_DOCUMENTATION.md`
2. **API 参考**: 查看完整文档的 "API 文档" 章节
3. **游戏规则**: 查看完整文档的 "游戏规则" 章节
4. **组件架构**: 查看 `COMPONENT_REFACTORING.md`
5. **FAQ**: 查看完整文档的 "附录 - 常见问题" 章节

---

**项目语言**: 中文（代码注释、文档、UI）  
**技术栈**: Vue 3 + TypeScript + Vite  
**设计模式**: OOP + Composables（混合架构）  
**架构特点**: 模块化组件 + 层级分离 + 页面级工具  
**最后更新**: 2025-10-17  
**当前版本**: v1.1（模块化重构版本）



不要每次创建总结文档