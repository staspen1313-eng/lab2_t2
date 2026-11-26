import { randomUUID } from 'node:crypto'
import type {
  BrewResponse,
  CatalogResponse,
  CustomerOrder,
  SaleResponse,
} from '../../../shared/contracts.ts'
import { CatalogRepository } from '../repositories/catalogRepository.ts'

export class GameError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'GameError'
    this.statusCode = statusCode
  }
}

const customerNames = [
  'Марта',
  'Остап',
  'Леся',
  'Тарас',
  'Соломія',
  'Мирон',
  'Ярина',
]

export class GameService {
  private readonly catalogRepository: CatalogRepository
  private readonly random: () => number

  constructor(
    catalogRepository = new CatalogRepository(),
    random: () => number = Math.random,
  ) {
    this.catalogRepository = catalogRepository
    this.random = random
  }

  getCatalog(): CatalogResponse {
    return this.catalogRepository.getCatalog()
  }

  brew(ingredientIds: [string, string]): BrewResponse {
    const [first, second] = ingredientIds

    if (
      !this.catalogRepository.findIngredient(first) ||
      !this.catalogRepository.findIngredient(second)
    ) {
      throw new GameError('Один із вибраних інгредієнтів не знайдено.')
    }

    const recipe = this.catalogRepository.findRecipe(ingredientIds)

    if (recipe) {
      return {
        outcome: 'success',
        recipeId: recipe.id,
        potion: recipe.potion,
        message: `Відкрито рецепт: ${recipe.potion.name}.`,
      }
    }

    const critical = this.random() < 0.15
    const minimumDamage = critical ? 45 : 10
    const maximumDamage = critical ? 90 : 30
    const damage =
      minimumDamage +
      Math.floor(this.random() * (maximumDamage - minimumDamage + 1))

    return {
      outcome: 'explosion',
      damage,
      critical,
      message: critical
        ? 'Казан вибухнув із неймовірною силою!'
        : 'Невдалий дослід — суміш вибухнула.',
    }
  }

  createOrders(
    count: number,
    excludedPotionIds: string[] = [],
  ): CustomerOrder[] {
    const potions = this.catalogRepository.getPotionList()
    const availablePotions = potions.filter(
      (potion) => !excludedPotionIds.includes(potion.id),
    )
    const potionPool = this.shuffle(
      availablePotions.length > 0 ? availablePotions : potions,
    )

    return Array.from({ length: count }, (_, index) => {
      const customerName =
        customerNames[this.pickIndex(customerNames.length)]
      const potion = potionPool[index % potionPool.length]

      return {
        id: randomUUID(),
        customerName,
        requestedPotionId: potion.id,
        tip: 2 + this.pickIndex(11),
      }
    })
  }

  sell(
    potionId: string,
    requestedPotionId: string,
    tradeBonusPercent: number,
    tip: number,
  ): SaleResponse {
    const potion = this.catalogRepository.findPotion(potionId)

    if (!potion) {
      throw new GameError('Такого зілля немає у каталозі.')
    }

    if (potionId !== requestedPotionId) {
      throw new GameError('Клієнт замовив інше зілля.')
    }

    if (
      !Number.isInteger(tradeBonusPercent) ||
      tradeBonusPercent < 0 ||
      tradeBonusPercent > 100 ||
      !Number.isInteger(tip) ||
      tip < 0
    ) {
      throw new GameError('Некоректні параметри продажу.')
    }

    return {
      goldEarned:
        Math.round(potion.salePrice * (1 + tradeBonusPercent / 100)) + tip,
      experienceEarned: 20,
    }
  }

  private shuffle<T>(values: T[]): T[] {
    const shuffled = [...values]

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = this.pickIndex(index + 1)
      const currentValue = shuffled[index]
      shuffled[index] = shuffled[swapIndex]
      shuffled[swapIndex] = currentValue
    }

    return shuffled
  }

  private pickIndex(length: number): number {
    return Math.min(length - 1, Math.floor(this.random() * length))
  }
}
