<script setup lang="ts">
import { computed } from 'vue'
import type { Ingredient } from '../../shared/contracts.ts'

const props = defineProps<{
  ingredients: Ingredient[]
  inventory: Record<string, number>
  selectedIds: string[]
  mana: number
  canBrew: boolean
  brewing: boolean
}>()

const emit = defineEmits<{
  select: [ingredientId: string]
  remove: [slotIndex: number]
  brew: []
}>()

const cauldronSlots = [
  { id: 'first', index: 0 },
  { id: 'second', index: 1 },
] as const

const availableIngredients = computed(() =>
  props.ingredients.filter(
    (ingredient) => (props.inventory[ingredient.id] ?? 0) > 0,
  ),
)

function ingredientForSlot(slotIndex: number): Ingredient | undefined {
  const ingredientId = props.selectedIds[slotIndex]
  return props.ingredients.find(
    (ingredient) => ingredient.id === ingredientId,
  )
}

function availableCount(ingredientId: string): number {
  const selectedCount = props.selectedIds.filter(
    (selectedId) => selectedId === ingredientId,
  ).length

  return (props.inventory[ingredientId] ?? 0) - selectedCount
}
</script>

<template>
  <section class="card cauldron-glow border border-amber-200/20 bg-base-100/90 shadow-2xl">
    <div class="card-body p-5 sm:p-6">
      <div class="text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Алхімічна лабораторія
        </p>
        <h2 class="mt-1 text-2xl font-bold">Казан синтезу</h2>
        <p class="mt-2 text-sm text-base-content/60">
          Обери два інгредієнти. Невдала суміш вибухає та завдає випадкової шкоди.
        </p>
      </div>

      <div class="my-4 grid grid-cols-2 gap-3">
        <div
          v-for="slot in cauldronSlots"
          :key="slot.id"
          class="min-h-32 rounded-2xl border border-dashed p-3 text-center transition"
          :class="
            selectedIds[slot.index]
              ? 'border-primary/50 bg-primary/5'
              : 'border-base-content/20 bg-base-200/60'
          "
        >
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-base-content/45">
            Слот {{ slot.index + 1 }}
          </p>
          <template v-if="selectedIds[slot.index]">
            <span class="brew-bubble mt-2 inline-block text-3xl" aria-hidden="true">
              {{ ingredientForSlot(slot.index)?.emoji }}
            </span>
            <p class="mt-1 truncate text-sm font-semibold">
              {{ ingredientForSlot(slot.index)?.name }}
            </p>
            <button
              class="btn btn-ghost btn-xs mt-1 text-base-content/60"
              type="button"
              :aria-label="`Повернути ${ingredientForSlot(slot.index)?.name} до комори`"
              @click="emit('remove', slot.index)"
            >
              Повернути
            </button>
          </template>
          <div v-else class="mt-4 text-sm text-base-content/35">
            Обери нижче
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-base-200/70 px-4 py-3">
        <span class="text-sm text-base-content/70">Вартість спроби</span>
        <span class="font-bold text-sky-200">−15 мани</span>
      </div>

      <button
        class="btn btn-primary btn-lg mt-3 w-full"
        type="button"
        :disabled="!canBrew || brewing"
        @click="emit('brew')"
      >
        <span v-if="brewing" class="loading loading-spinner loading-sm" />
        <span v-else aria-hidden="true">⚗️</span>
        {{ brewing ? 'Суміш кипить…' : 'Синтезувати зілля' }}
      </button>

      <p v-if="mana < 15" class="text-center text-xs text-error">
        Недостатньо мани для синтезу.
      </p>

      <div class="mt-2">
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45">
          Інгредієнти в коморі
        </p>
        <div v-if="availableIngredients.length" class="flex flex-wrap gap-2">
          <button
            v-for="ingredient in availableIngredients"
            :key="ingredient.id"
            class="btn btn-sm btn-ghost border border-base-300 bg-base-200/50"
            type="button"
            :disabled="selectedIds.length === 2 || availableCount(ingredient.id) < 1"
            @click="emit('select', ingredient.id)"
          >
            <span aria-hidden="true">{{ ingredient.emoji }}</span>
            {{ ingredient.name }}
            <span class="badge badge-xs">{{ availableCount(ingredient.id) }}</span>
          </button>
        </div>
        <p v-else class="rounded-xl bg-base-200/50 p-3 text-sm text-base-content/55">
          Комора порожня. Купи інгредієнти на ринку.
        </p>
      </div>
    </div>
  </section>
</template>
