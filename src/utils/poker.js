/**
 * 扑克牌型识别与计分
 * PRD §1.1 牌型表 + §1.2 计分公式
 * 数值全部锁定，不得修改
 */

// 点数映射（A=11, J/Q/K=10, 其他=数字本身）
export function cardValue(rank) {
  if (rank === 'A') return 11
  if (['J', 'Q', 'K'].includes(rank)) return 10
  return parseInt(rank)
}

// 点数排序索引（用于顺子识别）
const RANK_ORDER = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']

function rankIndex(rank) {
  return RANK_ORDER.indexOf(rank)
}

/**
 * 识别牌型
 * @param {Array} cards - 出牌数组 [{rank, suit}, ...]
 * @returns {{ name, chips, mult }}
 */
export function identifyHand(cards) {
  if (!cards || cards.length === 0) return null

  const ranks = cards.map(c => c.rank)
  const suits = cards.map(c => c.suit)
  const n = cards.length

  // 统计同点数
  const rankCount = {}
  ranks.forEach(r => { rankCount[r] = (rankCount[r] || 0) + 1 })
  const counts = Object.values(rankCount).sort((a, b) => b - a)

  // 同花判断（5张同花色）
  const isFlush = n >= 5 && suits.every(s => s === suits[0])

  // 顺子判断（5张连续点数）
  const isStraight = (() => {
    if (n < 5) return false
    const indices = [...new Set(ranks.map(rankIndex))].sort((a, b) => a - b)
    if (indices.length !== 5) return false
    // 普通顺子
    if (indices[4] - indices[0] === 4) return true
    // A-2-3-4-5（A当1用）
    if (indices.join(',') === '0,1,2,3,12') return true
    return false
  })()

  // 牌型识别（按优先级降序）
  if (isFlush && isStraight) return { name: '同花顺', chips: 100, mult: 8 }
  if (counts[0] === 4)        return { name: '四条',   chips: 60,  mult: 7 }
  if (counts[0] === 3 && counts[1] === 2) return { name: '葫芦', chips: 40, mult: 4 }
  if (isFlush)                return { name: '同花',   chips: 35,  mult: 4 }
  if (isStraight)             return { name: '顺子',   chips: 30,  mult: 4 }
  if (counts[0] === 3)        return { name: '三条',   chips: 30,  mult: 3 }
  if (counts[0] === 2 && counts[1] === 2) return { name: '两对', chips: 20, mult: 2 }
  if (counts[0] === 2)        return { name: '对子',   chips: 10,  mult: 2 }
  return { name: '高牌', chips: 5, mult: 1 }
}

/**
 * 计算基础得分（不含 Joker）
 * 得分 = (牌型基础筹码 + 所有出牌点数之和) × 牌型基础倍率
 */
export function calcBaseScore(cards, handType) {
  const chipsSum = cards.reduce((sum, c) => sum + cardValue(c.rank), 0)
  const chips = handType.chips + chipsSum
  const mult = handType.mult
  return { chips, mult }
}
