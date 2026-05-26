// 6 张 Joker 候选库 —— 数值锁定来自 PRD §2.1
// effect 函数签名：({ chips, mult }, playedCards) => { chips, mult }
export const JOKER_POOL = [
  {
    id: 'jester',
    name: '小丑',
    rarity: 'common',      // 普通 #6cb4d3
    price: 3,
    art: '🃏',
    description: '每手 +4 倍率（无条件加成）',
    effect: ({ chips, mult }, _cards) => ({ chips, mult: mult + 4 }),
  },
  {
    id: 'scholar',
    name: '学者',
    rarity: 'common',
    price: 3,
    art: '📖',
    description: '打出的牌每张 A：+4 倍率',
    effect: ({ chips, mult }, cards) => {
      const aces = cards.filter(c => c.rank === 'A').length
      return { chips, mult: mult + aces * 4 }
    },
  },
  {
    id: 'heart_collector',
    name: '红心收藏家',
    rarity: 'rare',        // 稀有 #e34b6f
    price: 5,
    art: '❤️',
    description: '打出的牌里含 ♥ 时，倍率 ×4',
    effect: ({ chips, mult }, cards) => {
      const hasHeart = cards.some(c => c.suit === '♥')
      return { chips, mult: hasHeart ? mult * 4 : mult }
    },
  },
  {
    id: 'club_lover',
    name: '梅花爱好者',
    rarity: 'rare',
    price: 5,
    art: '♣',
    description: '打出的牌里含 ♣ 时，倍率 ×4',
    effect: ({ chips, mult }, cards) => {
      const hasClub = cards.some(c => c.suit === '♣')
      return { chips, mult: hasClub ? mult * 4 : mult }
    },
  },
  {
    id: 'royal_head',
    name: '皇家头牌',
    rarity: 'rare',
    price: 5,
    art: '👑',
    description: '打出的牌里含 J / Q / K 时，倍率 ×10',
    effect: ({ chips, mult }, cards) => {
      const hasFace = cards.some(c => ['J', 'Q', 'K'].includes(c.rank))
      return { chips, mult: hasFace ? mult * 10 : mult }
    },
  },
  {
    id: 'straight_flush_master',
    name: '同花顺大师',
    rarity: 'legendary', // 传说 #b577ff
    price: 8,
    art: '🔥',
    description: '打出同花顺时 +50 倍率',
    // handType 通过 context 传入，这里用第二参数 cards 数量无法判断
    // 改为接受第三参数 handTypeName
    effect: ({ chips, mult }, _cards, handTypeName) => ({
      chips,
      mult: handTypeName === '同花顺' ? mult + 50 : mult,
    }),
  },
]

// 稀有度颜色（四角内描边）
export const RARITY_COLOR = {
  common: '#6cb4d3',
  uncommon: '#5bc97a',
  rare: '#e34b6f',
  legendary: '#b577ff',
}
