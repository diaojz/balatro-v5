<template>
  <div class="game-root">

    <!-- 背景水纹装饰 -->
    <div class="bg-water"></div>

    <!-- 左 Sidebar -->
    <SideBar
      :currentBlind="currentBlind"
      :blindIndex="state.blindIndex"
      :roundScore="state.roundScore"
      :handsLeft="state.handsLeft"
      :discardsLeft="state.discardsLeft"
      :coins="state.coins"
      :handTypeName="handDisplay.name"
      :chips="handDisplay.chips"
      :mult="handDisplay.mult"
      @restart="restart"
    />

    <!-- 右主区：3 段 grid（PRD §4.1 grid-template-rows: 1fr 1fr 1fr）-->
    <main class="main-area">

      <!-- ============================================================
           playing 状态
      ============================================================ -->
      <template v-if="state.phase === 'playing'">

        <!-- 第 1 段：Joker 区（PRD §4.3）-->
        <section class="area-joker">
          <div class="section-title">
            <span class="title-pixel">JOKERS · {{ state.ownedJokers.length }}/5</span>
          </div>
          <div class="joker-row">
            <!-- 已持有 Joker 卡 -->
            <JokerCard
              v-for="joker in state.ownedJokers"
              :key="joker.id"
              :joker="joker"
              :isTriggered="state.triggeredJokerIds.has(joker.id)"
            />
            <!-- 空槽（PRD §4.3：140×200, dashed rgba(79,70,229,.4), + 号 24px, 空槽 12px）-->
            <div
              v-for="i in (MAX_JOKER_SLOTS - state.ownedJokers.length)"
              :key="'empty-' + i"
              class="joker-empty-slot"
            >
              <span class="empty-plus">+</span>
              <span class="empty-label">空槽</span>
            </div>
          </div>
        </section>

        <!-- 第 2 段：出牌区（PRD §4.3）-->
        <section class="area-played">
          <div class="played-header">
            <span class="played-title">出牌区</span>
            <span v-if="state.currentHandType && state.playedCards.length > 0" class="played-hand-type">
              {{ state.currentHandType.name }}
            </span>
          </div>
          <!-- 空态提示（PRD §4.3：Inter 14px 灰 opacity 0.55，不显示预估公式）-->
          <div v-if="state.playedCards.length === 0" class="played-empty-hint">
            选择手牌组成牌型（1-5 张）
          </div>
          <!-- 出牌后显示牌 -->
          <div v-else class="played-cards-row">
            <PlayCard
              v-for="card in state.playedCards"
              :key="card.id"
              :card="card"
              :isPlayed="true"
            />
          </div>
        </section>

        <!-- 第 3 段：手牌 + 操作（PRD §4.3）-->
        <section class="area-hand">
          <!-- 手牌标题行 -->
          <div class="hand-header">
            <span class="hand-title">手牌</span>
            <span class="hand-count">已选 {{ selectedCount }} / 5 张</span>
          </div>

          <!-- 8 张手牌横排（gap: 8px，不叠层）padding-top ≥ 36px 给选中上移留余量 -->
          <div class="hand-cards-row">
            <PlayCard
              v-for="card in state.hand"
              :key="card.id"
              :card="card"
              :isSelected="state.selectedIds.has(card.id)"
              @click="toggleSelect(card.id)"
            />
          </div>

          <!-- 操作按钮行（right padding ≥ 130px 给牌堆腾位置）-->
          <div class="action-row">
            <button
              class="px-btn btn-green"
              :disabled="!canPlay"
              @click="playCards"
            >
              出牌 ({{ selectedCount }})
            </button>
            <button
              class="px-btn btn-red"
              :disabled="!canDiscard"
              @click="discardCards"
            >
              弃牌 ({{ state.discardsLeft }})
            </button>
            <button class="px-btn btn-ghost" @click="sortByRank">按点排序</button>
            <button class="px-btn btn-ghost" @click="sortBySuit">按花排序</button>
          </div>
        </section>

      </template>

      <!-- ============================================================
           shop 状态（PRD §4.7）
      ============================================================ -->
      <template v-else-if="state.phase === 'shop'">
        <section class="shop-area">
          <h2 class="shop-title">商店</h2>
          <p class="shop-subtitle">
            通关奖励到账！金币 ${{ state.coins }} · Joker 槽 {{ state.ownedJokers.length }}/5
          </p>

          <!-- 3 张随机 Joker 横排 -->
          <div class="shop-jokers-row">
            <div
              v-for="joker in state.shopJokers"
              :key="joker.id"
              class="shop-joker-item"
            >
              <JokerCard :joker="joker" :class="{ 'sold-out': joker.sold }" />
              <button
                class="px-btn shop-buy-btn"
                :class="buyBtnClass(joker)"
                :disabled="isBuyDisabled(joker)"
                @click="buyJoker(joker)"
              >
                {{ buyBtnText(joker) }}
              </button>
            </div>
          </div>

          <!-- 跳过按钮 -->
          <button class="px-btn btn-skip skip-btn" @click="leaveShop">跳过 →</button>
        </section>
      </template>

      <!-- ============================================================
           won 状态（PRD §4.8）
      ============================================================ -->
      <template v-else-if="state.phase === 'won'">
        <section class="end-area">
          <div class="end-panel">
            <div class="end-title won-title">🎉 通关全部</div>
            <div class="end-coins">最终金币：${{ state.coins }}</div>
            <div v-if="state.ownedJokers.length > 0" class="end-jokers">
              <div class="end-jokers-label">持有的 Joker</div>
              <div class="end-jokers-row">
                <JokerCard v-for="j in state.ownedJokers" :key="j.id" :joker="j" />
              </div>
            </div>
            <button class="px-btn btn-red end-restart" @click="restart">重新开始</button>
          </div>
        </section>
      </template>

      <!-- ============================================================
           lost 状态（PRD §4.8）
      ============================================================ -->
      <template v-else-if="state.phase === 'lost'">
        <section class="end-area">
          <div class="end-panel">
            <div class="end-title lost-title">💀 失败</div>
            <div class="end-coins">最终金币：${{ state.coins }}</div>
            <div v-if="state.ownedJokers.length > 0" class="end-jokers">
              <div class="end-jokers-label">持有的 Joker</div>
              <div class="end-jokers-row">
                <JokerCard v-for="j in state.ownedJokers" :key="j.id" :joker="j" />
              </div>
            </div>
            <button class="px-btn btn-red end-restart" @click="restart">重新开始</button>
          </div>
        </section>
      </template>

    </main>

    <!-- 牌堆（fixed 右下角，PRD §4.4）-->
    <div class="deck-pile">
      <div class="deck-stack deck-s3"></div>
      <div class="deck-stack deck-s2"></div>
      <div class="deck-stack deck-s1">
        <div class="deck-pattern"></div>
      </div>
      <div class="deck-count">{{ state.deck.length }}/52</div>
    </div>

  </div>
