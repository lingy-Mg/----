# 拼图棋游戏 - 快速开发指南

## 🚀 立即开始

### 第一步：理解游戏规则

#### 核心概念
1. **棋子形状**: 每个棋子有4条边（上/右/下/左），每条边有凸凹状态
2. **拼接规则**: 凸边(+)必须与凹边(-)匹配，像拼图一样
3. **移动规则**: 
   - 可向8个方向移动（直线+对角线）
   - 移动1-3格
   - 如需旋转，只能移动1格
   - 移动后必须与至少一个棋子拼接

#### 边缘类型系统
```
1+   : 凸出边（正向）  ──┐
1-   : 凹入边（正向）  ──┘
1`+  : 凸出边（反向）  ──┌
1`-  : 凹入边（反向）  ──└

匹配规则:
1+  ←→ 1-   ✓
1`+ ←→ 1`-  ✓
1+  ←→ 1`-  ✗
1-  ←→ 1`+  ✗
```

#### 4种棋子形状
```
资源1: 上1-  右1`- 下1`- 左1-   (四凹)
资源2: 上1+  右1-  下1`- 左1`+  (混合)
资源3: 上1`+ 右1-  下1`- 左1+   (混合)
资源4: 上1`+ 右1+  下1`+ 左1+   (四凸)
```

---

## 📦 环境准备

### 安装依赖
```bash
# 安装核心依赖
pnpm add pinia @vueuse/core nanoid lodash-es dayjs

# 安装类型定义
pnpm add -D @types/lodash-es

# 可选：动画库
pnpm add @vueuse/motion
# 或
pnpm add gsap

# 可选：音效库
pnpm add howler
pnpm add -D @types/howler
```

### 创建目录结构
```bash
# 在 src 目录下创建新文件夹
mkdir src/types/chess
mkdir src/constants/chess
mkdir src/classes/chess
mkdir src/utils/chess
mkdir src/stores/chess
mkdir src/components/chess
mkdir src/views/chess
mkdir docs
```

---

## 💻 开始编码

### Step 1: 定义类型系统 (30分钟)

**文件**: `src/types/chess/index.ts`

```typescript
// 边缘类型
export type EdgeType = '1+' | '1-' | '1`+' | '1`-'

// 旋转角度
export type Rotation = 0 | 90 | 180 | 270

// 边缘位置
export type EdgeSide = 'top' | 'right' | 'bottom' | 'left'

// 玩家
export enum Player {
  PLAYER1 = 1,
  PLAYER2 = 2
}

// 游戏模式
export enum GameMode {
  PVP = 'pvp',
  PVE = 'pve'
}

// 移动方向
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  UP_LEFT = 'up_left',
  UP_RIGHT = 'up_right',
  DOWN_LEFT = 'down_left',
  DOWN_RIGHT = 'down_right'
}

// 位置
export interface Position {
  row: number
  col: number
}

// 棋子形状定义
export interface PieceShape {
  id: number
  name: string
  edges: {
    top: EdgeType
    right: EdgeType
    bottom: EdgeType
    left: EdgeType
  }
}

// 棋子实例
export interface ChessPiece {
  id: string              // 唯一标识
  player: Player          // 所属玩家
  shapeId: number         // 形状ID (1-4)
  rotation: Rotation      // 当前旋转角度
  position: Position      // 当前位置
  isOnBoard: boolean      // 是否在棋盘上
  isBird: boolean         // 是否为特殊棋子
}

// 棋盘格子
export interface BoardCell {
  position: Position
  pieces: ChessPiece[]    // 可堆叠多个棋子
  isStartZone: {
    player1: boolean
    player2: boolean
  }
  isFinishZone: {
    player1: boolean
    player2: boolean
  }
}

// 移动动作
export interface Move {
  piece: ChessPiece
  from: Position
  to: Position
  steps: number
  direction: Direction
  needRotation: boolean
  newRotation?: Rotation
}

// 游戏状态
export interface GameState {
  mode: GameMode
  currentPlayer: Player
  board: BoardCell[][]
  player1Pieces: ChessPiece[]
  player2Pieces: ChessPiece[]
  moveHistory: Move[]
  passCount: {
    player1: number
    player2: number
  }
  winner: Player | null
}
```

### Step 2: 定义棋子常量 (15分钟)

**文件**: `src/constants/chess/pieces.ts`

