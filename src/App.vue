<template>
  <div class="game-root">
    <!-- ====== 左 Sidebar ====== -->
    <SideBar
      :currentBlind="currentBlind"
      :currentBlindIdx="currentBlindIdx"
      :blindScore="blindScore"
      :handsLeft="handsLeft"
      :discardsLeft="discardsLeft"
      :gold="gold"
      :battleChips="battleChips"
      :battleMult="battleMult"
      :currentHandType="currentHandType"
      :previewHand="previewHand"
      @restart="initGame"
    />

    <!-- ====== 右主区 ====== -->
    <main class="main-area">

      <!-- === 段 1: Joker 区 === -->
      <section class="main-section joker-section">
        <div class="section-title-bar">
          <span class="section-title-pixel">JOKERS · {{ jokerCount }}/5</span>
        </div>
        <div class="joker-row">
          <template v-for="joker in ownedJokers" :key="joker.id">
            <JokerCard
              :joker="joker"
              :isTriggered="triggeredJokerIds.includes(joker.id)"
            />
          </template>
          <!-- 空槽 -->
          <template v-for="i in (5 - jokerCount)" :key="`empty-${i}`">
            <div class="joker-empty">
              <span class="empty-label">空槽</span>
            </div>
          </template>
        </div>
      </section>

      <!-- === 段 2: 出牌区 === -->
      <section class="main-section played-section">
        <div class="section-title-bar">
          <span class="played-label">出牌区</span>
          <span v-if="previewHand && !currentHandType" class="played-hand-name">{{ previewHand.name }}</span>
          <span v-if="currentHandType" class="played-hand-name">{{ currentHandType.name }}</span>
        </div>
        <div class="played-area">
          <template v-if="playedCards.length > 0">
            <PlayCard
              v-for="card in playedCards"
              :key="card.id"
              :card="card"
              :isPlayed="true"
              :isHighlighted="highlightedCardIds.includes(card.id)"
            />
          </template>
          <span v-else class="played-empty-hint">选择手牌组成牌型（1-5 张）</span>
        </div>
      </section>

      <!-- === 段 3: 手牌 + 操作 === -->
      <section class="main-section hand-section">
        <div class="section-title-bar">
          <span class="hand-label">手牌</span>
          <span class="hand-count">
            已选 {{ selectedIds.length }} 张
            <template v-if="previewHand"> · {{ previewHand.name }}</template>
          </span>
        </div>
        <div class="hand-cards-row">
          <PlayCard
            v-for="card in hand"
            :key="card.id"
            :card="card"
            :isSelected="selectedIds.includes(card.id)"
            @toggle="toggleSelect"
          />
        </div>
        <!-- 操作按钮行 -->
        <div class="action-row" ref="actionRowRef">
          <button
            class="px-btn px-btn-play"
            :disabled="selectedIds.length === 0 || isAnimating"
            @click="playCards(deckRef)"
          >出牌 ({{ selectedIds.length }})</button>
          <button
            class="px-btn px-btn-red"
            :disabled="selectedIds.length === 0 || discardsLeft <= 0 || isAnimating"
            @click="discardCards"
          >弃牌 ({{ discardsLeft }})</button>
          <button class="px-btn px-btn-sort" :disabled="isAnimating" @click="sortByRank">按点排序</button>
          <button class="px-btn px-btn-sort" :disabled="isAnimating" @click="sortBySuit">按花排序</button>
        </div>
      </section>

    </main>

    <!-- ====== 牌堆（fixed 右下角）====== -->
    <div class="deck-pile" ref="deckRef">
      <div class="deck-layer deck-layer-1"></div>
      <div class="deck-layer deck-layer-2"></div>
      <div class="deck-layer deck-layer-3"></div>
      <div class="deck-count">{{ deck.length }}/52</div>
    </div>

    <!-- ====== 商店界面 ====== -->
    <Teleport to="body">
      <div v-if="gameState === 'shop'" class="overlay-screen">
        <div class="shop-panel">
          <h1 class="shop-title">商店</h1>
          <p class="shop-subtitle">
            通关奖励到账！金币 ${{ gold }} · Joker 槽 {{ jokerCount }}/5
          </p>
          <div class="shop-items">
            <div v-for="item in shopItems" :key="item.id" class="shop-item">
              <JokerCard :joker="item" :showPrice="true" />
              <button
                class="px-btn shop-buy-btn"
                :class="[
                  soldIds.includes(item.id) ? 'btn-sold' :
                  gold < item.price ? 'btn-broke' :
                  jokerCount >= 5 ? 'btn-full' :
                  'px-btn-buy'
                ]"
                :disabled="soldIds.includes(item.id) || gold < item.price || jokerCount >= 5"
                @click="buyJoker(item)"
              >
                {{
                  soldIds.includes(item.id) ? '已售出' :
                  gold < item.price ? '钱不够' :
                  jokerCount >= 5 ? '槽满了' :
                  `购买 $${item.price}`
                }}
              </button>
            </div>
          </div>
          <div class="shop-footer">
            <button class="px-btn px-btn-skip shop-skip-btn" @click="skipShop">跳过 →</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ====== 结束界面 ====== -->
    <Teleport to="body">
      <div v-if="gameState === 'won' || gameState === 'lost'" class="overlay-screen">
        <div class="end-panel">
          <div :class="['end-title', gameState === 'won' ? 'won' : 'lost']">
            {{ gameState === 'won' ? '🎉 通关全部' : '💀 失败' }}
          </div>
          <div class="end-info">
            <div class="end-gold">
              <span class="money-sign-sm">$</span>
              <span class="end-gold-val">{{ gold }}</span>
            </div>
            <div v-if="ownedJokers.length > 0" class="end-jokers">
              <div class="end-jokers-label">持有的 Joker</div>
              <div class="end-jokers-row">
                <JokerCard v-for="j in ownedJokers" :key="j.id" :joker="j" />
              </div>
            </div>
          </div>
          <button class="px-btn px-btn-red end-restart-btn" @click="initGame">重新开始</button>
        </div>
      </div>
    </Teleport>

    <!-- ====== 最终公式 ====== -->
    <Teleport to="body">
      <div v-if="showFinalFormula" class="final-formula">
        <span class="ff-chips">{{ finalChips }}</span>
        <span class="ff-x">×</span>
        <span class="ff-mult">{{ finalMult }}</span>
        <span class="ff-eq">=</span>
        <span class="ff-score">{{ finalScore }}</span>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SideBar from './components/SideBar.vue'
