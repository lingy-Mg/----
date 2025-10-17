# 玩家统计功能更新文档

**更新日期**: 2025-10-17  
**版本**: v1.2

## 📋 功能概述

为每个玩家指示器添加了**悔棋**和**跳过**功能按钮，并实现了详细的统计信息跟踪系统。

## ✨ 新增功能

### 1. 玩家统计信息

每个玩家现在可以查看以下统计数据：

- **总移动次数** (`totalMoves`)：玩家执行的有效移动总数
- **总悔棋次数** (`totalUndos`)：玩家使用悔棋功能的总次数
- **连续悔棋次数** (`consecutiveUndos`)：当前连续悔棋的次数（执行移动或跳过后重置）
- **总跳过次数** (`totalPasses`)：玩家跳过回合的总次数

### 2. 玩家指示器操作按钮

每个玩家指示器在该玩家回合时显示：

- **悔棋按钮**：
  - 撤销上一步移动
  - 当没有可悔棋的移动时自动禁用
  - 显示悔棋图标和文字
  
- **跳过按钮**：
  - 跳过当前回合
  - 直接切换到对方玩家
  - 显示跳过图标和文字

### 3. 实时统计显示

玩家指示器上显示三个统计项：

1. **移动图标** + 总移动次数
2. **悔棋图标** + 总悔棋次数 + 连续悔棋徽章（如果 > 0）
3. **跳过图标** + 总跳过次数

每个统计项都有 tooltip 显示详细信息。

## 🔧 技术实现

### 1. 类型定义更新

**文件**: `src/types/chess/index.ts`

```typescript
/**
 * 玩家统计信息
 */
export interface PlayerStats {
  totalMoves: number           // 总移动次数
  totalUndos: number           // 总悔棋次数
  consecutiveUndos: number     // 连续悔棋次数
  totalPasses: number          // 总跳过次数
}

/**
 * 游戏状态
 */
export interface GameState {
  // ... 其他字段
  player1Stats: PlayerStats     // 玩家1统计
  player2Stats: PlayerStats     // 玩家2统计
}
```

### 2. GameEngine 更新

**文件**: `src/classes/chess/GameEngine.ts`

#### 初始化统计

```typescript
private initializeGameState(): GameState {
  return {
    // ... 其他字段
    player1Stats: {
      totalMoves: 0,
      totalUndos: 0,
      consecutiveUndos: 0,
      totalPasses: 0
    },
    player2Stats: {
      totalMoves: 0,
      totalUndos: 0,
      consecutiveUndos: 0,
      totalPasses: 0
    }
  }
}
```

#### executeMove() - 更新移动统计

```typescript
executeMove(move: Move): boolean {
  // ... 执行移动逻辑
  
  // 更新统计：增加移动次数，重置连续悔棋次数
  if (this.gameState.currentPlayer === PlayerEnum.PLAYER1) {
    this.gameState.player1Stats.totalMoves++
    this.gameState.player1Stats.consecutiveUndos = 0
  } else {
    this.gameState.player2Stats.totalMoves++
    this.gameState.player2Stats.consecutiveUndos = 0
  }
  
  return true
}
```

#### undo() - 更新悔棋统计

```typescript
undo(): boolean {
  // ... 悔棋逻辑
  
  // 更新统计：增加悔棋次数和连续悔棋次数
  if (this.gameState.currentPlayer === PlayerEnum.PLAYER1) {
    this.gameState.player1Stats.totalUndos++
    this.gameState.player1Stats.consecutiveUndos++
    // 悔棋时减少移动次数
    if (this.gameState.player1Stats.totalMoves > 0) {
      this.gameState.player1Stats.totalMoves--
    }
  } else {
    this.gameState.player2Stats.totalUndos++
    this.gameState.player2Stats.consecutiveUndos++
    if (this.gameState.player2Stats.totalMoves > 0) {
      this.gameState.player2Stats.totalMoves--
    }
  }
  
  return true
}
```

#### pass() - 更新跳过统计

```typescript
pass(): boolean {
  // ... 跳过逻辑
  
  // 增加跳过统计，重置连续悔棋
  if (this.gameState.currentPlayer === PlayerEnum.PLAYER1) {
    this.gameState.passCount.player1++
    this.gameState.player1Stats.totalPasses++
    this.gameState.player1Stats.consecutiveUndos = 0
  } else {
    this.gameState.passCount.player2++
    this.gameState.player2Stats.totalPasses++
    this.gameState.player2Stats.consecutiveUndos = 0
  }
  
  return true
}
```

