<template>
  <div
    :class="['play-card', { selected: isSelected, played: isPlayed, 'play-highlight': isHighlighted }]"
    @click="!isPlayed && $emit('toggle', card.id)"
  >
    <!-- 左上角点数/花色 -->
    <div class="card-corner card-corner-tl">
      <div :class="['card-rank', card.color]">{{ card.rank }}</div>
      <div :class="['card-suit', card.color]">{{ card.suit }}</div>
    </div>
    <!-- 中间大花色 -->
    <div :class="['card-suit-center', card.color]">{{ card.suit }}</div>
    <!-- 右下角点数/花色（倒置）-->
    <div class="card-corner card-corner-br">
      <div :class="['card-rank', card.color]">{{ card.rank }}</div>
      <div :class="['card-suit', card.color]">{{ card.suit }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  card: Object,
  isSelected: { type: Boolean, default: false },
  isPlayed: { type: Boolean, default: false },
  isHighlighted: { type: Boolean, default: false },
})
defineEmits(['toggle'])
</script>

<style scoped>
.play-card {
  width: 100px;
  height: 145px;
  background: linear-gradient(180deg, #fff8e1, #f7e9c4);
  border: 2px solid #1a0f24;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0,0,0,.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
  flex-shrink: 0;
}
.play-card:hover:not(.played) {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,.5);
}
.play-card.selected {
  transform: translateY(-28px);
  box-shadow: 0 8px 20px rgba(74,107,255,.6);
}
.play-card.played {
  cursor: default;
  pointer-events: none;
}
.play-card.play-highlight {
  box-shadow: 0 0 16px rgba(77,214,255,.8), 0 4px 8px rgba(0,0,0,.4);
  transform: translateY(-10px);
}

/* 角落 */
.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}
.card-corner-tl { top: 5px; left: 7px; }
.card-corner-br { bottom: 5px; right: 7px; transform: rotate(180deg); }

.card-rank {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 900;
  line-height: 1;
}
.card-suit {
  font-size: 12px;
  line-height: 1;
}
/* 中央大花色 */
.card-suit-center {
  font-size: 32px;
  line-height: 1;
}

.red   { color: #dc2626; }
.black { color: #1a0f24; }
</style>
