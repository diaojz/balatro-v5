<template>
  <!-- Joker 卡：140×200px（PRD §4.3 硬锁定） -->
  <div
    class="joker-card"
    :class="{ triggered: isTriggered }"
    :style="{ '--rarity-color': rarityColor }"
  >
    <!-- 四角稀有度内描边由 ::before 实现 -->
    <div class="joker-art">{{ joker.art }}</div>
    <div class="joker-name">{{ joker.name }}</div>
    <div class="joker-desc">{{ joker.description }}</div>
    <div class="joker-price">${{ joker.price }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RARITY_COLOR } from '../config/jokers.js'

const props = defineProps({
  joker: { type: Object, required: true },
  isTriggered: { type: Boolean, default: false },
})

const rarityColor = computed(() => RARITY_COLOR[props.joker.rarity] || '#6cb4d3')
</script>

<style scoped>
.joker-card {
  width: 140px;
  height: 200px;
  background: linear-gradient(160deg, #fdfbe8 0%, #f5e9c8 100%);
  border-radius: 10px;
  border: 2px solid rgba(0,0,0,0.2);
  box-shadow: 0 3px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 10px 10px;
  box-sizing: border-box;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
}

/* 四角稀有度内描边 */
.joker-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 7px;
  border: 2px solid var(--rarity-color, #6cb4d3);
  pointer-events: none;
}

/* Joker 触发高亮：上移 + 金光（PRD §5.3，持续 800ms）*/
.joker-card.triggered {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 0 24px rgba(255,200,80,0.9), 0 8px 24px rgba(0,0,0,0.4);
  border-color: #ffd700;
}

.joker-art {
  font-size: 40px;
  line-height: 1;
}

.joker-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a2e;
  text-align: center;
  line-height: 1.2;
}

.joker-desc {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  color: #5a5a7a;
  text-align: center;
  line-height: 1.35;
}

.joker-price {
  font-family: 'VT323', monospace;
  font-size: 16px;
  color: #c9841a;
  position: absolute;
  bottom: 8px;
  right: 10px;
}
</style>
