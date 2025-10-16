# Copilot 使用说明：拼图棋盘游戏项目

## 项目概述

该项目分为**两个阶段的游戏开发**：

1. **简单拼图游戏**（已完成）
   位于 `src/components/PuzzleBoard.vue`，4×4 拖拽拼图。
2. **拼图棋盘游戏（Puzzle Chess）**（设计中）
   一个具有拼接匹配机制的战略 8×8 棋盘游戏。

**当前状态**：Phase 1 已完成，Phase 2 正在设计阶段，逻辑仅记录于 `docs/` 文件夹中，尚未实现。

---

## 架构核心区别

### 阶段一：简单拼图（已实现）

* **位置**：`src/types/puzzle.ts`、`src/classes/Puzzle*.ts`、`src/components/PuzzleBoard.vue`
* **功能**：4×4 拖拽拼图游戏，胜利条件为第一行拼对（1~4 顺序）
* **关键类**：`PuzzleBoard`, `PuzzleGame`
* **数据结构**：简单的 `PuzzlePiece`（包含 `id`、`currentPosition`、`isPlaced`）

### 阶段二：拼图棋盘（仅设计）

* **文档位置**：`docs/DESIGN_DOCUMENT.md`、`docs/ROADMAP.md`、`docs/QUICK_DEV_GUIDE.md`
* **功能**：8×8 棋盘策略游戏，带有**边缘匹配机制**
* **未来目录**：`src/types/chess/`、`src/classes/chess/`、`src/components/chess/`
* **核心机制**：4 种边缘类型（`1+`、`1-`、`1\`+`、`1`-`）必须正确配对。

⚠️ **切勿将两种游戏逻辑混用！**

---

## 边缘匹配系统（仅 Phase 2）

棋盘游戏的核心是**边缘兼容性**：

```typescript
// 边缘类型（参考 docs/DESIGN_DOCUMENT.md 第1.1节）
type EdgeType = '1+' | '1-' | '1`+' | '1`-'

// 匹配规则
'1+'  ←→ '1-'   ✓（凸配凹）
'1`+' ←→ '1`-'  ✓（反凸配反凹）
'1+'  ←→ '1`-'  ✗（类型不同不匹配）
```

**4 种棋子形状**（来自 SVG 资源）：

* 棋子 1：`top:'1-'`, `right:'1\`-'`, `bottom:'1`-'`, `left:'1-'`
* 棋子 2：`top:'1+'`, `right:'1-'`, `bottom:'1\`-'`, `left:'1`+'`
* 棋子 3：`top:'1\`+'`, `right:'1-'`, `bottom:'1`-'`, `left:'1+'`
* 棋子 4：`top:'1\`+'`, `right:'1+'`, `bottom:'1`+'`, `left:'1+'`

---

## 开发工作流

### 运行项目

```bash
pnpm dev          # 启动开发服务器（目前显示简单拼图）
pnpm test:unit    # 运行 Vitest 单元测试
pnpm build        # 类型检查并构建
```

### 添加新功能

1. **简单拼图**：直接修改 `src/` 中现有文件
2. **拼图棋盘**：遵循 `docs/ROADMAP.md` 中的 MVP 1.0 任务

   * 创建 `src/types/chess/` 类型定义
   * 创建 `src/classes/chess/EdgeMatcher.ts` 作为首个类
   * 创建 `src/constants/chess/pieces.ts` 保存棋子形状
   * 按照 `docs/QUICK_DEV_GUIDE.md` 示例实现

### 计划文件结构

```
src/
├── types/
│   ├── puzzle.ts      # 简单拼图（已存在）
│   └── chess/         # 棋盘游戏类型（待创建）
├── classes/
│   ├── Puzzle*.ts     # 简单拼图逻辑
│   └── chess/         # 棋盘游戏逻辑（待创建）
├── constants/chess/   # 棋子形状与棋盘配置（待创建）
└── components/
    ├── PuzzleBoard.vue       # 简单拼图（已存在）
    └── chess/                # 棋盘游戏界面（待创建）
```

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
2. ✅ 棋子 SVG 已位于 `src/assets/pieces/`（piece1.svg ~ piece4.svg）
3. ⚙️ 棋盘尺寸不同：拼图 4×4，棋盘 8×8
4. 🧩 胜利条件不同：拼图检查顶行；棋盘要求所有棋子抵达对侧
5. 📖 设计文档使用中文，但代码/注释遵循项目语言约定（英文）

---

## MVP 实现优先级（Phase 2）

根据 `docs/ROADMAP.md`：

1. **P0（MVP 1.0）**：`EdgeMatcher` → `MoveValidator` → `Board` → 基础 UI
2. **P1（MVP 2.0）**：威胁机制 → 简易 AI
3. **P2（MVP 3.0）**：高级 AI → 动画 → 状态持久化

---

## 若遇不清楚部分

* 查阅 `docs/DESIGN_DOCUMENT.md` 第 1~3 节（详细算法）
* 查阅 `docs/ROADMAP.md` Day 1~5（立即可执行任务）
* **边缘匹配机制** 是该项目的独特核心（详见设计文档第1.1节）

## 进度

实时的修改,docs/TODO.md.以便于查看当前的进度.
如果在过程中遇到了新的问题但是暂时并不解决的也要创建新增的待办事项.