</template>

<script setup>
import SideBar from './components/SideBar.vue'
import JokerCard from './components/JokerCard.vue'
import PlayCard from './components/PlayCard.vue'
import { useGame } from './utils/useGame.js'

const {
  state,
  currentBlind,
  selectedCount,
  handDisplay,
  canPlay,
  canDiscard,
  MAX_JOKER_SLOTS,
  toggleSelect,
  playCards,
  discardCards,
  sortByRank,
  sortBySuit,
  buyJoker,
  leaveShop,
  restart,
} = useGame()

// 商店购买按钮文案（PRD §3.3）
function buyBtnText(joker) {
  if (joker.sold) return '已售出'
  if (state.ownedJokers.length >= MAX_JOKER_SLOTS) return '槽满了'
  if (state.coins < joker.price) return '钱不够'
  return `购买 $${joker.price}`
}

function buyBtnClass(joker) {
  if (joker.sold) return 'btn-sold'
  if (state.ownedJokers.length >= MAX_JOKER_SLOTS) return 'btn-full'
  if (state.coins < joker.price) return 'btn-poor'
  return 'btn-buy'
}

function isBuyDisabled(joker) {
  return joker.sold || state.ownedJokers.length >= MAX_JOKER_SLOTS || state.coins < joker.price
}
</script>

