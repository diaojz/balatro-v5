/**
 * 3 关盲注配置（PRD §3.1 锁定）
 */
export const BLINDS = [
  { id: 0, name: '小盲注', target: 300, icon: '🔵', reward: 5 },
  { id: 1, name: '中盲注', target: 500, icon: '🟡', reward: 5 },
  { id: 2, name: '大盲注', target: 800, icon: '🔴', reward: 5 }
]

// 通关奖励公式：$5 + 剩余手数 × $1（PRD §3.2）
export function calcReward(handsLeft) {
  return 5 + handsLeft
}
