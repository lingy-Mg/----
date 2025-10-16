# Copilot 使用说明：拼图棋盘游戏项目

## 项目概述

该项目分为**两个阶段的游戏开发**：

1. **简单拼图游戏**（已完成）
   位于 `src/components/PuzzleBoard.vue`，4×4 拖拽拼图。
2. **拼图棋盘游戏（Puzzle Chess）**（已完成 MVP 1.0 ✅）
   一个具有拼接匹配机制的战略 4×4 棋盘游戏。

**当前状态**：
- Phase 1（简单拼图）：已完成 ✅
- Phase 2（棋盘游戏）：MVP 1.0 基础可玩版本已完成 ✅
  - 核心类完成：EdgeMatcher, MoveValidator, Board, GameEngine
  - UI 完成：ChessBoard.vue（带移动提示功能）
  - 已设为首页，可直接访问

---

## 架构核心区别

### 阶段一：简单拼图（已实现）

* **位置**：`src/types/puzzle.ts`、`src/classes/Puzzle*.ts`、`src/components/PuzzleBoard.vue`
* **功能**：4×4 拖拽拼图游戏，胜利条件为第一行拼对（1~4 顺序）
* **关键类**：`PuzzleBoard`, `PuzzleGame`
* **数据结构**：简单的 `PuzzlePiece`（包含 `id`、`currentPosition`、`isPlaced`）

### 阶段二：拼图棋盘（已实现 ✅）

* **实现位置**：
  - 类型：`src/types/chess/index.ts`
  - 核心类：`src/classes/chess/`（EdgeMatcher, MoveValidator, Board, GameEngine, PieceManager）
  - 常量：`src/constants/chess/`（pieces.ts, board.ts）
  - UI 组件：`src/components/chess/ChessBoard.vue`
  - 视图：`src/views/ChessView.vue`（已设为首页）
* **功能**：4×4 棋盘策略游戏，带有**边缘匹配机制**
* **核心机制**：4 种边缘类型（`1+`、`1-`、`1\`+`、`1\`-`）必须正确配对

⚠️ **切勿将两种游戏逻辑混用！**

---

## 边缘匹配系统（Phase 2 - 已实现）

棋盘游戏的核心是**边缘兼容性**：

```typescript
// 边缘类型（参考 docs/DESIGN_DOCUMENT.md 第1.1节）
type EdgeType = '1+' | '1-' | '1`+' | '1`-'

// 匹配规则
'1+'  ←→ '1-'   ✓（凸配凹）
'1`+' ←→ '1`-'  ✓（反凸配反凹）
'1+'  ←→ '1`-'  ✗（类型不同不匹配）
```

**4 种棋子形状**（来自 `/SVG/资源 X.svg`）：

* 棋子 1：`top:'1-'`, `right:'1\`-'`, `bottom:'1\`-'`, `left:'1-'`
* 棋子 2：`top:'1+'`, `right:'1-'`, `bottom:'1\`-'`, `left:'1\`+'`
* 棋子 3：`top:'1\`+'`, `right:'1-'`, `bottom:'1\`-'`, `left:'1+'`
* 棋子 4：`top:'1\`+'`, `right:'1+'`, `bottom:'1\`+'`, `left:'1+'`

---

## 开发工作流

### 运行项目

```bash
pnpm dev          # 启动开发服务器 (首页为棋盘游戏)
pnpm test:unit    # 运行 Vitest 单元测试
pnpm build        # 类型检查并构建
```

### 当前文件结构

```
src/
├── types/
│   ├── puzzle.ts      # 简单拼图类型
│   └── chess/         # 棋盘游戏类型 ✅
│       └── index.ts
├── classes/
│   ├── Puzzle*.ts     # 简单拼图逻辑
│   └── chess/         # 棋盘游戏核心类 ✅
│       ├── EdgeMatcher.ts
│       ├── MoveValidator.ts
│       ├── Board.ts
│       ├── GameEngine.ts
│       ├── PieceManager.ts
│       └── __tests__/
├── constants/
│   └── chess/         # 棋盘配置 ✅
│       ├── pieces.ts
│       └── board.ts
├── components/
│   ├── PuzzleBoard.vue       # 简单拼图
│   └── chess/                # 棋盘游戏 UI ✅
│       └── ChessBoard.vue
├── views/
│   └── ChessView.vue         # 棋盘游戏视图（首页）✅
└── router/
    └── index.ts              # 路由配置（首页=棋盘）✅
