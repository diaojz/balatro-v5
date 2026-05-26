<template>
  <!-- 左 sidebar：width min(28vw, 480px) + min-width 280px（PRD §4.1）-->
  <aside class="sidebar">

    <!-- Logo -->
    <div class="logo">🃏 小丑牌</div>

    <!-- 盲注大面板 -->
    <div class="blind-panel">
      <div class="blind-label">盲注 {{ blindIndex + 1 }}/3</div>
      <div class="blind-icon-row">
        <span class="blind-icon">{{ currentBlind.icon }}</span>
        <span class="blind-name">{{ currentBlind.name }}</span>
      </div>
      <div class="blind-target-row">
        <span class="label-sm">目标分</span>
        <span class="target-score">{{ currentBlind.target }}</span>
      </div>
      <div class="reward-row">
        <span class="label-sm">通关奖励</span>
        <span class="reward-val">${{ currentBlind.reward + handsLeft }}</span>
      </div>
    </div>

    <!-- Round Score -->
    <div class="score-panel">
      <div class="label-sm">当前分</div>
      <div class="round-score">{{ roundScore }}</div>
      <!-- 进度条 -->
      <div class="progress-bar-wrap">
        <div
          class="progress-bar-fill"
          :style="{ width: progressPct + '%' }"
        ></div>
      </div>
    </div>

    <!-- HAND 计分块：chips × mult（PRD §4.2）-->
    <div class="hand-block">
      <div class="hand-type-name" :class="{ muted: !handTypeName }">
        {{ handTypeName || '— 选牌出牌 —' }}
      </div>
      <div class="chips-mult-row">
        <div class="chips-block">
          <div class="chips-num">{{ chips }}</div>
          <div class="chips-label">筹码</div>
        </div>
        <div class="times-sign">×</div>
        <div class="mult-block">
          <div class="mult-num">{{ mult }}</div>
          <div class="mult-label">倍率</div>
        </div>
      </div>
    </div>

    <!-- Hands / Discards -->
    <div class="hd-row">
      <div class="hd-block green">
        <div class="hd-num">{{ handsLeft }}</div>
        <div class="hd-label">手数</div>
      </div>
      <div class="hd-block red">
        <div class="hd-num">{{ discardsLeft }}</div>
        <div class="hd-label">弃牌</div>
      </div>
    </div>

    <!-- 金币 -->
    <div class="coins-panel">
      <span class="dollar-sign">$</span>
      <span class="coins-num">{{ coins }}</span>
    </div>

    <!-- Ante / Round -->
    <div class="ante-row">
      <span class="ante-label">底注 {{ blindIndex + 1 }}/3</span>
      <span class="round-label">回合 {{ blindIndex + 1 }}</span>
    </div>

    <!-- 重新开始按钮 -->
    <button class="px-btn btn-red restart-btn" @click="$emit('restart')">
      重新开始
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentBlind: { type: Object, required: true },
  blindIndex:   { type: Number, required: true },
  roundScore:   { type: Number, required: true },
  handsLeft:    { type: Number, required: true },
  discardsLeft: { type: Number, required: true },
  coins:        { type: Number, required: true },
  handTypeName: { type: String, default: null },
  chips:        { type: Number, default: 0 },
  mult:         { type: Number, default: 0 },
})

defineEmits(['restart'])

const progressPct = computed(() => {
  const pct = (props.roundScore / props.currentBlind.target) * 100
  return Math.min(pct, 100)
})
</script>

<style scoped>
.sidebar {
  width: min(28vw, 480px);
  min-width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #1a2858 0%, #0d1a40 100%);
  border-right: 2px solid #4a6bff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 14px 14px 14px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
}

/* 隐藏滚动条 */
.sidebar::-webkit-scrollbar { width: 0; }

/* Logo */
.logo {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffc857;
  text-shadow: 2px 2px 0 #000, -1px -1px 0 #000;
  text-align: center;
  padding: 4px 0 6px;
}

