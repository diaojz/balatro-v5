<template>
  <div :class="['joker-card', `rarity-${joker.rarity}`, { triggered: isTriggered }]">
    <span class="joker-art">{{ joker.art }}</span>
    <span class="joker-name">{{ joker.name }}</span>
    <span class="joker-desc">{{ joker.desc }}</span>
    <span class="joker-price" v-if="showPrice">${{ joker.price }}</span>
  </div>
</template>

<script setup>
defineProps({
  joker: Object,
  isTriggered: { type: Boolean, default: false },
  showPrice: { type: Boolean, default: false },
})
</script>

<style scoped>
.joker-card {
  width: 140px;
  height: 200px;
  background: linear-gradient(180deg, #fff8e1, #f7e9c4);
  border: 2px solid #1a0f24;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
  padding: 8px 6px;
  gap: 4px;
}

/* 稀有度描边（四角内描边用 outline）*/
.joker-card.rarity-common   { outline: 3px solid #6cb4d3; outline-offset: -4px; }
.joker-card.rarity-rare     { outline: 3px solid #e34b6f; outline-offset: -4px; }
.joker-card.rarity-legendary { outline: 3px solid #b577ff; outline-offset: -4px; }

/* Joker 触发高亮 */
.joker-card.triggered {
  transform: translateY(-12px) scale(1.05);
  box-shadow: 0 0 24px rgba(255,200,87,.9), 0 8px 16px rgba(0,0,0,.5);
  outline-color: #ffc857;
}

.joker-art {
  font-size: 40px;
  line-height: 1;
}
.joker-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #1a0f24;
  text-align: center;
}
.joker-desc {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 10px;
  color: #3a2914;
  text-align: center;
  line-height: 1.4;
  padding: 0 4px;
}
.joker-price {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #15803d;
  margin-top: 2px;
}
</style>
