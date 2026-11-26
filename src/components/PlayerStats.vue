<script setup lang="ts">
import type { GameState } from '../types/game.ts'

defineProps<{
  state: GameState
  experiencePercent: number
}>()
</script>

<template>
  <section class="card border border-base-300 bg-base-100/80 shadow-xl">
    <div class="card-body gap-5 p-5 sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Алхімік
          </p>
          <h2 class="mt-1 text-2xl font-bold text-base-content">
            Рівень {{ state.level }}
            <span class="ml-1 text-base font-normal text-base-content/60">
              · Ранг майстра {{ state.masterRank }}
            </span>
          </h2>
        </div>
        <div class="badge badge-lg gap-2 border-amber-400/30 bg-amber-400/10 px-4 py-4 text-amber-200">
          <span aria-hidden="true">🪙</span>
          <span class="font-bold">{{ state.gold }}</span>
          <span class="text-xs font-medium">золота</span>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <div class="mb-2 flex justify-between text-sm">
            <span class="font-semibold text-red-200">❤️ Здоров’я</span>
            <span class="tabular-nums text-base-content/70">
              {{ state.hp }} / {{ state.maxHp }}
            </span>
          </div>
          <progress
            class="progress progress-error h-3 w-full"
            :value="state.hp"
            :max="state.maxHp"
            aria-label="Здоров’я алхіміка"
          />
        </div>

        <div>
          <div class="mb-2 flex justify-between text-sm">
            <span class="font-semibold text-sky-200">🔷 Мана</span>
            <span class="tabular-nums text-base-content/70">
              {{ state.mp }} / {{ state.maxMp }}
            </span>
          </div>
          <progress
            class="progress progress-info h-3 w-full"
            :value="state.mp"
            :max="state.maxMp"
            aria-label="Мана алхіміка"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 flex justify-between text-xs text-base-content/60">
          <span>Досвід</span>
          <span>{{ state.experience }} / {{ state.experienceToNext }} XP</span>
        </div>
        <div
          class="h-2 w-full overflow-hidden rounded-full bg-base-300"
          role="progressbar"
          :aria-valuenow="experiencePercent"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Прогрес досвіду"
        >
          <div
            class="h-full rounded-full bg-success transition-[width] duration-300"
            :style="{ width: `${experiencePercent}%` }"
            aria-hidden="true"
          />
        </div>
      </div>

      <div class="flex flex-wrap gap-2 text-xs">
        <div class="badge badge-outline border-amber-300/30 text-amber-100">
          Торгівля +{{ state.saleBonusPercent }}%
        </div>
        <div class="badge badge-outline border-emerald-300/30 text-emerald-100">
          Знижка {{ state.marketDiscountPercent }}%
        </div>
      </div>
    </div>
  </section>
</template>
