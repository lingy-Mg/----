# 拼图棋游戏 - 开发路线图

## 📋 项目概览

**项目名称**: 拼图棋游戏 (Puzzle Chess)  
**开发周期**: 20-27天（3个MVP阶段）  
**当前状态**: 已完成简单拼图游戏原型，准备开发完整版本

---

## 🎯 开发里程碑

### MVP 1.0 - 基础可玩版本 (10-12天)
**目标**: 实现PvP基础对弈功能

```
✅ = 已完成
⏳ = 进行中
⏸️ = 待开始
```

#### Week 1: 核心系统 (Day 1-5)

**Day 1-2: 数据结构与类型系统**
- ⏸️ 定义边缘类型系统 (EdgeType: 1+, 1-, 1`+, 1`-)
- ⏸️ 创建棋子形状定义 (PieceShape)
- ⏸️ 创建游戏状态类型 (GameState, Move, Cell)
- ⏸️ 定义4种基础棋子数据
  ```typescript
  piece1: {top:'1-', right:'1`-', bottom:'1`-', left:'1-'}
  piece2: {top:'1+', right:'1-', bottom:'1`-', left:'1`+'}
  piece3: {top:'1`+', right:'1-', bottom:'1`-', left:'1+'}
  piece4: {top:'1`+', right:'1+', bottom:'1`+', left:'1+'}
  ```

**Day 3-4: 边缘匹配算法**
- ⏸️ 实现 EdgeMatcher 类
  - canMatch(): 判断两条边是否匹配
  - getRotatedEdge(): 计算旋转后的边缘
  - checkFit(): 检查棋子能否拼接
- ⏸️ 编写单元测试（所有边缘组合）
- ⏸️ 测试旋转场景（0°/90°/180°/270°）

**Day 5: 移动验证系统**
- ⏸️ 实现 MoveValidator 类
  - validateMove(): 验证移动合法性
  - getPossibleMoves(): 获取所有合法移动
  - calculateDistance(): 计算移动距离
- ⏸️ 实现移动规则：
  - 8向移动（直线+对角线）
  - 1-3格移动限制
  - 旋转时仅限1格

#### Week 2: 游戏逻辑与UI (Day 6-12)

**Day 6-7: 棋盘管理系统**
- ⏸️ 实现 Board 类
  - 初始化8x8棋盘
  - 定义起始区域（玩家1: row 0-1, 玩家2: row 6-7）
  - 定义终点区域（互换）
  - placePiece(), movePiece()
- ⏸️ 实现棋子堆叠逻辑
- ⏸️ 测试棋盘操作

**Day 8-9: 游戏引擎**
- ⏸️ 实现 GameEngine 类
  - initialize(): 初始化游戏
  - executeMove(): 执行移动
  - switchTurn(): 切换回合
- ⏸️ 实现胜利判定
  - 检查所有棋子是否到达终点
- ⏸️ 实现游戏流程控制

**Day 10-11: UI基础组件**
- ⏸️ GameBoard.vue - 8x8棋盘渲染
- ⏸️ GameCell.vue - 单个格子
- ⏸️ GamePiece.vue - 棋子渲染（SVG）
  - 显示4种形状
  - 支持旋转显示
  - 玩家1: 蓝色, 玩家2: 红色
- ⏸️ PlayerInfo.vue - 玩家信息栏

**Day 12: 交互与集成**
- ⏸️ 实现点击选择棋子
- ⏸️ 高亮显示可移动位置
- ⏸️ 实现移动操作
- ⏸️ 集成所有组件
- ⏸️ MVP 1.0 测试与调试

**MVP 1.0 交付物**
- ✅ 可运行的PvP游戏
- ✅ 基础UI界面
- ✅ 完整的移动和拼接逻辑
- ✅ 胜利判定

---

### MVP 2.0 - 完整规则版本 (5-6天)
**目标**: 添加完整游戏规则和AI对手

#### Week 3: 高级规则与AI (Day 13-18)

**Day 13: 威胁机制**
- ⏸️ 实现威胁检测算法
  - checkThreat(): 检查是否阻挡终点线
  - isBlockingWin(): 判断是否阻止胜利