```typescript
import type { PieceShape } from '@/types/chess'

export const PIECE_SHAPES: Record<number, PieceShape> = {
  1: {
    id: 1,
    name: '资源1',
    edges: {
      top: '1-',
      right: '1`-',
      bottom: '1`-',
      left: '1-'
    }
  },
  2: {
    id: 2,
    name: '资源2',
    edges: {
      top: '1+',
      right: '1-',
      bottom: '1`-',
      left: '1`+'
    }
  },
  3: {
    id: 3,
    name: '资源3',
    edges: {
      top: '1`+',
      right: '1-',
      bottom: '1`-',
      left: '1+'
    }
  },
  4: {
    id: 4,
    name: '资源4',
    edges: {
      top: '1`+',
      right: '1+',
      bottom: '1`+',
      left: '1+'
    }
  }
}
```

**文件**: `src/constants/chess/board.ts`

```typescript
export const BOARD_CONFIG = {
  SIZE: 8,
  PLAYER1_START_ROWS: [0, 1],
  PLAYER2_START_ROWS: [6, 7],
  PLAYER1_FINISH_ROWS: [6, 7],
  PLAYER2_FINISH_ROWS: [0, 1]
}

export const MOVE_RULES = {
  MIN_STEPS: 1,
  MAX_STEPS: 3,
  ROTATE_MAX_STEPS: 1
}
```

### Step 3: 实现边缘匹配算法 (1小时)

**文件**: `src/classes/chess/EdgeMatcher.ts`

```typescript
import type { EdgeType, PieceShape, Rotation, EdgeSide } from '@/types/chess'
import { PIECE_SHAPES } from '@/constants/chess/pieces'

export class EdgeMatcher {
  /**
   * 检查两条边是否可以匹配
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
   * @param shape 棋子形状
   * @param side 要查询的边
   * @param rotation 旋转角度
   */
  static getRotatedEdge(
    shape: PieceShape,
    side: EdgeSide,
    rotation: Rotation
  ): EdgeType {
    const sides: EdgeSide[] = ['top', 'right', 'bottom', 'left']
    const sideIndex = sides.indexOf(side)
    
    // 顺时针旋转：索引减少
    const rotationSteps = rotation / 90
    const originalSideIndex = (sideIndex + rotationSteps) % 4
    const originalSide = sides[originalSideIndex]
    
    return shape.edges[originalSide]
  }

  /**
   * 获取对面的边
   */
  static getOppositeSide(side: EdgeSide): EdgeSide {
    const oppositeMap: Record<EdgeSide, EdgeSide> = {
      'top': 'bottom',
      'bottom': 'top',
      'left': 'right',
      'right': 'left'
    }
    return oppositeMap[side]
  }

  /**
   * 测试函数：验证所有匹配组合
   */
  static testAllMatches(): void {
    const edges: EdgeType[] = ['1+', '1-', '1`+', '1`-']
    console.log('=== 边缘匹配测试 ===')
    
    for (const edge1 of edges) {
      for (const edge2 of edges) {
        const canMatch = this.canMatch(edge1, edge2)
        if (canMatch) {
          console.log(`✓ ${edge1} ←→ ${edge2}`)
        }
      }
    }
  }
}

// 在控制台测试
// EdgeMatcher.testAllMatches()
```

### Step 4: 创建测试文件 (30分钟)

**文件**: `src/classes/chess/__tests__/EdgeMatcher.spec.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { EdgeMatcher } from '../EdgeMatcher'
import { PIECE_SHAPES } from '@/constants/chess/pieces'

