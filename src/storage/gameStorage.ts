import type { CustomerOrder } from '../../shared/contracts.ts'
import type { GameState, RewardKind } from '../types/game.ts'

const storageKey = 'alchemy-shop-save-v1'

export function createInitialGameState(): GameState {
  return {
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    gold: 50,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    masterRank: 0,
    saleBonusPercent: 0,
    marketDiscountPercent: 0,
    ingredients: {},
    potions: {},
    discoveredRecipeIds: [],
    customerOrders: [],
    cauldronSlots: [],
    pendingRewards: [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isCountMap(value: unknown): value is Record<string, number> {
  return (
    isRecord(value) &&
    Object.values(value).every((count) => isNonNegativeInteger(count))
  )
}

function isCustomerOrder(value: unknown): value is CustomerOrder {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.customerName === 'string' &&
    typeof value.requestedPotionId === 'string' &&
    isNonNegativeInteger(value.tip)
  )
}

function isRewardKind(value: unknown): value is RewardKind {
  return value === 'level' || value === 'master'
}

function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false

  const numericFields = [
    'hp',
    'maxHp',
    'mp',
    'maxMp',
    'gold',
    'level',
    'experience',
    'experienceToNext',
    'masterRank',
    'saleBonusPercent',
    'marketDiscountPercent',
  ] as const

  return (
    numericFields.every((field) => isNonNegativeInteger(value[field])) &&
    value.level !== 0 &&
    value.maxHp !== 0 &&
    value.maxMp !== 0 &&
    value.experienceToNext !== 0 &&
    isCountMap(value.ingredients) &&
    isCountMap(value.potions) &&
    Array.isArray(value.discoveredRecipeIds) &&
    value.discoveredRecipeIds.every((id) => typeof id === 'string') &&
    Array.isArray(value.customerOrders) &&
    value.customerOrders.every(isCustomerOrder) &&
    Array.isArray(value.cauldronSlots) &&
    value.cauldronSlots.length <= 2 &&
    value.cauldronSlots.every((id) => typeof id === 'string') &&
    Array.isArray(value.pendingRewards) &&
    value.pendingRewards.every(isRewardKind)
  )
}

export function restoreGameState(): {
  state: GameState
  warning: string | null
} {
  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return { state: createInitialGameState(), warning: null }

    const parsed: unknown = JSON.parse(saved)
    if (
      !isRecord(parsed) ||
      parsed.version !== 1 ||
      !isGameState(parsed.state)
    ) {
      throw new Error('Формат збереження не відповідає поточній версії гри.')
    }

    return { state: parsed.state, warning: null }
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'невідома помилка читання'

    return {
      state: createInitialGameState(),
      warning: `Не вдалося відновити збереження: ${reason}. Почато нову гру.`,
    }
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(storageKey, JSON.stringify({ version: 1, state }))
}
