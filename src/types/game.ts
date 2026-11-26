import type { CustomerOrder } from '../../shared/contracts.ts'

export type RewardKind = 'level' | 'master'
export type RewardChoice = 'health' | 'mana' | 'trade' | 'discount'

export interface GameState {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  gold: number
  level: number
  experience: number
  experienceToNext: number
  masterRank: number
  saleBonusPercent: number
  marketDiscountPercent: number
  ingredients: Record<string, number>
  potions: Record<string, number>
  discoveredRecipeIds: string[]
  customerOrders: CustomerOrder[]
  cauldronSlots: string[]
  pendingRewards: RewardKind[]
}

export interface Notice {
  kind: 'success' | 'warning' | 'error' | 'info'
  message: string
}
