# CLAUDE.md — game-v5

## 项目定位

Balatro 教学项目 Docs-v5 提示词验证版本。Vue 3 + Vite + Tailwind CSS。

## 常用命令

```bash
npm run dev    # 启动开发服务器（端口 5173 默认）
npm run build  # 构建，必须无报错
```

## 文件结构

```
src/
  config/
    jokers.js       # 6 张 Joker 候选库（数值锁定，不得修改）
    blinds.js       # 3 关盲注配置（数值锁定，不得修改）
  utils/
    deck.js         # 52 张牌组 + 洗牌
    poker.js        # 牌型识别 + 计分公式（数值锁定，不得修改）
    useGame.js      # 游戏核心状态机（Composable）
  components/
    SideBar.vue     # 左 sidebar
    JokerCard.vue   # Joker 卡片组件
    PlayCard.vue    # 扑克牌组件
  App.vue           # 主页面
  style.css         # 全局样式 + 设计令牌
```

## 修改约束

- poker.js / scoring 逻辑 / config/ 下的数值：**不得修改**
- 视觉改动必须对应到 PRD §4 或 DESIGN §3-§3.6 有依据
- 每次改动后必须 `npm run build` 无报错