<style scoped>
/* ——— 整页布局 ——— */
.game-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  position: relative;
  background: #0a1438;
}

/* 背景水纹 */
.bg-water {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, #2d408030 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 20% 80%, #1a285840 0%, transparent 60%),
    linear-gradient(180deg, #0a1438 0%, #1a2858 50%, #0a1438 100%);
  pointer-events: none;
  z-index: 0;
}

/* 右主区：flex-1，纵向 3 段 */
.main-area {
  flex: 1;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  height: 100vh;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* ——— 第 1 段：Joker 区 ——— */
.area-joker {
  background: rgba(15,23,42,.6);
  display: flex;
  flex-direction: column;
  padding: 12px 20px 10px;
  overflow: hidden;
}

.section-title {
  margin-bottom: 10px;
}

.title-pixel {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffc857;
  text-shadow: 2px 2px 0 #000;
}

/* align-items: flex-start 让卡贴段顶部（PRD §4.3 关键）*/
.joker-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.joker-row::-webkit-scrollbar { height: 0; }

/* 空槽（PRD §4.3：140×200, dashed rgba(79,70,229,.4)）*/
.joker-empty-slot {
  width: 140px;
  height: 200px;
  border: 2.5px dashed rgba(79,70,229,.4);
  border-radius: 10px;
  background: rgba(79,70,229,.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
}

.empty-plus {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  color: #8a9bbf;
  line-height: 1;
}

.empty-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #8a9bbf;
}

/* ——— 第 2 段：出牌区 ——— */
.area-played {
  background: rgba(5,8,24,.5);
  display: flex;
  flex-direction: column;
  padding: 12px 20px 10px;
  align-items: flex-start;
  overflow: hidden;
}

.played-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  width: 100%;
}

.played-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #8a9bbf;
}

.played-hand-type {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #4dd6ff;
}

/* 空态提示（PRD §4.3：Inter 14px 灰 opacity 0.55 居中）*/
.played-empty-hint {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #8a9bbf;
  opacity: 0.55;
}

.played-cards-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: nowrap;
}

/* ——— 第 3 段：手牌 + 操作 ——— */
.area-hand {
  display: flex;
  flex-direction: column;
  padding: 0 20px 10px;
  background: rgba(10,20,56,.4);
  overflow: hidden;
}

.hand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  margin-bottom: 4px;
}

.hand-title {
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

/* 手牌横排，gap: 8px，padding-top ≥ 36px（PRD §4.3）*/
.hand-cards-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  justify-content: center;
  padding-top: 36px;
  flex: 1;
  overflow-x: auto;
}

.hand-cards-row::-webkit-scrollbar { height: 0; }

/* 操作按钮行，right padding ≥ 130px 给牌堆（PRD §4.3）*/
.action-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 130px 0 0;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

