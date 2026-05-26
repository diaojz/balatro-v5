// 牌型识别 + 计分 —— 数值锁定来自 PRD §1.1 / §1.2
// 按基础筹码降序排列
const HAND_TYPES = [
  {
    name: '同花顺',
    chips: 100,
    mult: 8,
    test: (cards) => isStraight(cards) && isFlush(cards),
  },
  {
    name: '四条',
    chips: 60,
    mult: 7,
    test: (cards) => hasNOfKind(cards, 4),
  },
  {
    name: '葫芦',
    chips: 40,
    mult: 4,
    test: (cards) => hasNOfKind(cards, 3) && hasNOfKind(cards, 2),
  },
  {
    name: '同花',
    chips: 35,
    mult: 4,
    test: (cards) => isFlush(cards),
  },
  {
    name: '顺子',
    chips: 30,
    mult: 4,
    test: (cards) => isStraight(cards),
  },
  {
    name: '三条',
    chips: 30,
    mult: 3,
    test: (cards) => hasNOfKind(cards, 3),
  },
  {
    name: '两对',
    chips: 20,
    mult: 2,
    test: (cards) => countPairs(cards) >= 2,
  },
  {
    name: '对子',
    chips: 10,
    mult: 2,
    test: (cards) => countPairs(cards) >= 1,
  },
  {
    name: '高牌',
    chips: 5,
    mult: 1,
    test: () => true,
  },
]

// 识别手型，返回 { name, chips, mult }
export function identifyHand(cards) {
  if (!cards || cards.length === 0) return null
  for (const ht of HAND_TYPES) {
    if (ht.test(cards)) {
      return { name: ht.name, chips: ht.chips, mult: ht.mult }
    }
  }
  return { name: '高牌', chips: 5, mult: 1 }
}

// 计算最终得分（调用 Joker effect 链）
// jokers: 持有 Joker 数组
// 返回 { score, chips, mult, handType }
export function calcScore(playedCards, jokers) {
  const handType = identifyHand(playedCards)
  if (!handType) return { score: 0, chips: 0, mult: 0, handType: null }

  const cardPointSum = playedCards.reduce((sum, c) => sum + c.value, 0)
  let chips = handType.chips + cardPointSum
  let mult = handType.mult

  // 按 Joker 顺序依次触发
  for (const joker of jokers) {
    const result = joker.effect({ chips, mult }, playedCards, handType.name)
    chips = result.chips
    mult = result.mult
  }

  return { score: chips * mult, chips, mult, handType }
}

// ——— 内部辅助函数 ———

function rankOrder(rank) {
  return ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].indexOf(rank)
}

function isFlush(cards) {
  if (cards.length < 5) return false
  return cards.every(c => c.suit === cards[0].suit)
}

function isStraight(cards) {
  if (cards.length < 5) return false
  // 把牌排成数字顺序（A 可作高也可作低）
  const vals = cards.map(c => {
    const v = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'].indexOf(c.rank)
    return v
  }).sort((a, b) => a - b)

  // 普通连续
  const isNormal = vals.every((v, i) => i === 0 || v === vals[i-1] + 1)
  if (isNormal) return true

  // A-2-3-4-5（A 作低）
  const isLowAce =
    JSON.stringify(vals) === JSON.stringify([0, 1, 2, 3, 12]) // 2,3,4,5,A
  return isLowAce
}

function rankCounts(cards) {
  const counts = {}
  for (const c of cards) {
    counts[c.rank] = (counts[c.rank] || 0) + 1
  }
  return Object.values(counts)
}

function hasNOfKind(cards, n) {
  return rankCounts(cards).some(c => c >= n)
}

function countPairs(cards) {
  return rankCounts(cards).filter(c => c >= 2).length
}
