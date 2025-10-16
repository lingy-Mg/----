# 拼图棋盘游戏 - README

> **📖 完整文档**: 查看 [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md) 获取所有项目信息

## 📋 快速链接

- **完整文档**: [PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) - 包含所有项目信息 ⭐
- **游戏规则**: 查看完整文档的"游戏规则"章节
- **技术架构**: 查看完整文档的"技术架构"章节
- **开发指南**: 查看完整文档的"开发指南"章节
- **API 文档**: 查看完整文档的"API 文档"章节

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test:unit

# 构建生产版本
pnpm build
```

## � 游戏简介

**拼图棋盘游戏（Puzzle Chess）** 是一款双人回合制策略游戏：

- **棋盘**: 4×4 网格
- **目标**: 将己方所有棋子移至对方起始行
- **规则**: 一回合一动作（移动或旋转）
- **特色**: 无距离限制，智能旋转规则，鸟类特权

## � 项目结构

```
src/
├── types/chess/          # 类型定义
├── classes/chess/        # 核心游戏逻辑（OOP）
├── constants/chess/      # 游戏配置
├── components/chess/     # Vue 组件
└── views/               # 视图页面

docs/
└── PROJECT_DOCUMENTATION.md  # 完整项目文档 ⭐
```

## 🎯 核心特性

- ✅ 完整的 OOP 游戏引擎
- ✅ 移动验证系统
- ✅ 移动提示功能（绿色圆圈）
- ✅ 旋转控制（R 键）
- ✅ 玩家指示器
- ✅ 悔棋功能
- ✅ 完整的游戏规则面板

## 🔧 技术栈

- **框架**: Vue 3 + TypeScript
- **构建**: Vite 6.0.3
- **路由**: Vue Router 4.5.0
- **测试**: Vitest
- **设计**: OOP（面向对象编程）

## 📖 详细文档

请查看 [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md) 获取：

- 完整游戏规则
- 技术架构详解
- 代码结构说明
- 开发指南
- API 文档
- 测试说明
- 版本历史

---

**版本**: v1.0  
**状态**: ✅ MVP 完成，可玩测试版  
**更新**: 2025-10-17