- ⏸️ ThreatNotification.vue - 威胁提示UI
- ⏸️ 实现威胁声明："Threat on XXX"

**Day 14: 跳过与悔棋**
- ⏸️ 实现跳过功能 (Pass)
  - 不允许连续两次跳过
  - 记录跳过计数
- ⏸️ 实现悔棋功能 (Undo)
  - 保存移动历史
  - 回退状态
- ⏸️ 完全封锁判定

**Day 15-16: AI系统 (EASY)**
- ⏸️ 创建 AIPlayer 类
- ⏸️ 实现局面评估函数
  - 距离终点的距离评分
  - 拼接稳定性评分
- ⏸️ EASY AI: 随机选择合法移动
- ⏸️ AI思考可视化

**Day 17: 游戏模式选择**
- ⏸️ GameModeSelector.vue
  - PvP / PvE 切换
  - AI难度选择
- ⏸️ MainMenu.vue - 主菜单
  - 开始游戏
  - 规则说明

**Day 18: 测试与优化**
- ⏸️ 完整流程测试
- ⏸️ 规则验证
- ⏸️ AI测试
- ⏸️ Bug修复

**MVP 2.0 交付物**
- ✅ PvE模式（EASY AI）
- ✅ 威胁机制
- ✅ 跳过和悔棋
- ✅ 游戏模式选择

---

### MVP 3.0 - 高级功能版本 (5-9天)
**目标**: 高级AI、动画系统、数据持久化

#### Week 4: 高级功能 (Day 19-27)

**Day 19-20: 高级AI**
- ⏸️ MEDIUM AI: 贪心算法
  - 选择评分最高的移动
  - 考虑对手的威胁
- ⏸️ HARD AI: Minimax算法
  - 深度3-4搜索
  - Alpha-Beta剪枝

**Day 21-22: 动画系统**
- ⏸️ 棋子移动动画（平滑过渡）
- ⏸️ 旋转动画（3D翻转）
- ⏸️ 拼接成功动画（连接线闪光）
- ⏸️ 胜利动画（烟花效果）
- ⏸️ 音效系统（可选）

**Day 23-24: 状态管理与持久化**
- ⏸️ 使用 Pinia 管理游戏状态
- ⏸️ 游戏存档功能
  - 自动保存
  - 恢复游戏
- ⏸️ 历史记录
  - MoveHistory.vue - 移动历史列表
  - 支持回放

**Day 25: 统计系统**
- ⏸️ 游戏统计
  - 胜率统计
  - 平均步数
  - 游戏时长
- ⏸️ WinDialog.vue - 胜利界面增强
  - 显示统计数据
  - 分享战绩

**Day 26-27: 测试、优化与部署**
- ⏸️ 性能优化
  - 渲染优化
  - AI计算优化
- ⏸️ 响应式适配（桌面/平板/移动）
- ⏸️ 文档完善
- ⏸️ 部署上线

**MVP 3.0 交付物**
- ✅ MEDIUM/HARD AI
- ✅ 完整动画系统
- ✅ 历史回放
- ✅ 统计系统
- ✅ 数据持久化

---

## 📦 技术依赖清单

### 需要安装的包
```bash
# 状态管理
pnpm add pinia

# 工具库
pnpm add @vueuse/core
pnpm add nanoid
pnpm add lodash-es
pnpm add dayjs

# 类型定义
pnpm add -D @types/lodash-es

# 动画（可选）
pnpm add @vueuse/motion
# 或
pnpm add gsap

# 音效（可选）
pnpm add howler
pnpm add -D @types/howler
```

---

## 📁 文件结构规划