/* ——— 按钮基础样式（PRD §4.6）——— */
.px-btn {
  min-height: 52px;
  padding: 14px 26px;
  border-radius: 12px;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-shadow: 0 1px 2px rgba(0,0,0,.45);
  border: 2px solid rgba(0,0,0,.35);
  cursor: pointer;
  transition: all 0.15s ease;
  color: #fff;
  white-space: nowrap;
  inset: 0 1px 0 rgba(255,255,255,.3);
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

/* 出牌：翠绿 */
.btn-green {
  background: linear-gradient(180deg, #34d399 0%, #10b981 50%, #059669 100%);
  box-shadow: 0 5px 0 #047857, 0 8px 18px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,.3);
}

/* 弃牌/重开：朱红 */
.btn-red {
  background: linear-gradient(180deg, #fb7185 0%, #ef4444 50%, #dc2626 100%);
  box-shadow: 0 5px 0 #991b1b, 0 8px 18px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,.3);
}

/* 排序：紫蓝 ghost */
.btn-ghost {
  background: linear-gradient(180deg, rgba(99,102,241,.28) 0%, rgba(67,56,202,.20) 100%);
  border: 1.5px solid rgba(99,102,241,.5);
  box-shadow: 0 3px 0 rgba(67,56,202,.4), inset 0 1px 0 rgba(255,255,255,.15);
  font-size: 14px;
}

/* ——— 商店 ——— */
.shop-area {
  grid-row: 1 / -1;  /* 占满三段 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 30px 20px;
}

.shop-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #ffc857;
  margin: 0;
}

.shop-subtitle {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 15px;
  color: #c9d2e8;
  margin: 0;
}

.shop-jokers-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
}

.shop-joker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* 已售出半透明 */
.sold-out {
  opacity: 0.45;
  pointer-events: none;
}

/* 商店购买按钮：宽 140px 跟 JokerCard 等宽（PRD §4.7），高 ≥ 44px，文字 14px */
.shop-buy-btn {
  width: 140px;
  min-height: 44px;
  font-size: 14px;
  padding: 10px 12px;
}

.btn-buy {
  background: linear-gradient(180deg, #34d399 0%, #10b981 50%, #059669 100%);
  box-shadow: 0 4px 0 #047857, inset 0 1px 0 rgba(255,255,255,.3);
}

.btn-sold,
.btn-full,
.btn-poor {
  background: linear-gradient(180deg, rgba(100,100,130,.3) 0%, rgba(60,60,80,.25) 100%);
  border-color: rgba(100,100,150,.3);
  box-shadow: none;
  color: #8a9bbf;
}

/* 跳过按钮 */
.skip-btn {
  min-width: 160px;
}

.btn-skip {
  background: linear-gradient(180deg, #818cf8 0%, #6366f1 50%, #4338ca 100%);
  box-shadow: 0 5px 0 #312e81, 0 8px 18px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,.3);
}

/* ——— 结束界面 ——— */
.end-area {
  grid-row: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.end-panel {
  background: rgba(5,8,24,0.85);
  border: 1.5px solid rgba(74,107,255,0.4);
  border-radius: 16px;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 600px;
}

.end-title {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 32px;
  font-weight: 900;
  text-align: center;
}

.won-title { color: #ffc857; }
.lost-title { color: #f87171; }

.end-coins {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  color: #c9d2e8;
}

.end-jokers-label {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #8a9bbf;
  text-align: center;
}

.end-jokers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.end-jokers-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.end-restart {
  min-width: 200px;
}

/* ——— 牌堆（PRD §4.4）——— */
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

.deck-stack {
  width: 90px;
  height: 130px;
  border-radius: 8px;
  border: 1.5px solid rgba(120,80,200,0.5);
  position: absolute;
}

.deck-s3 {
  background: #2a1060;
  transform: translate(-4px, -4px);
}

.deck-s2 {
  background: #341575;
  transform: translate(-2px, -2px);
}

.deck-s1 {
  background: linear-gradient(145deg, #4a1fa0 0%, #3a1580 100%);
  position: relative;
}

.deck-pattern {
  position: absolute;
  inset: 6px;
  border-radius: 4px;
  border: 1px solid rgba(180,140,255,0.3);
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(120,80,200,0.15) 4px,
    rgba(120,80,200,0.15) 8px
  );
}

.deck-count {
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #ffc857;
  margin-top: 136px;
  text-shadow: 1px 1px 0 #000;
}
</style>
