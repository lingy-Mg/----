# 拼图游戏项目

## 项目简介

这是一个基于 Vue 3 + TypeScript + Vite 的拼图游戏项目，实现了 4x4 的拼图棋盘。

## 功能特性

### ✨ 核心功能
- **4x4 棋盘**: 16 个单元格的游戏区域
- **4 个拼图块**: 红、蓝、绿、黄四种颜色的拼图
- **拖放操作**: 支持拖拽拼图块到棋盘任意位置
- **胜利检测**: 当顶部一行按顺序放置 1-4 号拼图时获胜
- **计时功能**: 记录游戏时长
- **移动计数**: 统计移动次数
- **重新开始**: 随时重置游戏

### 🎨 界面设计
- 红色主题棋盘背景
- 半透明的网格单元
- 动画效果（悬停、放置、获胜）
- 响应式设计，支持移动端

## 项目结构

```
src/
├── types/
│   └── puzzle.ts              # 类型定义
├── classes/
│   ├── PuzzleBoard.ts         # 棋盘管理类
│   └── PuzzleGame.ts          # 游戏控制类
├── components/
│   └── PuzzleBoard.vue        # 拼图棋盘组件
├── views/
│   └── HomeView.vue           # 首页（显示游戏）
└── assets/
    └── pieces/                # 拼图 SVG 资源
        ├── piece1.svg
        ├── piece2.svg
        ├── piece3.svg
        └── piece4.svg
```

## 核心类说明

### PuzzleBoard 类
负责棋盘状态管理，主要方法：
- `placePiece(pieceId, position)`: 放置拼图块
- `removePiece(position)`: 移除拼图块
- `movePiece(from, to)`: 移动拼图块
- `checkWinCondition()`: 检查胜利条件
- `reset()`: 重置棋盘

### PuzzleGame 类
负责游戏流程控制，主要方法：
- `start()`: 开始游戏（开始计时）
- `makeMove(pieceId, position)`: 执行移动
- `getMoves()`: 获取移动次数
- `getTimeElapsed()`: 获取游戏时长
- `reset()`: 重置游戏

## 游戏规则

1. **开始游戏**: 页面加载后，拼图块显示在底部待选区域
2. **放置拼图**: 拖动拼图块到棋盘任意位置
3. **获胜条件**: 将 1-4 号拼图按顺序放置在顶部一行（第 0-3 位置）
4. **重新开始**: 点击"重新开始"按钮重置游戏

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 运行测试
pnpm test:unit
```

## 技术栈

- **Vue 3**: 渐进式 JavaScript 框架
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 下一代前端构建工具
- **Pinia**: Vue 3 状态管理
- **Vue Router**: Vue 3 路由管理
- **Vitest**: 单元测试框架

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 扩展建议

- [ ] 添加难度级别（3x3, 5x5, 6x6）
- [ ] 添加音效
- [ ] 添加排行榜
- [ ] 添加提示功能
- [ ] 添加自动求解功能
- [ ] 支持自定义图片
- [ ] 添加多人对战模式

## 许可证

MIT