import JokerCard from './components/JokerCard.vue'
import PlayCard from './components/PlayCard.vue'
import { useGame } from './utils/useGame.js'

const deckRef = ref(null)
const actionRowRef = ref(null)

const {
  gameState,
  gold,
  ownedJokers,
  currentBlindIdx,
  currentBlind,
  deck,
  hand,
  selectedIds,
  selectedCards,
  playedCards,
  handsLeft,
  discardsLeft,
  blindScore,
  isAnimating,
  battleChips,
  battleMult,
  currentHandType,
  triggeredJokerIds,
  showFinalFormula,
  finalChips,
  finalMult,
  finalScore,
  floatTexts,
  highlightedCardIds,
  shopItems,
  soldIds,
  jokerCount,
  previewHand,
  initGame,
  toggleSelect,
  playCards,
  discardCards,
  sortByRank,
  sortBySuit,
  buyJoker,
  skipShop,
} = useGame()

// 初始化游戏
initGame()
</script>

<style scoped>
/* ====== 整体布局 ====== */
.game-root {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* ====== 右主区 ====== */
.main-area {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  overflow: hidden;
  /* 注意：不加 padding-right，让背景充满到 viewport 右边 */
}

/* ====== 每段通用 ====== */
.main-section {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  overflow: hidden;
  border-bottom: 1px solid rgba(74,107,255,.15);
}
.main-section:last-child { border-bottom: none; }

/* 段标题行 */
.section-title-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.section-title-pixel {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffc857;
  text-shadow: 2px 2px 0 #000, -1px -1px 0 #000;
  letter-spacing: 1px;
}

/* ====== 段 1: Joker 区 ====== */
.joker-section { background: rgba(10,20,60,.4); }
.joker-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-wrap: nowrap;
  overflow-x: auto;
}
.joker-empty {
  width: 140px;
  height: 200px;
  border: 2px dashed rgba(74,107,255,.3);
  border-radius: 10px;
  background: rgba(74,107,255,.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.empty-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #8a9bbf;
}

/* ====== 段 2: 出牌区 ====== */
.played-section { background: rgba(5,8,24,.3); }
.played-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #8a9bbf;
}
.played-hand-name {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #4dd6ff;
}
.played-area {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  min-height: 60px;
}
.played-empty-hint {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #8a9bbf;
  display: flex;
  align-items: center;
  height: 100%;
}

