<script setup lang="ts">
import type { Ingredient, Recipe } from '../../shared/contracts.ts'

const props = defineProps<{
  recipes: Recipe[]
  ingredients: Ingredient[]
  discoveredIds: string[]
}>()

function ingredientName(id: string): string {
  return props.ingredients.find((ingredient) => ingredient.id === id)?.name ?? id
}
</script>

<template>
  <section class="card border border-base-300 bg-base-100/80 shadow-xl">
    <div class="card-body p-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Дослідження
          </p>
          <h2 class="mt-1 text-xl font-bold">Гримуар рецептів</h2>
        </div>
        <span class="badge badge-ghost">
          {{ discoveredIds.length }} / {{ recipes.length }}
        </span>
      </div>

      <ul class="mt-2 space-y-2">
        <li
          v-for="recipe in recipes"
          :key="recipe.id"
          class="flex items-center gap-3 rounded-xl bg-base-200/50 p-3"
          :class="{ 'opacity-55': !discoveredIds.includes(recipe.id) }"
        >
          <span class="text-2xl" aria-hidden="true">
            {{ discoveredIds.includes(recipe.id) ? recipe.potion.emoji : '📜' }}
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">
              {{ discoveredIds.includes(recipe.id) ? recipe.potion.name : 'Невідома формула' }}
            </p>
            <p class="truncate text-xs text-base-content/55">
              {{ discoveredIds.includes(recipe.id)
                ? `${ingredientName(recipe.ingredientIds[0])} + ${ingredientName(recipe.ingredientIds[1])}`
                : 'Дізнайся рецепт у казані'
              }}
            </p>
          </div>
          <span
            v-if="discoveredIds.includes(recipe.id)"
            class="badge badge-success badge-outline ml-auto"
          >
            Відкрито
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
