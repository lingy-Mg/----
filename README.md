# 🎮 拼图棋盘游戏 (Puzzle Chess)

一款创新的双人策略棋类游戏，玩家通过移动和旋转拼图形状的棋子，在棋盘上进行对弈。棋子之间必须像拼图一样完美贴合才能移动！

## ✨ 特色功能

- 🧩 **独特的拼图匹配机制** - 4种边缘类型必须正确配对
- 🎯 **4×4紧凑棋盘** - 快节奏、策略性强
- 🔄 **棋子可旋转** - 0°/90°/180°/270° 四个方向
- ♟️ **8向移动** - 直线+对角线全方位移动
- 🎨 **现代化UI** - 红色棋盘背景，实际SVG棋子
- ⚡ **Vue 3 + TypeScript** - 完整类型安全

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

然后访问 http://localhost:5174/chess 开始游戏！

### 运行测试

```bash
pnpm test:unit
```

### 生产构建

```bash
pnpm build
pnpm preview
```

## 🎯 游戏规则

### 基础规则

- **棋盘**: 4×4 网格
- **棋子**: 每方4个，具有不同的拼图形状
- **目标**: 将所有己方棋子移动到对方起始行

### 边缘匹配

每个棋子有4条边，每条边有4种类型：

- `1+` (凸出) ←→ `1-` (凹入) ✅ 可匹配
- `1\`+` (反凸) ←→ `1\`-` (反凹) ✅ 可匹配
- `1+` 和 `1\`-` ❌ 不可匹配（类型不同）

### 移动规则

- 8个方向（直线+对角线）
- 每次移动1-3格
- 需要旋转时只能移动1格
- 移动后所有相邻边必须匹配

## 📁 项目结构

```
src/
├── types/chess/          # TypeScript 类型定义
│   └── index.ts          # 完整类型系统
├── constants/chess/      # 游戏常量
│   ├── board.ts          # 棋盘配置
│   └── pieces.ts         # 棋子形状定义
├── classes/chess/        # 核心游戏逻辑
│   ├── EdgeMatcher.ts    # 边缘匹配算法 (34测试)
│   ├── MoveValidator.ts  # 移动验证
│   ├── Board.ts          # 棋盘管理
│   └── GameEngine.ts     # 游戏引擎
├── components/chess/     # Vue UI 组件
│   └── ChessBoard.vue    # 主棋盘组件
└── views/
    └── ChessView.vue     # 游戏页面

SVG/                      # 棋子 SVG 资源
├── 资源 1.svg
├── 资源 2.svg
├── 资源 3.svg
└── 资源 4.svg

docs/                     # 完整文档
├── DESIGN_DOCUMENT.md    # 设计文档
├── ROADMAP.md            # 开发路线图
├── TODO.md               # 任务清单
├── TESTING_GUIDE.md      # 测试指南
└── REFACTOR_SUMMARY.md   # 重构总结
```

## 📚 文档

- [完整设计文档](docs/DESIGN_DOCUMENT.md) - 详细的游戏规则和算法
- [开发路线图](docs/ROADMAP.md) - MVP 阶段规划
- [测试指南](docs/TESTING_GUIDE.md) - 如何测试游戏
- [快速参考](QUICK_REFERENCE.md) - 一页纸速查手册
- [重构报告](docs/4X4_REFACTOR_REPORT.md) - 4×4重构详情

## 🔧 技术栈

- **框架**: Vue 3.5+ (Composition API)
- **语言**: TypeScript 5.x
- **构建工具**: Vite 7.x
- **测试**: Vitest 3.x
- **状态管理**: 原生 OOP 类（未使用 Pinia）
- **路由**: Vue Router 5.x
- **样式**: CSS3 + Scoped Styles

## ✅ 当前进度

**MVP 1.0 基础可玩版本** - ✅ 已完成 (90%)

- [x] 核心类型系统
- [x] EdgeMatcher 边缘匹配算法 (34 测试通过)
- [x] MoveValidator 移动验证
- [x] Board 棋盘管理
- [x] GameEngine 游戏引擎
- [x] ChessBoard UI 组件
- [x] 4×4 棋盘布局
- [x] 实际 SVG 棋子资源
- [x] 红色棋盘样式
- [x] 游戏控制（跳过/悔棋/重置）
- [ ] 规则面板内容（待用户填充）

## 🎮 游戏截图

![4×4 拼图棋盘](docs/images/chess-board.png)

*红色背景的4×4棋盘，带有拼图形状的SVG棋子*

## 🤝 贡献

欢迎贡献！请查看 [开发路线图](docs/ROADMAP.md) 了解待办任务。

## 📄 许可证

MIT License