/* 盲注面板 */
.blind-panel {
  background: rgba(5,8,24,0.6);
  border-radius: 10px;
  border: 1px solid rgba(74,107,255,0.4);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.blind-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  color: #8a9bbf;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.blind-icon-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blind-icon { font-size: 20px; }

.blind-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.blind-target-row,
.reward-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label-sm {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #8a9bbf;
  font-weight: 600;
}

.target-score {
  font-family: 'VT323', monospace;
  font-size: 28px;
  color: #ffc857;
  line-height: 1;
}

.reward-val {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #ffc857;
}

/* Round Score */
.score-panel {
  background: rgba(5,8,24,0.6);
  border-radius: 10px;
  border: 1px solid rgba(74,107,255,0.3);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.round-score {
  font-family: 'VT323', monospace;
  font-size: 44px;
  color: #ff6b6b;
  line-height: 1;
}

.progress-bar-wrap {
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4dd6ff, #4a6bff);
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* HAND 计分块 */
.hand-block {
  background: rgba(5,8,24,0.6);
  border-radius: 10px;
  border: 1px solid rgba(74,107,255,0.3);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hand-type-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #4dd6ff;
  text-align: center;
}

.hand-type-name.muted {
  color: #8a9bbf;
  font-weight: 600;
}

.chips-mult-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chips-block {
  flex: 1;
  background: linear-gradient(135deg, #4dd6ff, #2196f3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px 6px;
  border: 1.5px solid rgba(77,214,255,0.5);
}

.chips-num {
  font-family: 'Press Start 2P', monospace;
  font-size: 22px;
  color: #000;
  line-height: 1;
}

.chips-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  color: rgba(0,0,0,0.7);
  font-weight: 700;
  margin-top: 3px;
}

.times-sign {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #fff;
  flex-shrink: 0;
}

.mult-block {
  flex: 1;
  background: linear-gradient(135deg, #ff8844, #ff3344);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px 6px;
  border: 1.5px solid rgba(255,100,80,0.5);
}

.mult-num {
  font-family: 'Press Start 2P', monospace;
  font-size: 22px;
  color: #000;
  line-height: 1;
}

.mult-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  color: rgba(0,0,0,0.7);
  font-weight: 700;
  margin-top: 3px;
}

/* Hands / Discards */
.hd-row {
  display: flex;
  gap: 8px;
}

.hd-block {
  flex: 1;
  background: rgba(5,8,24,0.6);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border: 1px solid rgba(74,107,255,0.3);
}

.hd-num {
  font-family: 'VT323', monospace;
  font-size: 34px;
  line-height: 1;
}

.hd-block.green .hd-num { color: #34d399; }
.hd-block.red .hd-num { color: #f87171; }

.hd-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #8a9bbf;
  font-weight: 600;
}

/* 金币 */
.coins-panel {
  background: rgba(5,8,24,0.8);
  border-radius: 10px;
  border: 1px solid rgba(255,200,80,0.3);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.dollar-sign {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffc857;
}

.coins-num {
  font-family: 'VT323', monospace;
  font-size: 44px;
  color: #ffc857;
  line-height: 1;
}

/* Ante row */
.ante-row {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
}

.ante-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #ffb030;
  font-weight: 600;
}

.round-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #4dd6ff;
  font-weight: 600;
}

/* 重新开始按钮 */
.restart-btn {
  width: 100%;
  margin-top: auto;
}

/* ——— 按钮基础样式（PRD §4.6）——— */
.px-btn {
  min-height: 52px;
  padding: 14px 26px;
  border-radius: 12px;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-shadow: 0 1px 2px rgba(0,0,0,.45);
  border: 2px solid rgba(0,0,0,.35);
  box-shadow:
    0 5px 0 #991b1b,
    0 8px 18px rgba(239,68,68,0.3),
    inset 0 1px 0 rgba(255,255,255,.3);
  cursor: pointer;
  transition: all 0.15s ease;
  color: #fff;
}

.px-btn:hover:not([disabled]) {
  transform: translateY(-2px);
  filter: brightness(1.1) saturate(1.15);
}

.px-btn:active:not([disabled]) {
  transform: translateY(2px);
  filter: brightness(0.92);
}

.px-btn[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

/* 弃牌/重开：朱红 */
.btn-red {
  background: linear-gradient(180deg, #fb7185 0%, #ef4444 50%, #dc2626 100%);
}
</style>