### 3. useGameState Composable 更新

**文件**: `src/components/chess/composables/useGameState.ts`

#### 新增计算属性

```typescript
const player1Stats = computed((): PlayerStats => {
  return gameEngine.value?.getGameState().player1Stats || {
    totalMoves: 0,
    totalUndos: 0,
    consecutiveUndos: 0,
    totalPasses: 0
  }
})

const player2Stats = computed((): PlayerStats => {
  return gameEngine.value?.getGameState().player2Stats || {
    totalMoves: 0,
    totalUndos: 0,
    consecutiveUndos: 0,
    totalPasses: 0
  }
})

const canUndo = computed(() => {
  return (gameEngine.value?.getGameState().moveHistory.length || 0) > 0
})
```

#### 更新 skipTurn 方法

```typescript
function skipTurn() {
  if (gameEngine.value) {
    gameEngine.value.pass()  // 使用 pass() 而不是 switchTurn()
    clearSelection()
  }
}
```

#### 导出新的状态

```typescript
return {
  // ... 其他导出
  player1Stats,
  player2Stats,
  canUndo
}
```

### 4. PlayerIndicator 组件更新

**文件**: `src/components/chess/ui/PlayerIndicator.vue`

#### Props 更新

```typescript
interface Props {
  currentPlayer: number
  playerNumber: 1 | 2
  stats: PlayerStats          // 新增：统计信息
  canUndo: boolean            // 新增：是否可以悔棋
  isGameOver: boolean         // 新增：游戏是否结束
}
```

#### Emits 定义

```typescript
defineEmits<{
  undo: []   // 悔棋事件
  skip: []   // 跳过事件
}>()
```

#### 模板结构

```vue
<template>
  <div class="player-indicator-game">
    <!-- 头像框 -->
    <div class="player-avatar-box">...</div>
    
    <!-- 玩家信息（包含统计） -->
    <div class="player-info-box">
      <div class="player-name">...</div>
      <div class="player-goal">...</div>
      
      <!-- 统计信息 -->
      <div class="player-stats">
        <div class="stat-item">
          <svg>移动图标</svg>
          <span>{{ stats.totalMoves }}</span>
        </div>
        <div class="stat-item">
          <svg>悔棋图标</svg>
          <span>{{ stats.totalUndos }}</span>
          <span v-if="stats.consecutiveUndos > 0" class="consecutive-badge">
            ×{{ stats.consecutiveUndos }}
          </span>
        </div>
        <div class="stat-item">
          <svg>跳过图标</svg>
          <span>{{ stats.totalPasses }}</span>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="player-actions" v-if="currentPlayer === playerNumber && !isGameOver">
      <button class="action-btn undo-btn" :disabled="!canUndo" @click="$emit('undo')">
        <svg>悔棋图标</svg>
        <span>悔棋</span>
      </button>
      <button class="action-btn skip-btn" @click="$emit('skip')">
        <svg>跳过图标</svg>
        <span>跳过</span>
      </button>
    </div>
  </div>
</template>
```

#### 样式更新

新增样式：
- `.player-stats`: 统计信息容器
- `.stat-item`: 单个统计项
- `.consecutive-badge`: 连续悔棋徽章
- `.player-actions`: 操作按钮容器
- `.action-btn`: 通用按钮样式
- `.undo-btn`: 悔棋按钮特定样式
- `.skip-btn`: 跳过按钮特定样式

### 5. ChessBoardNew 主组件更新

**文件**: `src/components/chess/ChessBoardNew.vue`

#### 解构新的状态

```typescript
const {
  gameEngine,
  selectedCell,
  boardCells,
  currentPlayer,
  winner,
  moveHistory,
  player1Stats,      // 新增
  player2Stats,      // 新增
  canUndo            // 新增
} = gameState
```

#### 更新 PlayerIndicator 调用

