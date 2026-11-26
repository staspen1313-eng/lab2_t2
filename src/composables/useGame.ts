import { computed, reactive, ref, watch } from 'vue'
import type {
  BrewResponse,
  CatalogResponse,
  CustomerOrder,
  Ingredient,
  Potion,
} from '../../shared/contracts.ts'
import { gameApi } from '../api/gameApi.ts'
import type {
  GameState,
  Notice,
  RewardChoice,
  RewardKind,
} from '../types/game.ts'
import {
  createInitialGameState,
  restoreGameState,
  saveGameState,
} from '../storage/gameStorage.ts'

const brewManaCost = 15

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Сталася невідома помилка. Спробуйте ще раз.'
}

function experienceNeeded(level: number): number {
  return 100 + Math.max(0, level - 1) * 40
}

export function useGame() {
  const state = reactive<GameState>(createInitialGameState())
  const catalog = ref<CatalogResponse | null>(null)
  const loading = ref(true)
  const brewing = ref(false)
  const selling = ref(false)
  const apiError = ref<string | null>(null)
  const storageError = ref<string | null>(null)
  const notice = ref<Notice | null>(null)

  const potionList = computed(
    () => catalog.value?.recipes.map((recipe) => recipe.potion) ?? [],
  )
  const pendingReward = computed<RewardKind | null>(
    () => state.pendingRewards[0] ?? null,
  )
  const canBrew = computed(
    () => state.cauldronSlots.length === 2 && state.mp >= brewManaCost,
  )
  const experiencePercent = computed(() =>
    Math.min(
      100,
      Math.round((state.experience / state.experienceToNext) * 100),
    ),
  )

  watch(
    state,
    () => {
      try {
        saveGameState(state)
        storageError.value = null
      } catch (error) {
        const reason = errorMessage(error)
        storageError.value = `Не вдалося зберегти гру в цьому браузері: ${reason}`
        console.error('Game save failed:', error)
      }
    },
    { deep: true },
  )

  function showNotice(kind: Notice['kind'], message: string): void {
    notice.value = { kind, message }
  }

  function addExperience(amount: number): void {
    state.experience += amount

    while (state.experience >= state.experienceToNext) {
      state.experience -= state.experienceToNext
      state.level += 1
      state.experienceToNext = experienceNeeded(state.level)

      if (state.level % 5 === 0) {
        state.masterRank += 1
        state.pendingRewards.push('master')
      } else {
        state.pendingRewards.push('level')
      }
    }
  }

  function reduceCount(items: Record<string, number>, id: string): void {
    const nextCount = (items[id] ?? 0) - 1
    if (nextCount > 0) {
      items[id] = nextCount
    } else {
      delete items[id]
    }
  }

  function handleExplosion(result: Extract<BrewResponse, { outcome: 'explosion' }>): void {
    state.hp = Math.max(0, state.hp - result.damage)

    if (state.hp === 0) {
      state.level = 1
      state.experience = 0
      state.experienceToNext = experienceNeeded(1)
      state.maxHp = 100
      state.maxMp = 100
      state.hp = 100
      state.mp = 100
      state.masterRank = 0
      state.saleBonusPercent = 0
      state.marketDiscountPercent = 0
      state.pendingRewards = []
      showNotice(
        'error',
        'Алхімік загинув у вибуху. Рівень і ранги майстра скинуто; золото, речі та відкриті рецепти збережено.',
      )
      return
    }

    showNotice(
      result.critical ? 'error' : 'warning',
      `${result.message} Втрата здоров’я: ${result.damage}.`,
    )
  }

  async function initialize(): Promise<void> {
    loading.value = true
    apiError.value = null

    const restored = restoreGameState()
    Object.assign(state, restored.state)

    if (restored.warning) {
      showNotice('warning', restored.warning)
    }

    try {
      catalog.value = await gameApi.getCatalog()

      if (state.customerOrders.length === 0) {
        state.customerOrders = await gameApi.getOrders(3)
      } else {
        const hasDuplicatePotions =
          new Set(
            state.customerOrders.map((order) => order.requestedPotionId),
          ).size < state.customerOrders.length

        if (
          hasDuplicatePotions &&
          state.customerOrders.length <= catalog.value.recipes.length
        ) {
          state.customerOrders = await gameApi.getOrders(
            state.customerOrders.length,
          )
        }
      }
    } catch (error) {
      apiError.value = errorMessage(error)
    } finally {
      loading.value = false
    }
  }

  function buyIngredient(ingredient: Ingredient): void {
    const price = Math.max(
      1,
      Math.ceil(
        ingredient.price * (1 - state.marketDiscountPercent / 100),
      ),
    )

    if (state.gold < price) {
      showNotice('warning', `Потрібно ще ${price - state.gold} золотих монет.`)
      return
    }

    state.gold -= price
    state.ingredients[ingredient.id] =
      (state.ingredients[ingredient.id] ?? 0) + 1
    showNotice('success', `Придбано: ${ingredient.name}.`)
  }

  function selectIngredient(ingredientId: string): void {
    if (state.cauldronSlots.length === 2) {
      showNotice('info', 'У казані вже зайняті обидва слоти.')
      return
    }

    const selectedCount = state.cauldronSlots.filter(
      (id) => id === ingredientId,
    ).length

    if ((state.ingredients[ingredientId] ?? 0) <= selectedCount) {
      showNotice('warning', 'Цього інгредієнта немає в коморі.')
      return
    }

    state.cauldronSlots.push(ingredientId)
  }

  function returnIngredient(slotIndex: number): void {
    state.cauldronSlots.splice(slotIndex, 1)
  }

  async function brew(): Promise<void> {
    if (!canBrew.value || brewing.value) return

    const ingredients = [...state.cauldronSlots] as [string, string]
    brewing.value = true
    apiError.value = null

    try {
      const result = await gameApi.brew(ingredients)
      state.mp = Math.max(0, state.mp - brewManaCost)
      state.cauldronSlots = []
      ingredients.forEach((ingredientId) =>
        reduceCount(state.ingredients, ingredientId),
      )

      if (result.outcome === 'success') {
        state.potions[result.potion.id] =
          (state.potions[result.potion.id] ?? 0) + 1

        if (!state.discoveredRecipeIds.includes(result.recipeId)) {
          state.discoveredRecipeIds.push(result.recipeId)
        }

        addExperience(12)
        showNotice('success', `${result.message} +12 досвіду.`)
      } else {
        handleExplosion(result)
      }
    } catch (error) {
      apiError.value = errorMessage(error)
    } finally {
      brewing.value = false
    }
  }

  async function fulfillOrder(order: CustomerOrder): Promise<void> {
    if (selling.value) return

    const potionCount = state.potions[order.requestedPotionId] ?? 0
    if (potionCount < 1) {
      showNotice('warning', 'У вітрині ще немає потрібного зілля.')
      return
    }

    selling.value = true
    apiError.value = null

    try {
      const sale = await gameApi.sell({
        potionId: order.requestedPotionId,
        requestedPotionId: order.requestedPotionId,
        tradeBonusPercent: state.saleBonusPercent,
        tip: order.tip,
      })

      reduceCount(state.potions, order.requestedPotionId)
      state.gold += sale.goldEarned
      state.customerOrders = state.customerOrders.filter(
        (queuedOrder) => queuedOrder.id !== order.id,
      )
      addExperience(sale.experienceEarned)
      showNotice(
        'success',
        `Продано! +${sale.goldEarned} золота та +${sale.experienceEarned} досвіду.`,
      )

      try {
        state.customerOrders.push(
          ...(await gameApi.getOrders(
            1,
            state.customerOrders.map((queuedOrder) => queuedOrder.requestedPotionId),
          )),
        )
      } catch (error) {
        apiError.value = `Продаж збережено, але нового клієнта не завантажено: ${errorMessage(error)}`
      }
    } catch (error) {
      apiError.value = errorMessage(error)
    } finally {
      selling.value = false
    }
  }

  function usePotion(potion: Potion): void {
    const count = state.potions[potion.id] ?? 0

    if (count < 1 || potion.effect.type === 'none') return

    if (
      (potion.effect.type === 'health' && state.hp >= state.maxHp) ||
      (potion.effect.type === 'mana' && state.mp >= state.maxMp)
    ) {
      showNotice('info', 'Відповідний показник уже на максимумі.')
      return
    }

    reduceCount(state.potions, potion.id)

    if (potion.effect.type === 'health') {
      state.hp = Math.min(state.maxHp, state.hp + potion.effect.amount)
      showNotice('success', `Здоров’я відновлено: ${state.hp}/${state.maxHp}.`)
    } else {
      state.mp = Math.min(state.maxMp, state.mp + potion.effect.amount)
      showNotice('success', `Ману відновлено: ${state.mp}/${state.maxMp}.`)
    }
  }

  function chooseReward(choice: RewardChoice): void {
    const reward = pendingReward.value
    if (!reward) return

    if (reward === 'level' && choice === 'health') {
      state.maxHp += 15
      state.hp = state.maxHp
    } else if (reward === 'level' && choice === 'mana') {
      state.maxMp += 15
      state.mp = state.maxMp
    } else if (reward === 'master' && choice === 'trade') {
      state.saleBonusPercent += 5
    } else if (reward === 'master' && choice === 'discount') {
      state.marketDiscountPercent += 5
    } else {
      return
    }

    state.pendingRewards.shift()
  }

  function dismissNotice(): void {
    notice.value = null
  }

  function clearApiError(): void {
    apiError.value = null
  }

  return {
    state,
    catalog,
    potionList,
    loading,
    brewing,
    selling,
    apiError,
    storageError,
    notice,
    pendingReward,
    canBrew,
    experiencePercent,
    initialize,
    buyIngredient,
    selectIngredient,
    returnIngredient,
    brew,
    fulfillOrder,
    usePotion,
    chooseReward,
    dismissNotice,
    clearApiError,
  }
}