describe('EdgeMatcher', () => {
  describe('canMatch', () => {
    it('应该正确匹配正向凸凹边', () => {
      expect(EdgeMatcher.canMatch('1+', '1-')).toBe(true)
      expect(EdgeMatcher.canMatch('1-', '1+')).toBe(true)
    })

    it('应该正确匹配反向凸凹边', () => {
      expect(EdgeMatcher.canMatch('1`+', '1`-')).toBe(true)
      expect(EdgeMatcher.canMatch('1`-', '1`+')).toBe(true)
    })

    it('不应该匹配不同类型的边', () => {
      expect(EdgeMatcher.canMatch('1+', '1`-')).toBe(false)
      expect(EdgeMatcher.canMatch('1-', '1`+')).toBe(false)
      expect(EdgeMatcher.canMatch('1`+', '1-')).toBe(false)
      expect(EdgeMatcher.canMatch('1`-', '1+')).toBe(false)
    })
  })

  describe('getRotatedEdge', () => {
    it('0度旋转应该返回原始边缘', () => {
      const shape = PIECE_SHAPES[1]
      expect(EdgeMatcher.getRotatedEdge(shape, 'top', 0)).toBe('1-')
      expect(EdgeMatcher.getRotatedEdge(shape, 'right', 0)).toBe('1`-')
    })

    it('90度旋转应该正确计算', () => {
      const shape = PIECE_SHAPES[2]
      // 旋转90度后，原来的top变成right的位置，所以查询right得到原来的top
      expect(EdgeMatcher.getRotatedEdge(shape, 'right', 90)).toBe('1+')
    })
  })
})
```

---

## 🧪 测试驱动开发

### 运行测试
```bash
# 运行所有测试
pnpm test:unit

# 运行特定文件测试
pnpm test:unit EdgeMatcher

# 监听模式
pnpm test:unit --watch
```

### 测试策略
1. **先写测试**：定义期望的行为
2. **实现功能**：让测试通过
3. **重构代码**：保持测试通过的前提下优化

---

## 📝 开发检查清单

### 第一天任务
- [ ] 安装所有依赖
- [ ] 创建目录结构
- [ ] 定义类型系统
- [ ] 定义棋子常量
- [ ] 实现 EdgeMatcher 类
- [ ] 编写 EdgeMatcher 测试
- [ ] 所有测试通过

### 验证标准
```typescript
// 在浏览器控制台或测试中验证
import { EdgeMatcher } from './classes/chess/EdgeMatcher'

// 测试1：基础匹配
console.assert(EdgeMatcher.canMatch('1+', '1-') === true)
console.assert(EdgeMatcher.canMatch('1+', '1`-') === false)

// 测试2：旋转计算
const shape = PIECE_SHAPES[1] // {top:'1-', right:'1`-', bottom:'1`-', left:'1-'}
console.assert(EdgeMatcher.getRotatedEdge(shape, 'top', 0) === '1-')
console.assert(EdgeMatcher.getRotatedEdge(shape, 'top', 180) === '1`-')

console.log('✓ 所有断言通过！')
```

---

## 🎯 下一步

完成第一天任务后，继续开发：
1. **Day 2**: 完成位置和方向计算工具函数
2. **Day 3**: 实现 MoveValidator 类
3. **Day 4**: 创建 Board 类
4. **Day 5**: 实现 GameEngine 类

---

## 💡 开发技巧

### 1. 使用 TypeScript 严格模式
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 2. 使用 console.table 调试
```typescript
// 查看棋盘状态
console.table(board.map(row => 
  row.map(cell => cell.pieces.length)
))
```

### 3. 使用 Vue DevTools
- 安装 Vue DevTools 浏览器扩展
- 查看组件状态和 Pinia store
- 调试事件和路由

### 4. Git 提交规范
```bash
# 功能开发
git commit -m "feat: 实现边缘匹配算法"

# Bug修复
git commit -m "fix: 修复旋转计算错误"

# 文档更新
git commit -m "docs: 添加开发指南"

# 测试相关
git commit -m "test: 添加EdgeMatcher测试用例"
```

---

## 🆘 常见问题

### Q1: 边缘匹配逻辑不确定
**A**: 参考设计文档中的匹配表，或运行 `EdgeMatcher.testAllMatches()` 查看所有组合

### Q2: 旋转计算容易出错
**A**: 画图理解：顺时针旋转90度，top→right, right→bottom, bottom→left, left→top

### Q3: 类型错误太多
**A**: 先关闭严格模式，功能实现后再逐步添加类型

### Q4: 测试不知道怎么写
**A**: 参考 `EdgeMatcher.spec.ts` 的模式，每个公共方法都写测试

---

## 📚 参考资源

- [完整设计文档](./DESIGN_DOCUMENT.md)
- [开发路线图](./ROADMAP.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vitest 文档](https://vitest.dev/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

---

## 🎉 开始编码吧！

现在你已经有了：
- ✅ 清晰的规则理解
- ✅ 完整的类型定义
- ✅ 核心算法框架
- ✅ 测试基础

开始编码，遇到问题随时查阅设计文档！

**祝开发顺利！** 🚀
