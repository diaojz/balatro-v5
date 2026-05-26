<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="logo">🃏 小丑牌</div>

    <!-- 盲注大面板 -->
    <div class="sb-panel blind-panel">
      <div class="sb-label-sm">盲注 {{ currentBlindIdx + 1 }}/3</div>
      <div class="blind-header">
        <span class="blind-icon">{{ currentBlind.icon }}</span>
        <span class="blind-name">{{ currentBlind.name }}</span>
      </div>
      <div class="inset-box">
        <div class="inset-label">目标分</div>
        <div class="target-score">{{ currentBlind.target }}</div>
        <div class="reward-text">通关奖励 +${{ currentBlind.reward + handsLeft }}</div>
      </div>
    </div>

    <!-- Round Score -->
    <div class="sb-panel">
      <div class="sb-label-sm">当前分</div>
      <div class="round-score">{{ blindScore }}</div>
      <div class="progress-bar">
        <div
          class="progress-bar-fill"
          :style="{ width: Math.min(100, (blindScore / currentBlind.target) * 100) + '%' }"
        ></div>
      </div>
    </div>

    <!-- HAND 计分块 -->
    <div class="sb-panel">
      <div class="hand-type-name">
        {{ currentHandType ? currentHandType.name : (previewHand ? previewHand.name : '— 选牌出牌 —') }}
      </div>
      <div class="score-row">
        <div class="chips-block">
          <span :class="['chips-val', { 'num-jump': chipsJump }]">{{ battleChips }}</span>
          <span class="score-unit">筹码</span>
        </div>
        <span class="score-x">×</span>
        <div class="mult-block">
          <span :class="['mult-val', { 'num-jump': multJump }]">{{ battleMult }}</span>
          <span class="score-unit">倍率</span>
        </div>
      </div>
    </div>

    <!-- Hands / Discards -->
    <div class="hands-row">
      <div class="hand-block">
        <div class="hand-label">剩余手数</div>
        <div class="hand-val green">{{ handsLeft }}</div>
      </div>
      <div class="hand-block">
        <div class="hand-label">剩余弃牌</div>
        <div class="hand-val red">{{ discardsLeft }}</div>
      </div>
    </div>

    <!-- 金币 -->
    <div class="sb-panel money-panel">
      <span class="money-sign">$</span>
      <span class="money-val">{{ gold }}</span>
    </div>

    <!-- Ante / Round -->
    <div class="ante-row">
      <span class="ante-orange">Ante 1/3</span>
      <span class="ante-dot"> · </span>
      <span class="ante-blue">Round {{ currentBlindIdx + 1 }}</span>
    </div>

    <!-- 重新开始按钮 -->
    <button class="px-btn px-btn-red restart-btn" @click="$emit('restart')">重新开始</button>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  currentBlind: Object,
  currentBlindIdx: Number,
  blindScore: Number,
  handsLeft: Number,
  discardsLeft: Number,
  gold: Number,
  battleChips: Number,
  battleMult: Number,
  currentHandType: Object,
  previewHand: Object,
})

defineEmits(['restart'])

// chips / mult 数字跳动动画
const chipsJump = ref(false)
const multJump = ref(false)

watch(() => props.battleChips, () => {
  chipsJump.value = false
  setTimeout(() => { chipsJump.value = true }, 10)
  setTimeout(() => { chipsJump.value = false }, 340)
})

watch(() => props.battleMult, () => {
  multJump.value = false
  setTimeout(() => { multJump.value = true }, 10)
  setTimeout(() => { multJump.value = false }, 340)
})
</script>

<style scoped>
.sidebar {
  width: min(28vw, 480px);
  min-width: 280px;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, #1a2a5a, #111e44);
  border-right: 2px solid rgba(74,107,255,.4);
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

/* Logo */
.logo {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffc857;
  text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
  text-align: center;
  padding: 8px 0 4px;
  letter-spacing: 1px;
}

/* 小标签 */
.sb-label-sm {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #8a9bbf;
  margin-bottom: 4px;
}

/* 盲注面板 */
.blind-panel { }
.blind-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.blind-icon { font-size: 20px; }
.blind-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}
.inset-box {
  background: #050818;
  border-radius: 8px;
  border: 1px solid rgba(74,107,255,.3);
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.inset-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #8a9bbf;
}
.target-score {
  font-family: 'VT323', monospace;
  font-size: 28px;
  color: #ffc857;
  line-height: 1;
}
.reward-text {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #ffc857;
}

/* Round Score */
.round-score {
  font-family: 'VT323', monospace;
  font-size: 44px;
  color: #4dd6ff;
  line-height: 1;
  text-align: center;
}

/* HAND 计分块 */
.hand-type-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #4dd6ff;
  text-align: center;
  margin-bottom: 6px;
  min-height: 20px;
}
.score-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.chips-block {
  flex: 1;
  background: linear-gradient(135deg, #4dd6ff, #2196f3);
  border-radius: 10px;
  padding: 10px 6px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 4px 0 #0d4a80, 0 6px 16px rgba(33,150,243,.4);
  border: 2px solid #1a7bd4;
}
.mult-block {
  flex: 1;
  background: linear-gradient(135deg, #ff8844, #ff3344);
  border-radius: 10px;
  padding: 10px 6px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 4px 0 #8b1a1a, 0 6px 16px rgba(255,51,68,.4);
  border: 2px solid #cc2233;
}
.chips-val, .mult-val {
  font-family: 'Press Start 2P', monospace;
  font-size: 28px;
  color: rgba(0,5,20,.9);
  line-height: 1;
}
.score-unit {
  font-size: 9px;
  color: rgba(0,0,0,.5);
  margin-top: 4px;
  letter-spacing: 1px;
}
.score-x {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #c9d2e8;
  flex-shrink: 0;
}

/* Hands / Discards */
.hands-row {
  display: flex;
  gap: 6px;
}
.hand-block {
  flex: 1;
  background: #1e3068;
  border: 2px solid rgba(74,107,255,.5);
  border-radius: 8px;
  padding: 8px 6px;
  text-align: center;
}
.hand-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #8a9bbf;
  margin-bottom: 2px;
}
.hand-val {
  font-family: 'VT323', monospace;
  font-size: 34px;
  line-height: 1;
}
.hand-val.green { color: #62d18b; }
.hand-val.red   { color: #ff5544; }

/* 金币 */
.money-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
}
.money-sign {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffc857;
}
.money-val {
  font-family: 'VT323', monospace;
  font-size: 44px;
  color: #ffb030;
  line-height: 1;
}

/* Ante */
.ante-row {
  text-align: center;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
}
.ante-orange { color: #ffc857; font-weight: 600; }
.ante-dot    { color: #8a9bbf; }
.ante-blue   { color: #4dd6ff; font-weight: 600; }

/* 重新开始按钮 */
.restart-btn {
  width: 100%;
  font-size: 15px;
  margin-top: auto;
}
</style>