```

---

## 最新实现特性（2025-10-16）

### ✅ MVP 1.0 完成功能

1. **核心游戏引擎**：
   - EdgeMatcher：边缘匹配验证
   - MoveValidator：移动合法性验证（8方向 + 切比雪夫距离）
   - Board：4×4 棋盘管理
   - GameEngine：完整游戏状态管理
   - PieceManager：棋子初始化和管理

2. **UI 组件**（ChessBoard.vue）：
   - 红色背景 4×4 棋盘，白色网格线
   - 棋子选择与移动（点击交互）
   - 旋转功能（R 键或按钮）
   - **移动提示**：选中棋子后绿色圆圈高亮可移动位置 🎯
   - 游戏状态显示：当前玩家、回合数、胜利信息
   - 控制按钮：撤销、重置、Pass
   - 规则面板：完整的游戏规则说明（5大模块）

3. **路由设置**：
   - ChessView 已设为首页（`/`）
   - 删除旧的 HomeView、AboutView
   - 精简为单页应用

### 🎮 游戏机制

- **棋盘尺寸**：4×4（已从 8×8 重构）
- **起始区域**：Player1 第0行，Player2 第3行
- **结束区域**：Player1 第3行，Player2 第0行
- **胜利条件**：将所有棋子移至对侧结束区域
- **边缘匹配**：移动后的棋子必须与相邻棋子边缘匹配
- **移动规则**：8方向移动，最多3步距离，不可重叠

---

## TypeScript 模式说明

### 面向对象的游戏逻辑

项目使用 **OOP 类结构** 管理游戏状态（核心逻辑不使用 Pinia）：

```typescript
// 示例：PuzzleBoard.ts
export class PuzzleBoard {
  private board: BoardCell[]

  constructor(size: number = 4) {
    this.initBoard()
  }

  // 公共方法
  placePiece(pieceId: number, position: number): boolean { }

  // 私有辅助方法
  private checkWinCondition(): void { }
}
```

### 类型导入约定

统一使用 type-only 导入接口：

```typescript
import type { PuzzlePiece, BoardCell } from '@/types/puzzle'
```

---

## 测试策略（来自设计文档）

### 棋盘游戏关键测试用例

1. **EdgeMatcher**：测试 16 种边缘组合（4×4 矩阵）
2. **旋转逻辑**：验证 0°/90°/180°/270° 旋转后的边缘值
3. **移动验证**：8 个方向 × 3 移动距离 × 多种旋转场景

示例（来自 `docs/QUICK_DEV_GUIDE.md`）：

```typescript
describe('EdgeMatcher', () => {
  it('应正确匹配凸与凹', () => {
    expect(EdgeMatcher.canMatch('1+', '1-')).toBe(true)
  })
})
```

---

## 文档导航

在实现棋盘游戏特性前，务必先阅读以下文档：

* `docs/README.md`：文档索引
* `docs/DESIGN_SUMMARY.md`：10分钟速览
* `docs/DESIGN_DOCUMENT.md`：完整算法伪代码（3.1~3.3节）
* `docs/ROADMAP.md`：按天任务拆解
* `docs/QUICK_DEV_GUIDE.md`：可直接复制的示例代码

---

## 常见错误避免

1. ❌ 不要在 `src/types/puzzle.ts` 中添加棋盘逻辑
2. ✅ 棋子 SVG 位于 `/SVG/资源 X.svg`（资源 1.svg ~ 资源 4.svg）
3. ⚙️ 棋盘尺寸：
   - 简单拼图：4×4
   - 棋盘游戏：4×4（已从 8×8 重构）
4. 🧩 胜利条件不同：
   - 简单拼图：检查顶行顺序
   - 棋盘游戏：所有棋子抵达对侧
5. 📖 项目使用中文，包含文档和注释
6. 🎯 移动提示：使用 `GameEngine.getPossibleMovesForPiece(piece)` 获取合法移动
7. 🔄 不要自动提交 Git，由用户手动控制

---

## MVP 实现进度

### ✅ 已完成（MVP 1.0）

1. **核心系统**：
   - ✅ EdgeMatcher（边缘匹配）
   - ✅ MoveValidator（移动验证）
   - ✅ Board（棋盘管理）
   - ✅ GameEngine（游戏引擎）
   - ✅ PieceManager（棋子管理）

2. **UI 功能**：
   - ✅ ChessBoard.vue 组件
   - ✅ 棋盘渲染（4×4 红色背景）
   - ✅ 棋子选择与移动
   - ✅ 旋转功能（R 键）
   - ✅ 移动提示（绿色圆圈）
   - ✅ 游戏状态显示
   - ✅ 规则面板（5大模块）
   - ✅ 设为首页

3. **测试**：
   - ✅ EdgeMatcher 单元测试
   - ✅ MoveValidator 单元测试
   - ✅ Board 单元测试
   - ✅ GameEngine 单元测试

### 🔄 待完成（当前任务）

- [ ] SVG 文件加载验证
- [ ] 添加旋转控制 UI 优化
- [ ] AI 对手（暂不实现，见 TODO.md）
- [ ] 在线对战（暂不实现，见 TODO.md）

---

## MVP 实现优先级（参考）

根据 `docs/ROADMAP.md`：

1. **P0（MVP 1.0）** ✅：EdgeMatcher → MoveValidator → Board → GameEngine → 基础 UI
2. **P1（MVP 2.0）** ⏸️：威胁机制 → 简易 AI（暂不实现）
3. **P2（MVP 3.0）** ⏸️：高级 AI → 动画 → 状态持久化（暂不实现）

---

## 若遇不清楚部分

* 查阅 `docs/DESIGN_DOCUMENT.md` 第 1~3 节（详细算法）
* 查阅 `docs/ROADMAP.md` Day 1~5（立即可执行任务）
* **边缘匹配机制** 是该项目的独特核心（详见设计文档第1.1节）

## 进度

实时的修改,docs/TODO.md.以便于查看当前的进度.
如果在过程中遇到了新的问题但是暂时并不解决的也要创建新增的待办事项.
不要提交git,必要的时候我手动提交