/* ====== 段 3: 手牌 + 操作 ====== */
.hand-section { background: rgba(10,20,60,.5); }
.hand-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #ffc857;
}
.hand-count {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #8a9bbf;
}
.hand-cards-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: flex-end;
  flex: 1;
  overflow-x: auto;
  /* 选中牌上移 28px，手牌区需要留出空间 */
  padding-top: 36px;
}

/* 操作按钮行：padding-right 130px 给牌堆腾位 */
.action-row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 130px 4px 0;
  flex-shrink: 0;
}

/* ====== 商店界面 ====== */
.overlay-screen {
  position: fixed;
  inset: 0;
  background: rgba(5,8,24,.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.shop-panel {
  background: linear-gradient(180deg, #111e44, #0a1438);
  border: 2px solid rgba(74,107,255,.4);
  border-radius: 20px;
  padding: 36px 40px;
  min-width: 640px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.shop-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 32px;
  font-weight: 900;
  color: #ffc857;
  margin: 0;
}
.shop-subtitle {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  color: #c9d2e8;
  margin: 0;
}
.shop-items {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}
.shop-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.shop-buy-btn {
  width: 140px;
  font-size: 14px;
  min-height: 44px;
  padding: 10px 12px;
}
.btn-sold {
  background: rgba(100,100,100,.3);
  border-color: rgba(100,100,100,.4);
  color: #8a9bbf;
  box-shadow: none;
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-broke {
  background: rgba(100,100,100,.2);
  border-color: rgba(100,100,100,.3);
  color: #8a9bbf;
  box-shadow: none;
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-full {
  background: rgba(100,100,100,.2);
  border-color: rgba(100,100,100,.3);
  color: #8a9bbf;
  box-shadow: none;
  opacity: 0.45;
  cursor: not-allowed;
}
.shop-footer { width: 100%; display: flex; justify-content: flex-end; }
.shop-skip-btn {
  min-width: 160px;
}

/* ====== 结束界面 ====== */
.end-panel {
  background: linear-gradient(180deg, #111e44, #0a1438);
  border: 2px solid rgba(74,107,255,.4);
  border-radius: 20px;
  padding: 48px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  min-width: 400px;
}
.end-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 32px;
  font-weight: 900;
}
.end-title.won  { color: #ffc857; }
.end-title.lost { color: #ef4444; }
.end-info { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.end-gold {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.money-sign-sm {
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffc857;
}
.end-gold-val {
  font-family: 'VT323', monospace;
  font-size: 52px;
  color: #ffb030;
  line-height: 1;
}
.end-jokers-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #8a9bbf;
  text-align: center;
  margin-bottom: 8px;
}
.end-jokers-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.end-restart-btn {
  min-width: 200px;
}

/* 牌堆 fixed 右下角 */
.deck-pile {
  position: fixed;
  bottom: 24px;
  right: 20px;
  z-index: 50;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.deck-layer {
  width: 90px;
  height: 130px;
  border-radius: 8px;
  position: absolute;
  border: 2px solid rgba(100,50,200,.6);
}
.deck-layer-1 { background: linear-gradient(135deg, #4a2090, #1a0a40); top: 4px; left: 4px; }
.deck-layer-2 { background: linear-gradient(135deg, #5a2aa0, #2a1060); top: 2px; left: 2px; }
.deck-layer-3 { background: linear-gradient(135deg, #6a3ab0, #3a1870); top: 0; left: 0; }
.deck-count {
  margin-top: 140px;
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #ffc857;
  text-align: center;
}

/* 最终公式 */
.final-formula {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 300;
  display: flex;
  align-items: baseline;
  gap: 12px;
  pointer-events: none;
  animation: formulaIn 0.3s ease-out, formulaOut 0.5s ease-in 1.2s forwards;
}
.ff-chips { font-family: 'Press Start 2P', monospace; font-size: 40px; color: #4dd6ff; text-shadow: 0 0 20px #4dd6ff; }
.ff-x     { font-family: 'Press Start 2P', monospace; font-size: 28px; color: #c9d2e8; }
.ff-mult  { font-family: 'Press Start 2P', monospace; font-size: 40px; color: #ff8844; text-shadow: 0 0 20px #ff8844; }
.ff-eq    { font-family: 'Press Start 2P', monospace; font-size: 28px; color: #c9d2e8; }
.ff-score { font-family: 'Press Start 2P', monospace; font-size: 52px; color: #ffc857; text-shadow: 0 0 30px #ffc857; }

@keyframes formulaIn {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes formulaOut {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
</style>
