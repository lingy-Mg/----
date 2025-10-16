# Copilot 使用说明：拼图棋盘游戏项目

> **📖 完整文档**: 查看 `docs/PROJECT_DOCUMENTATION.md` 获取详细的项目信息

## 项目概述

该项目分为**两个阶段的游戏开发**：

1. **简单拼图游戏**（已完成 ✅）
   - 位于 `src/components/PuzzleBoard.vue`
   - 4×4 拖拽拼图游戏
   
2. **拼图棋盘游戏（Puzzle Chess）**（v1.0 已完成 ✅）
   - 4×4 双人回合制策略游戏
   - 一回合一动作机制（移动或旋转）
   - 核心类完成：GameEngine, MoveValidator, Board, PieceManager
   - UI 完成：ChessBoard.vue（带移动提示、规则面板）
   - 已设为首页，可直接访问

**当前版本**: v1.0（简化版本）- 2025-10-17  
**状态**: MVP 完成，可玩测试版

---

## 🎮 游戏规则（v1.0）

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

- **玩家 1**: 将所有棋子移至第 3 行（底部）
- **玩家 2**: 将所有棋子移至第 0 行（顶部）

---

## 架构核心

### OOP 设计模式

项目使用 **面向对象编程（OOP）** 管理游戏状态，**不使用 Pinia**：

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

### 核心类型（v1.0）

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

## 文件结构

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
│       └── board.ts           # BOARD_SIZE = 4
├── components/
│   ├── PuzzleBoard.vue        # 简单拼图
│   └── chess/                 # 棋盘游戏 UI ✅
│       └── ChessBoard.vue     # 主组件（含规则面板）
├── views/
│   └── ChessView.vue          # 棋盘游戏视图（首页）✅
└── router/
    └── index.ts               # 路由配置 ✅

docs/
├── PROJECT_DOCUMENTATION.md   ⭐ 完整项目文档（新）
├── TODO.md                    📝 待办事项清单
└── DOCUMENTATION_MERGE.md     📋 文档合并说明
```

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

3. **注释**:
   - 类和公共方法使用 JSDoc 注释
   - 关键逻辑添加中文注释
   - 复杂算法添加示例

---

## 重要特性和限制

### ✅ 当前版本特性（v1.0）

1. **一回合一动作**: 简洁易懂的回合机制
2. **无距离限制**: 可快速移动到棋盘任意位置
3. **智能旋转**: 相邻移动可旋转，远距离不可旋转
4. **鸟类特权**: 资源 4 棋子可原地旋转
5. **移动提示**: 选中棋子后绿色圆圈显示可移动位置
6. **玩家指示器**: 顶部/底部显示当前回合玩家
7. **完整规则面板**: UI 右侧显示详细游戏规则

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

## 常见错误避免

1. ❌ **不要混用两个游戏的逻辑**:
   - 简单拼图: `src/types/puzzle.ts`, `PuzzleBoard.vue`
   - 棋盘游戏: `src/types/chess/`, `ChessBoard.vue`

2. ❌ **不要添加已废弃的功能**:
   - 不要添加行动力系统（actionPoints）
   - 不要允许棋子重叠
   - 不要限制移动距离为 1-3 步

3. ✅ **正确的数据位置**:
   - 棋子 SVG: `/SVG/资源 X.svg`（1-4）
   - 棋盘大小: 4×4（不是 8×8）
   - 玩家 1 起始: 第 0 行（顶部）
   - 玩家 2 起始: 第 3 行（底部）

4. ✅ **移动提示实现**:
   ```typescript
   // 使用 GameEngine 获取可能的移动
   const possibleMoves = gameEngine.getPossibleMovesForPiece(selectedPiece)
   ```

5. 🔄 **不要自动提交 Git**:
   - 由用户手动控制版本提交
   - 修改代码后更新 `docs/TODO.md`

---

## 测试策略

### 单元测试

```typescript
// 测试边缘匹配（EdgeMatcher）
describe('EdgeMatcher', () => {
  it('应正确匹配凸与凹', () => {
    expect(EdgeMatcher.canMatch('1+', '1-')).toBe(true)
  })
})

// 测试移动验证（MoveValidator）
describe('MoveValidator', () => {
  it('应验证直线移动', () => {
    const validation = MoveValidator.validateMove(piece, target, board)
    expect(validation.valid).toBe(true)
  })
})
```

### 功能测试

由于游戏的交互性，主要通过**手动测试**：

- [ ] 棋子选择（黄色高亮）
- [ ] 移动提示（绿色圆圈）
- [ ] 合法移动（8 方向）
- [ ] 相邻移动旋转（R 键）
- [ ] 远距离移动不可旋转
- [ ] 鸟类原地旋转
- [ ] 回合自动切换
- [ ] 胜利条件检测

---

## 文档导航

- **完整项目文档**: `docs/PROJECT_DOCUMENTATION.md` ⭐
  - 项目概述、游戏规则、技术架构
  - 代码结构、开发指南、API 文档
  - 测试说明、版本历史、FAQ

- **待办事项**: `docs/TODO.md`
  - 当前进度、已完成任务
  - 版本演化历史

- **文档合并说明**: `docs/DOCUMENTATION_MERGE.md`
  - 文档整合过程
  - 删除的过时信息

---

## 版本历史

### v1.0 - 简化版本（当前）- 2025-10-17
- ✅ 一回合一动作机制
- ✅ 移除行动力系统
- ✅ 无距离限制
- ✅ 智能旋转规则
- ✅ 不可重叠
- ✅ 完整文档整合

### v0.5 - 行动力系统（已废弃）
- ❌ 每回合 3 点行动力
- 原因：规则过于复杂

### v0.4 - 自由移动模式（已废弃）
- ❌ 允许棋子重叠
- 原因：缺乏策略性

---

## 进度管理

- **实时更新**: 修改代码后更新 `docs/TODO.md`
- **问题追踪**: 遇到新问题创建待办事项
- **版本控制**: 由用户手动提交 Git
- **文档同步**: 重大变更后更新 `PROJECT_DOCUMENTATION.md`

---

## 若遇不清楚部分

1. **完整文档**: 查阅 `docs/PROJECT_DOCUMENTATION.md`
2. **API 参考**: 查看完整文档的 "API 文档" 章节
3. **游戏规则**: 查看完整文档的 "游戏规则" 章节
4. **代码示例**: 查看完整文档的 "开发指南" 章节
5. **FAQ**: 查看完整文档的 "附录 - 常见问题" 章节

---

**项目语言**: 中文（代码注释、文档、UI）  
**技术栈**: Vue 3 + TypeScript + Vite  
**设计模式**: OOP（面向对象编程）  
**最后更新**: 2025-10-17