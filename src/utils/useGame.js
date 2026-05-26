/**
 * 游戏核心状态机
 * PRD M4 状态机：playing → shop → won / lost
 */
import { ref, computed } from 'vue'
import { createDeck } from './deck.js'
import { identifyHand, cardValue } from './poker.js'
import { JOKER_POOL } from '../config/jokers.js'
import { BLINDS, calcReward } from '../config/blinds.js'

export function useGame() {
  // ─── 状态机 ───
  const gameState = ref('playing') // playing | shop | won | lost

  // ─── 资源 ───
  const gold = ref(0)
  const ownedJokers = ref([])  // 持有的 Joker 对象
  const currentBlindIdx = ref(0)

  // ─── 本关状态 ───
  const deck = ref([])
  const hand = ref([])        // 8张手牌
  const selectedIds = ref([]) // 选中牌的 id 集合
  const playedCards = ref([]) // 出牌区（动画用）
  const handsLeft = ref(4)
  const discardsLeft = ref(3)
  const blindScore = ref(0)   // 本关累计分

  // ─── 动画状态 ───
  const isAnimating = ref(false)
  const battleChips = ref(0)
  const battleMult = ref(0)
  const currentHandType = ref(null)  // {name, chips, mult}
  const triggeredJokerIds = ref([])
  const showFinalFormula = ref(false)
  const finalChips = ref(0)
  const finalMult = ref(0)
  const finalScore = ref(0)
  const floatTexts = ref([])   // [{id, text, x, y, type}]
  const highlightedCardIds = ref([])

  // ─── 商店状态 ───
  const shopItems = ref([])    // 随机抽取的 3 张 Joker
  const soldIds = ref([])      // 已购 Joker id

  // ─── 派生计算 ───
  const currentBlind = computed(() => BLINDS[currentBlindIdx.value])
  const selectedCards = computed(() =>
    hand.value.filter(c => selectedIds.value.includes(c.id))
  )
  const previewHand = computed(() => {
    if (selectedIds.value.length === 0) return null
    return identifyHand(selectedCards.value)
  })
  const jokerCount = computed(() => ownedJokers.value.length)

  // 浮字工具暂未接入，删除占位声明（v5 第 1 轮未实现飞字动画，第 3 轮再加）

  // ─── 初始化 / 重新开始 ───
  function initGame() {
    gameState.value = 'playing'
    gold.value = 0
    ownedJokers.value = []
    currentBlindIdx.value = 0
    soldIds.value = []
    startBlind()
  }

  function startBlind() {
    deck.value = createDeck()
    hand.value = []
    selectedIds.value = []
    playedCards.value = []
    handsLeft.value = 4
    discardsLeft.value = 3
    blindScore.value = 0
    battleChips.value = 0
    battleMult.value = 0
    currentHandType.value = null
    triggeredJokerIds.value = []
    showFinalFormula.value = false
    isAnimating.value = false
    highlightedCardIds.value = []
    // 发 8 张牌（动画由组件处理）
    dealCards(8)
  }

  function dealCards(count) {
    const newCards = []
    for (let i = 0; i < count && deck.value.length > 0; i++) {
      newCards.push(deck.value.shift())
    }
    hand.value.push(...newCards)
    return newCards
  }

  // ─── 选牌 ───
  function toggleSelect(cardId) {
    if (isAnimating.value) return
    if (selectedIds.value.includes(cardId)) {
      selectedIds.value = selectedIds.value.filter(id => id !== cardId)
    } else {
      if (selectedIds.value.length >= 5) return // 最多 5 张
      selectedIds.value = [...selectedIds.value, cardId]
    }
  }

  // ─── 排序 ───
  function sortByRank() {
    const ORDER = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
    hand.value = [...hand.value].sort((a, b) => ORDER.indexOf(a.rank) - ORDER.indexOf(b.rank))
  }

  function sortBySuit() {
    const SUIT_ORDER = ['♠','♥','♦','♣']
    hand.value = [...hand.value].sort((a, b) => SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit))
  }

  // ─── 弃牌 ───
  function discardCards() {
    if (isAnimating.value) return
    if (selectedIds.value.length === 0) return
    if (discardsLeft.value <= 0) return

    const discardedIds = [...selectedIds.value]
    hand.value = hand.value.filter(c => !discardedIds.includes(c.id))
    selectedIds.value = []
    discardsLeft.value--
    // 补牌
    dealCards(discardedIds.length)
  }

  // ─── 出牌（核心动画流程）───
  async function playCards(_deckRef) {
    if (isAnimating.value) return
    if (selectedIds.value.length === 0) return
    if (handsLeft.value <= 0) return

    isAnimating.value = true

    const played = selectedCards.value
    const handType = identifyHand(played)

    // 把打出的牌移到 playedCards，从 hand 移除
    playedCards.value = played.map(c => ({ ...c }))
    hand.value = hand.value.filter(c => !selectedIds.value.includes(c.id))
    selectedIds.value = []

    // 步骤 1: 等待"飞牌"动画（由组件的 CSS transition 处理）350ms
    await sleep(400)

    // 步骤 2: 显示牌型名 + 设置初始 chips/mult（350-550ms）
    currentHandType.value = handType
    battleChips.value = handType.chips
    battleMult.value = handType.mult
    await sleep(200)

    // 步骤 3: 逐张高亮 + chips 累加（每张 150ms）
    for (const card of played) {
      highlightedCardIds.value = [...highlightedCardIds.value, card.id]
      const val = cardValue(card.rank)
      battleChips.value += val
      // 飞字（由调用方的 ref 获取位置）
      await sleep(150)
    }

    await sleep(100)

    // 步骤 4: 按 ownedJokers 顺序触发
    let chips = battleChips.value
    let mult = battleMult.value

    for (const joker of ownedJokers.value) {
      const prev = { chips, mult }
      const result = joker.effect(played, chips, mult, handType.name)
      chips = result.chips
      mult = result.mult

      if (chips !== prev.chips || mult !== prev.mult) {
        triggeredJokerIds.value = [joker.id]
        battleChips.value = chips
        battleMult.value = mult
        await sleep(300)
        triggeredJokerIds.value = []
      }
    }

    battleChips.value = chips
    battleMult.value = mult

    // 步骤 5: 最终公式爆出（+180ms）
    await sleep(180)
    finalChips.value = chips
    finalMult.value = mult
    finalScore.value = chips * mult
    showFinalFormula.value = true

    // 步骤 6: blindScore 累加（+560ms，公式展示 1.5s 后关闭）
    await sleep(560)
    blindScore.value += finalScore.value
    showFinalFormula.value = false
    await sleep(200)

    // 步骤 7: 清空出牌区 + 补牌
    highlightedCardIds.value = []
    playedCards.value = []
    handsLeft.value--
    currentHandType.value = null

    // 补牌
    const needed = 8 - hand.value.length
    if (needed > 0) {
      dealCards(needed)
    }

    await sleep(100)
    isAnimating.value = false

    // 步骤 8: 判定
    if (blindScore.value >= currentBlind.value.target) {
      await sleep(300)
      enterShop()
    } else if (handsLeft.value <= 0) {
      gameState.value = 'lost'
    }
  }

  function enterShop() {
    const reward = calcReward(handsLeft.value)
    gold.value += reward
    // 随机抽 3 张不重复的 Joker
    const pool = [...JOKER_POOL]
    const picks = []
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      picks.push(pool.splice(idx, 1)[0])
    }
    shopItems.value = picks
    soldIds.value = []
    gameState.value = 'shop'
  }

  function buyJoker(joker) {
    if (gold.value < joker.price) return
    if (ownedJokers.value.length >= 5) return
    if (soldIds.value.includes(joker.id)) return
    gold.value -= joker.price
    ownedJokers.value = [...ownedJokers.value, joker]
    soldIds.value = [...soldIds.value, joker.id]
  }

  function skipShop() {
    if (currentBlindIdx.value >= 2) {
      gameState.value = 'won'
    } else {
      currentBlindIdx.value++
      startBlind()
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  return {
    // 状态
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
    // 动作
    initGame,
    toggleSelect,
    playCards,
    discardCards,
    sortByRank,
    sortBySuit,
    buyJoker,
    skipShop,
    dealCards,
  }
}
