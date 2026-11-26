import type { CatalogResponse, Potion } from '../../../shared/contracts.ts'

const catalog: CatalogResponse = {
  ingredients: [
    {
      id: 'red-mushroom',
      name: 'Червоний гриб',
      emoji: '🍄',
      description: 'Поширена основа для цілющих настоянок.',
      price: 5,
    },
    {
      id: 'moon-water',
      name: 'Місячна вода',
      emoji: '🌙',
      description: 'Чиста вода, зібрана під повним місяцем.',
      price: 8,
    },
    {
      id: 'silver-herb',
      name: 'Срібна трава',
      emoji: '🌿',
      description: 'Підсилює магічний резонанс суміші.',
      price: 10,
    },
    {
      id: 'ember-flower',
      name: 'Квітка жару',
      emoji: '🌺',
      description: 'Тепла на дотик і трохи примхлива в казані.',
      price: 12,
    },
    {
      id: 'cave-crystal',
      name: 'Печерний кристал',
      emoji: '💎',
      description: 'Міцний каталізатор для захисних еліксирів.',
      price: 18,
    },
    {
      id: 'dragon-scale',
      name: 'Луска дракона',
      emoji: '🐉',
      description: 'Рідкісний інгредієнт для потужних формул.',
      price: 24,
    },
  ],
  recipes: [
    {
      id: 'healing-draught',
      ingredientIds: ['red-mushroom', 'moon-water'],
      potion: {
        id: 'healing-draught',
        name: 'Зілля зцілення',
        emoji: '❤️‍🩹',
        description: 'Відновлює 35 одиниць здоров’я.',
        salePrice: 26,
        effect: { type: 'health', amount: 35 },
      },
    },
    {
      id: 'mana-tonic',
      ingredientIds: ['moon-water', 'silver-herb'],
      potion: {
        id: 'mana-tonic',
        name: 'Мана-тонік',
        emoji: '🔮',
        description: 'Відновлює 35 одиниць мани.',
        salePrice: 25,
        effect: { type: 'mana', amount: 35 },
      },
    },
    {
      id: 'ember-elixir',
      ingredientIds: ['red-mushroom', 'ember-flower'],
      potion: {
        id: 'ember-elixir',
        name: 'Еліксир жару',
        emoji: '🔥',
        description: 'Рідкісний товар із високою ціною.',
        salePrice: 34,
        effect: { type: 'none', amount: 0 },
      },
    },
    {
      id: 'stone-skin',
      ingredientIds: ['moon-water', 'cave-crystal'],
      potion: {
        id: 'stone-skin',
        name: 'Кам’яна шкіра',
        emoji: '🛡️',
        description: 'Відновлює 25 одиниць здоров’я.',
        salePrice: 38,
        effect: { type: 'health', amount: 25 },
      },
    },
    {
      id: 'dragon-focus',
      ingredientIds: ['silver-herb', 'dragon-scale'],
      potion: {
        id: 'dragon-focus',
        name: 'Концентрат дракона',
        emoji: '🐲',
        description: 'Відновлює 45 одиниць мани.',
        salePrice: 48,
        effect: { type: 'mana', amount: 45 },
      },
    },
  ],
}

export class CatalogRepository {
  getCatalog(): CatalogResponse {
    return catalog
  }

  findIngredient(id: string) {
    return catalog.ingredients.find((ingredient) => ingredient.id === id)
  }

  findRecipe(ingredientIds: [string, string]) {
    return catalog.recipes.find((recipe) => {
      const [first, second] = recipe.ingredientIds
      return (
        (ingredientIds[0] === first && ingredientIds[1] === second) ||
        (ingredientIds[0] === second && ingredientIds[1] === first)
      )
    })
  }

  findPotion(id: string): Potion | undefined {
    return catalog.recipes.find((recipe) => recipe.potion.id === id)?.potion
  }

  getPotionList(): Potion[] {
    return catalog.recipes.map((recipe) => recipe.potion)
  }
}
