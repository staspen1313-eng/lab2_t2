<script setup lang="ts">
import type { Potion } from '../../shared/contracts.ts'

const props = defineProps<{
  potions: Potion[]
  stock: Record<string, number>
}>()

const emit = defineEmits<{
  use: [potion: Potion]
}>()

function countFor(potion: Potion): number {
  return props.stock[potion.id] ?? 0
}
</script>

<template>
  <section class="card border border-base-300 bg-base-100/80 shadow-xl">
    <div class="card-body p-5">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Готові товари
        </p>
        <h2 class="mt-1 text-xl font-bold">Вітрина зіль</h2>
      </div>

      <div v-if="potions.some((potion) => countFor(potion) > 0)" class="mt-2 space-y-2">
        <article
          v-for="potion in potions.filter((item) => countFor(item) > 0)"
          :key="potion.id"
          class="flex items-center gap-3 rounded-xl bg-base-200/50 p-3"
        >
          <span class="text-2xl" aria-hidden="true">{{ potion.emoji }}</span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ potion.name }}</p>
            <p class="text-xs text-base-content/55">
              ×{{ countFor(potion) }} · {{ potion.salePrice }} золота
            </p>
          </div>
          <button
            v-if="potion.effect.type !== 'none'"
            class="btn btn-xs btn-outline"
            type="button"
            :aria-label="`Використати: ${potion.name}`"
            @click="emit('use', potion)"
          >
            Випити
          </button>
        </article>
      </div>
      <p v-else class="mt-3 rounded-xl bg-base-200/50 p-4 text-sm text-base-content/55">
        Щойно зварені зілля з’являться тут.
      </p>
    </div>
  </section>
</template>