```
src/
├── types/                      # 类型定义
│   ├── game.ts                # 游戏核心类型
│   ├── piece.ts               # 棋子相关类型
│   ├── board.ts               # 棋盘相关类型
│   └── ui.ts                  # UI状态类型
│
├── constants/                  # 常量定义
│   ├── pieces.ts              # 4种棋子形状数据
│   ├── board.ts               # 棋盘配置
│   └── rules.ts               # 游戏规则常量
│
├── classes/                    # 核心逻辑类
│   ├── EdgeMatcher.ts         # 边缘匹配算法
│   ├── MoveValidator.ts       # 移动验证
│   ├── Board.ts               # 棋盘管理
│   ├── GameRules.ts           # 游戏规则
│   ├── GameEngine.ts          # 游戏引擎
│   └── AIPlayer.ts            # AI玩家
│
├── utils/                      # 工具函数
│   ├── position.ts            # 位置计算
│   ├── rotation.ts            # 旋转计算
│   └── validation.ts          # 验证工具
│
├── stores/                     # 状态管理
│   ├── gameStore.ts           # 游戏状态
│   ├── uiStore.ts             # UI状态
│   └── settingsStore.ts       # 设置
│
├── components/                 # Vue组件
│   ├── game/                  # 游戏组件
│   │   ├── GameBoard.vue
│   │   ├── GameCell.vue
│   │   ├── GamePiece.vue
│   │   ├── PlayerInfo.vue
│   │   ├── ControlPanel.vue
│   │   ├── MoveHistory.vue
│   │   ├── ThreatNotification.vue
│   │   └── WinDialog.vue
│   │
│   ├── menu/                  # 菜单组件
│   │   ├── MainMenu.vue
│   │   ├── GameModeSelector.vue
│   │   └── RuleHelper.vue
│   │
│   └── common/                # 通用组件
│       ├── Button.vue
│       └── Dialog.vue
│
├── views/                      # 页面视图
│   ├── GameView.vue           # 游戏主界面
│   ├── MenuView.vue           # 菜单界面
│   └── RulesView.vue          # 规则说明
│
├── assets/                     # 静态资源
│   ├── pieces/                # 棋子SVG
│   │   ├── piece1.svg
│   │   ├── piece2.svg
│   │   ├── piece3.svg
│   │   └── piece4.svg
│   ├── sounds/                # 音效（可选）
│   └── styles/                # 全局样式
│
└── docs/                       # 文档
    ├── DESIGN_DOCUMENT.md     # 设计文档
    ├── API.md                 # API文档
    └── RULES.md               # 规则说明
```

---

## 🎯 关键任务优先级

### P0 - 最高优先级（MVP 1.0 必须）
1. ✅ 边缘匹配算法
2. ✅ 移动验证系统
3. ✅ 棋盘管理
4. ✅ 基础UI（棋盘+棋子）
5. ✅ 胜利判定

### P1 - 高优先级（MVP 2.0）
1. ⏸️ 威胁机制
2. ⏸️ EASY AI
3. ⏸️ 游戏模式选择
4. ⏸️ 跳过和悔棋

### P2 - 中优先级（MVP 3.0）
1. ⏸️ MEDIUM/HARD AI
2. ⏸️ 动画系统
3. ⏸️ 历史回放
4. ⏸️ 数据持久化

### P3 - 低优先级（后续版本）
1. ⏸️ 音效系统
2. ⏸️ 多语言
3. ⏸️ 主题切换
4. ⏸️ 在线对战

---

## ⚠️ 风险与注意事项

### 技术风险
1. **边缘匹配复杂度** 
   - 需要仔细测试所有旋转和拼接场景
   - 建议先完成算法再做UI

2. **SVG性能**
   - 如果棋子较多且动画复杂，可能卡顿
   - 考虑使用 Canvas 或减少DOM节点

3. **AI计算时间**
   - 高难度AI可能思考过长
   - 需要设置时间限制和进度提示

### 开发建议
1. **先逻辑后UI**: 核心算法先在控制台测试通过
2. **迭代开发**: 每个MVP都要能运行和演示
3. **充分测试**: 边界情况和特殊场景要覆盖
4. **代码复用**: 相似功能抽象成工具函数

---

## 📊 进度跟踪

### 当前状态
- ✅ 简单拼图游戏原型（已完成）
- ⏸️ 拼图棋游戏开发（待开始）

### 下一步行动
1. ⏸️ 安装必要的依赖包
2. ⏸️ 创建类型定义文件
3. ⏸️ 实现边缘匹配算法
4. ⏸️ 开始MVP 1.0 开发

---

## 📚 参考资源

- [完整设计文档](./DESIGN_DOCUMENT.md)
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [VueUse 文档](https://vueuse.org/)

---

**文档版本**: v1.0  
**创建时间**: 2025-10-16  
**预计完成**: 2025-11-12 (MVP 3.0)
