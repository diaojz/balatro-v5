/**
 * 6 张 Joker 候选库（PRD §2.1 锁定）
 * 字段：id, name, rarity, price, art, desc, effect(cards, chips, mult) => {chips, mult}
 */
export const JOKER_POOL = [
  {
    id: 'jester',
    name: '小丑',
    rarity: 'common',
    price: 3,
    art: '🃏',
    desc: '每手 +4 倍率（无条件加成）',
    effect(cards, chips, mult) {
      return { chips, mult: mult + 4 }
    }
  },
  {
    id: 'scholar',
    name: '学者',
    rarity: 'common',
    price: 3,
    art: '📖',
    desc: '打出的牌每张 A：+4 倍率',
    effect(cards, chips, mult) {
      const aceCount = cards.filter(c => c.rank === 'A').length
      return { chips, mult: mult + aceCount * 4 }
    }
  },
  {
    id: 'heart_collector',
    name: '红心收藏家',
    rarity: 'rare',
    price: 5,
    art: '❤️',
    desc: '打出的牌里含 ♥ 时，倍率 ×4',
    effect(cards, chips, mult) {
      const hasHeart = cards.some(c => c.suit === '♥')
      return { chips, mult: hasHeart ? mult * 4 : mult }
    }
  },
  {
    id: 'club_lover',
    name: '梅花爱好者',
    rarity: 'rare',
    price: 5,
    art: '♣',
    desc: '打出的牌里含 ♣ 时，倍率 ×4',
    effect(cards, chips, mult) {
      const hasClub = cards.some(c => c.suit === '♣')
      return { chips, mult: hasClub ? mult * 4 : mult }
    }
  },
  {
    id: 'royal_topper',
    name: '皇家头牌',
    rarity: 'rare',
    price: 5,
    art: '👑',
    desc: '打出的牌里含 J / Q / K 时，倍率 ×10',
    effect(cards, chips, mult) {
      const hasFace = cards.some(c => ['J', 'Q', 'K'].includes(c.rank))
      return { chips, mult: hasFace ? mult * 10 : mult }
    }
  },
  {
    id: 'straight_flush_master',
    name: '同花顺大师',
    rarity: 'legendary',
    price: 8,
    art: '🔥',
    desc: '打出同花顺时 +50 倍率',
    effect(cards, chips, mult, handTypeName) {
      return { chips, mult: handTypeName === '同花顺' ? mult + 50 : mult }
    }
  }
]
