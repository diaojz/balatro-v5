// 3 关盲注 —— 数值锁定来自 PRD §3.1 / §3.2
export const BLINDS = [
  { id: 'small', name: '小盲注', target: 300, icon: '🔵', reward: 5 },
  { id: 'mid',   name: '中盲注', target: 500, icon: '🟡', reward: 5 },
  { id: 'big',   name: '大盲注', target: 800, icon: '🔴', reward: 5 },
]

// 通关奖励 = $5 + 剩余手数 × $1（PRD §3.2）
export function calcReward(handsLeft) {
  return 5 + handsLeft
}
