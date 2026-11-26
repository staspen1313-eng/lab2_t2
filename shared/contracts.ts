export interface Ingredient {
  id: string
  name: string
  emoji: string
  description: string
  price: number
}

export type PotionEffectType = 'health' | 'mana' | 'none'

export interface Potion {
  id: string
  name: string
  emoji: string
  description: string
  salePrice: number
  effect: {
    type: PotionEffectType
    amount: number
  }
}

export interface Recipe {
  id: string
  ingredientIds: [string, string]
  potion: Potion
}

export interface CatalogResponse {
  ingredients: Ingredient[]
  recipes: Recipe[]
}

export interface CustomerOrder {
  id: string
  customerName: string
  requestedPotionId: string
  tip: number
}

export type BrewResponse =
  | {
      outcome: 'success'
      recipeId: string
      potion: Potion
      message: string
    }
  | {
      outcome: 'explosion'
      damage: number
      critical: boolean
      message: string
    }

export interface SaleResponse {
  goldEarned: number
  experienceEarned: number
}
