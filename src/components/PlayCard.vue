<template>
  <!-- 扑克牌：100×145px（PRD §4.3 硬锁定） -->
  <div
    class="play-card"
    :class="[suitClass, { selected: isSelected, played: isPlayed }]"
    @click="$emit('click')"
  >
    <!-- 左上角点数 + 花色 -->
    <div class="corner top-left">
      <div class="rank">{{ card.rank }}</div>
      <div class="suit">{{ card.suit }}</div>
    </div>

    <!-- 中央大花色 -->
    <div class="center-suit">{{ card.suit }}</div>

    <!-- 右下角（倒置） -->
    <div class="corner bottom-right">
      <div class="rank">{{ card.rank }}</div>
      <div class="suit">{{ card.suit }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  isPlayed: { type: Boolean, default: false },
})

defineEmits(['click'])

const suitClass = computed(() => {
  return props.card.suit === '♥' || props.card.suit === '♦' ? 'red-suit' : 'black-suit'
})
</script>

<style scoped>
.play-card {
  width: 100px;
  height: 145px;
  background: linear-gradient(145deg, #fffef8 0%, #fff9e8 100%);
  border-radius: 8px;
  border: 1.5px solid rgba(0,0,0,0.18);
  box-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.2);
  position: relative;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  flex-shrink: 0;
  user-select: none;
}

.play-card:hover {
  box-shadow: 0 4px 12px rgba(99,102,241,0.3), 0 2px 4px rgba(0,0,0,0.25);
}

/* 选中态：上移 22px + 蓝色发光（PRD §4.3 手牌段 padding-top ≥ 36px 为此留出余量）*/
.play-card.selected {
  transform: translateY(-22px);
  box-shadow: 0 0 16px rgba(99,160,241,0.7), 0 4px 12px rgba(99,102,241,0.4);
  border-color: rgba(99,160,241,0.8);
}

/* 出牌区的牌不响应点击 */
.play-card.played {
  cursor: default;
  transform: none;
}

.corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  gap: 1px;
}

.top-left {
  top: 6px;
  left: 7px;
}

.bottom-right {
  bottom: 6px;
  right: 7px;
  transform: rotate(180deg);
}

.rank {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.suit {
  font-size: 11px;
  line-height: 1;
}

.center-suit {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  line-height: 1;
  pointer-events: none;
}

/* 红色花色 */
.red-suit .rank,
.red-suit .suit,
.red-suit .center-suit {
  color: #c0392b;
}

/* 黑色花色 */
.black-suit .rank,
.black-suit .suit,
.black-suit .center-suit {
  color: #1a1a2e;
}
</style>
