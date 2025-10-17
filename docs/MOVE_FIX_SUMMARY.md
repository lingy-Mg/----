# 移动规则和指示器修复总结

## 修复日期
2025年10月17日

## 问题描述
1. 用户选中棋子后，可移动位置指示器显示不正确
2. 移动规则应该允许移动到任意空位置，但之前被限制为最多3格

## 修复内容

### 1. 修改 `MoveValidator.getPossibleMoves()` 方法
**文件**: `src/classes/chess/MoveValidator.ts`

**之前的逻辑**:
```typescript
// 使用固定的方向和步数限制 (1-3步)
for (const direction of directions) {
  for (let steps = MIN_MOVE_STEPS; steps <= MAX_MOVE_STEPS; steps++) {
    // 只检查这些有限的位置
  }
}
```

**修复后的逻辑**:
```typescript
// 遍历棋盘上的所有位置
for (let row = 0; row < boardSize; row++) {
  for (let col = 0; col < boardSize; col++) {
    const targetPos: Position = { row, col }
    
    // 跳过当前位置
    if (positionsEqual(targetPos, piece.position)) {
      continue
    }

    // 检查目标位置是否为空
    const targetCell = board[row][col]
    if (targetCell.pieces.length > 0) {
      continue // 目标位置被占用，跳过
    }

    // 检查是否在直线或对角线上
    const direction = this.getDirection(piece.position, targetPos)
    if (!direction) {
      continue // 不在直线或对角线上，跳过
    }

    // 计算距离并验证移动
    const distance = this.calculateChebyshevDistance(piece.position, targetPos)
    // ... 后续验证逻辑
  }
}
```

## 移动规则确认

### ✅ 允许的移动
1. **任意空位置**: 可以移动到棋盘上任意空的格子
2. **直线和对角线**: 必须沿直线（上下左右）或对角线方向移动
3. **无距离限制**: 不再有3格的距离限制
4. **不可重叠**: 目标位置必须为空（没有其他棋子）

### 🔄 旋转规则
1. **移动1格 + 旋转**: 可以在移动到相邻格子（距离=1）时同时旋转
2. **移动多格**: 不能旋转（保持原来的旋转角度）
3. **原地旋转**: 只有鸟类棋子可以原地旋转

### ❌ 不允许的移动
1. 移动到被占用的位置
2. 不沿直线或对角线移动
3. 移动到棋盘外
4. 移动超过1格时旋转（鸟类除外）

## 可视化指示器

当用户选中棋子后，所有符合条件的空位置会显示：
- 🟢 绿色高亮背景 (`possible-move` class)
- 🔵 中心圆点指示器
- ✨ 绿色边框阴影效果

## 测试建议

### 手动测试步骤
1. 启动游戏
2. 选中一个棋子
3. 观察棋盘上的绿色指示器
4. 验证所有空位置（在直线/对角线上）都被高亮
5. 尝试点击高亮的位置，应该能成功移动
6. 尝试点击非高亮位置，应该无法移动

### 预期结果
- ✅ 4x4棋盘上，假设棋子在 (1,1)，应该看到最多11个可移动位置（所有空的直线和对角线位置）
- ✅ 指示器应该覆盖整个棋盘（如果路径上没有障碍）
- ✅ 被其他棋子占用的位置不应该显示指示器

## 相关文件
1. `src/classes/chess/MoveValidator.ts` - 移动验证和生成逻辑
2. `src/components/chess/composables/useGameState.ts` - 游戏状态管理
3. `src/components/chess/composables/usePieceInteraction.ts` - 棋子交互逻辑
4. `src/components/chess/board/BoardBackground.vue` - 棋盘背景和指示器显示

## 注意事项
- 修改后移除了 `MAX_MOVE_STEPS` 的限制
- 保持了旋转规则的限制（只能在移动1格时旋转）
- 所有验证逻辑保持不变，只是扩展了搜索范围