```vue
<!-- 玩家2指示器（顶部） -->
<PlayerIndicator 
  :current-player="currentPlayer" 
  :player-number="2"
  :stats="player2Stats"
  :can-undo="canUndo"
  :is-game-over="!!winner"
  @undo="handleUndo"
  @skip="handlePass"
/>

<!-- 玩家1指示器（底部） -->
<PlayerIndicator 
  :current-player="currentPlayer" 
  :player-number="1"
  :stats="player1Stats"
  :can-undo="canUndo"
  :is-game-over="!!winner"
  @undo="handleUndo"
  @skip="handlePass"
/>
```

## 🎨 UI/UX 特性

### 视觉反馈

1. **统计项悬停效果**：
   - 背景加深
   - 文字变亮
   - 显示详细 tooltip

2. **按钮交互**：
   - 悬停时向上移动（`translateY(-2px)`）
   - 添加阴影效果
   - 悔棋按钮：橙色高亮
   - 跳过按钮：绿色高亮

3. **连续悔棋徽章**：
   - 橙色文字（`#ff9800`）
   - 显示 `×N` 格式
   - 粗体显示

4. **禁用状态**：
   - 透明度降至 30%
   - 鼠标指针变为 `not-allowed`
   - 无法触发交互效果

### 响应式设计

移动设备适配（`@media (max-width: 768px)`）：
- 缩小按钮尺寸
- 减小统计项间距
- 调整字体大小

## 📊 统计逻辑说明

### 移动次数计算

- **增加**：每次成功执行 `executeMove()`
- **减少**：每次 `undo()` 悔棋
- **重置连续悔棋**：执行移动或跳过后

### 悔棋次数计算

- **总悔棋次数**：累计所有 `undo()` 调用
- **连续悔棋次数**：
  - 每次 `undo()` +1
  - 执行移动后重置为 0
  - 跳过回合后重置为 0

### 跳过次数计算

- **增加**：每次调用 `pass()`
- **重置连续悔棋**：跳过时重置为 0

## 🔍 使用示例

### 查看统计信息

```typescript
const gameEngine = new GameEngine()
const state = gameEngine.getGameState()

console.log('玩家1统计:', state.player1Stats)
// {
//   totalMoves: 5,
//   totalUndos: 2,
//   consecutiveUndos: 0,
//   totalPasses: 1
// }
```

### 检查是否可以悔棋

```typescript
const canUndo = gameEngine.getGameState().moveHistory.length > 0
```

### 操作统计

```typescript
// 执行移动
gameEngine.executeMove(move)  // totalMoves++, consecutiveUndos = 0

// 悔棋
gameEngine.undo()  // totalUndos++, consecutiveUndos++, totalMoves--

// 跳过
gameEngine.pass()  // totalPasses++, consecutiveUndos = 0
```

## 🎯 功能亮点

1. ✅ **实时统计**：所有操作立即反映在 UI 上
2. ✅ **智能禁用**：悔棋按钮根据游戏状态自动禁用
3. ✅ **连续悔棋追踪**：显示玩家连续悔棋的次数
4. ✅ **操作便捷**：每个玩家指示器集成操作按钮
5. ✅ **视觉直观**：图标 + 数字 + 徽章多维度显示
6. ✅ **游戏结束隐藏**：游戏结束时隐藏操作按钮

## 📝 注意事项

1. **悔棋限制**：
   - 只能悔棋有移动历史的情况
   - 悔棋后回合会切换回上一个玩家

2. **跳过限制**：
   - 默认配置下不允许连续跳过两次（`allowPassTwice: false`）

3. **统计持久化**：
   - 当前统计仅在游戏会话中有效
   - 重置游戏会清空所有统计

4. **性能考虑**：
   - 使用 Vue 3 计算属性自动更新
   - 避免不必要的重新渲染

## 🚀 未来扩展

可能的增强功能：

1. **统计持久化**：将统计数据保存到 localStorage
2. **历史记录**：查看每个玩家的详细操作历史
3. **成就系统**：基于统计数据解锁成就
4. **悔棋限制**：每个玩家每局限制悔棋次数
5. **时间统计**：记录每个玩家的思考时间
6. **移动热力图**：可视化玩家的移动模式

## 📚 相关文档

- **完整项目文档**: `docs/PROJECT_DOCUMENTATION.md`
- **待办事项**: `docs/TODO.md`
- **组件重构文档**: `docs/COMPONENT_REFACTORING.md`

---

**更新完成** ✅  
现在每个玩家指示器都具有悔棋和跳过功能，并实时显示详细的游戏统计信息！
