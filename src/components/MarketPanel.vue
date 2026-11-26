<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Ingredient } from '../../shared/contracts.ts'

const props = defineProps<{
  ingredients: Ingredient[]
  inventory: Record<string, number>
  gold: number
  discountPercent: number
}>()

const emit = defineEmits<{
  buy: [ingredient: Ingredient]
}>()

const searchQuery = ref('')

const filteredIngredients = computed(() => {
  const query = searchQuery.value.toLocaleLowerCase()

  if (!query) {
    return props.ingredients
  }

  return props.ingredients.filter((ingredient) =>
    `${ingredient.name} ${ingredient.description}`
      .toLocaleLowerCase()
      .includes(query),
  )
})

function priceFor(ingredient: Ingredient): number {
  return Math.max(
    1,
    Math.ceil(ingredient.price * (1 - props.discountPercent / 100)),
  )
}
</script>

<template>
  <section class="card border border-base-300 bg-base-100/80 shadow-xl">
    <div class="card-body p-5">
      <div class="mb-1 flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Крамниця
          </p>
          <h2 class="mt-1 text-xl font-bold">Ринок інгредієнтів</h2>
        </div>
        <span class="badge badge-ghost">Комора</span>
      </div>

      <label class="input input-bordered mt-2 flex items-center gap-2">
        <span aria-hidden="true">⌕</span>
        <input
          v-model.trim="searchQuery"
          class="grow"
          type="search"
          placeholder="Пошук інгредієнтів"
          aria-label="Пошук інгредієнтів"
          @keydown.esc="searchQuery = ''"
        />
      </label>

      <ul v-if="filteredIngredients.length" class="mt-2 divide-y divide-base-300/70">
        <li
          v-for="ingredient in filteredIngredients"
          :key="ingredient.id"
          class="flex items-center gap-3 py-3"
        >
          <span
            class="grid size-11 shrink-0 place-items-center rounded-xl bg-base-200 text-2xl"
            aria-hidden="true"
          >
            {{ ingredient.emoji }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2">
              <h3 class="font-semibold">{{ ingredient.name }}</h3>
              <span class="text-xs text-base-content/50">
                ×{{ inventory[ingredient.id] ?? 0 }}
              </span>
            </div>
            <p class="mt-0.5 text-xs leading-relaxed text-base-content/55">
              {{ ingredient.description }}
            </p>
          </div>
          <button
            class="btn btn-sm btn-outline border-amber-300/40 text-amber-100 hover:bg-amber-300/10"
            type="button"
            :disabled="gold < priceFor(ingredient)"
            :aria-label="`Купити ${ingredient.name} за ${priceFor(ingredient)} золота`"
            @click="emit('buy', ingredient)"
          >
            <span>🪙 {{ priceFor(ingredient) }}</span>
          </button>
        </li>
      </ul>
      <p v-else class="mt-3 rounded-xl bg-base-200/50 p-4 text-sm text-base-content/55">
        Інгредієнтів за цим запитом не знайдено.
      </p>
    </div>
  </section>
</template>
