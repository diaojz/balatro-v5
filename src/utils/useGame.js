import { reactive, computed } from 'vue'
import { createDeck, shuffle } from './deck.js'
import { identifyHand, calcScore } from './poker.js'
import { BLINDS, calcReward } from '../config/blinds.js'
import { JOKER_POOL } from '../config/jokers.js'

const HAND_SIZE = 8
const MAX_HANDS = 4
const MAX_DISCARDS = 3
const MAX_JOKER_SLOTS = 5
const MAX_SELECT = 5

function freshDeck() {
  return shuffle(createDeck())
}

// 从 JOKER_POOL 随机抽 3 张不重复（商店每次进入重新抽）
function drawShopJokers(owned) {
  const ownedIds = new Set(owned.map(j => j.id))
  const pool = JOKER_POOL.filter(j => !ownedIds.has(j.id))
  const picked = shuffle([...pool]).slice(0, 3)
  return picked.map(j => ({ ...j, sold: false }))
}

export function useGame() {
  const state = reactive({
    // 状态机: 'playing' | 'shop' | 'won' | 'lost'
    phase: 'playing',

    // 盲注进度
    blindIndex: 0,    // 0=小盲注 1=中盲注 2=大盲注

    // 当前关数据
    roundScore: 0,
    handsLeft: MAX_HANDS,
    discardsLeft: MAX_DISCARDS,

    // 牌组
    deck: freshDeck(),
    hand: [],
    playedCards: [],
    selectedIds: new Set(),

    // Joker
    ownedJokers: [],
    triggeredJokerIds: new Set(),

    // 商店
    shopJokers: [],
    coins: 0,

    // 当前识别的牌型（用于出牌区顶部浮字）
    currentHandType: null,

    // Joker 触发动画 id 集合
    animatingJokerIds: new Set(),
  })

  // ——— computed ———

  const currentBlind = computed(() => BLINDS[state.blindIndex])

  const selectedCards = computed(() =>
    state.hand.filter(c => state.selectedIds.has(c.id))
  )

  const selectedCount = computed(() => state.selectedIds.size)

  // HAND 计分块（PRD §4.2）：
  // - 未选牌时：name=null chips=0 mult=0
  // - 选牌预览时：name=牌型名 chips=0 mult=0（不预估）
  // - 出牌后：name=牌型名 chips/mult=最终值
  const handDisplay = computed(() => {
    if (!state.currentHandType) {
      return { name: null, chips: 0, mult: 0 }
    }
    if (state.playedCards.length === 0) {
      // 选牌预览阶段：只显示牌型名，chips/mult 保持 0
      return { name: state.currentHandType.name, chips: 0, mult: 0 }
    }
    return {
      name: state.currentHandType.name,
      chips: state.currentHandType.chips,
      mult: state.currentHandType.mult,
    }
  })

  // 出牌按钮文案 / 禁用 —— 出牌 (X) X=选中数
  const canPlay = computed(() => selectedCount.value > 0 && state.phase === 'playing')

  // 弃牌按钮文案 / 禁用 —— 弃牌 (X) X=剩余弃牌数（PRD §6）
  const canDiscard = computed(() =>
    selectedCount.value > 0 && state.discardsLeft > 0 && state.phase === 'playing'
  )

  // ——— 操作 ———

  function initRound() {
    state.roundScore = 0
    state.handsLeft = MAX_HANDS
    state.discardsLeft = MAX_DISCARDS
    state.deck = freshDeck()
    state.hand = []
    state.playedCards = []
    state.selectedIds = new Set()
    state.currentHandType = null
    state.triggeredJokerIds = new Set()
    // 发 8 张手牌（v1：直接 push，不做飞牌动画）
    dealToHand()
  }

  function dealToHand() {
    while (state.hand.length < HAND_SIZE && state.deck.length > 0) {
      state.hand.push(state.deck.pop())
    }
  }

  function toggleSelect(cardId) {
    if (state.phase !== 'playing') return
    if (state.selectedIds.has(cardId)) {
      state.selectedIds.delete(cardId)
    } else {
      if (state.selectedIds.size >= MAX_SELECT) return
      state.selectedIds.add(cardId)
    }
    // 更新当前牌型预览
    const sel = state.hand.filter(c => state.selectedIds.has(c.id))
    state.currentHandType = sel.length > 0 ? identifyHand(sel) : null
    // 重建 Set 触发响应式
    state.selectedIds = new Set(state.selectedIds)
  }

  function playCards() {
    if (!canPlay.value) return
    const cards = state.hand.filter(c => state.selectedIds.has(c.id))

    // 把选中牌移到出牌区（v1：直接换）
    state.playedCards = cards
    state.hand = state.hand.filter(c => !state.selectedIds.has(c.id))
    state.selectedIds = new Set()

    // 计分
    const { score, chips, mult, handType } = calcScore(cards, state.ownedJokers)
    state.currentHandType = { ...handType, chips, mult }
    state.roundScore += score
    state.handsLeft--

    // Joker 触发高亮（v1：标记触发过的 Joker）
    highlightTriggeredJokers(cards, handType?.name)

    // 补牌（v1：直接 push）
    dealToHand()

    // 判定通关 / 失败
    if (state.roundScore >= currentBlind.value.target) {
      const reward = calcReward(state.handsLeft)
      state.coins += reward
      enterShop()
    } else if (state.handsLeft === 0) {
      state.phase = 'lost'
    }
  }

  function discardCards() {
    if (!canDiscard.value) return
    state.hand = state.hand.filter(c => !state.selectedIds.has(c.id))
    state.selectedIds = new Set()
    state.discardsLeft--
    state.currentHandType = null
    dealToHand()
  }

  function sortByRank() {
    const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
    state.hand = [...state.hand].sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))
  }

  function sortBySuit() {
    const suitOrder = ['♠', '♥', '♦', '♣']
    state.hand = [...state.hand].sort((a, b) => suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit))
  }

  function enterShop() {
    state.playedCards = []
    state.currentHandType = null
    state.shopJokers = drawShopJokers(state.ownedJokers)
    state.phase = 'shop'
  }

  function buyJoker(joker) {
    if (joker.sold) return
    if (state.coins < joker.price) return
    if (state.ownedJokers.length >= MAX_JOKER_SLOTS) return
    state.coins -= joker.price
    state.ownedJokers.push(joker)
    joker.sold = true
  }

  function leaveShop() {
    state.blindIndex++
    if (state.blindIndex >= BLINDS.length) {
      state.phase = 'won'
    } else {
      initRound()
      state.phase = 'playing'
    }
  }

  function restart() {
    state.blindIndex = 0
    state.coins = 0
    state.ownedJokers = []
    state.phase = 'playing'
    initRound()
  }

  // 标记哪些 Joker 被触发（用于高亮动画）
  function highlightTriggeredJokers(cards, handTypeName) {
    const triggered = new Set()
    for (const joker of state.ownedJokers) {
      // 简单判断：effect 前后 mult/chips 有变化则视为触发
      const before = { chips: 0, mult: 1 }
      const after = joker.effect(before, cards, handTypeName)
      if (after.chips !== before.chips || after.mult !== before.mult) {
        triggered.add(joker.id)
      }
    }
    state.triggeredJokerIds = triggered

    // 800ms 后清除高亮
    setTimeout(() => {
      state.triggeredJokerIds = new Set()
    }, 800)
  }

  // 初始化第一局
  initRound()

  return {
    state,
    currentBlind,
    selectedCards,
    selectedCount,
    handDisplay,
    canPlay,
    canDiscard,
    BLINDS,
    MAX_JOKER_SLOTS,
    toggleSelect,
    playCards,
    discardCards,
    sortByRank,
    sortBySuit,
    buyJoker,
    leaveShop,
    restart,
  }
}
