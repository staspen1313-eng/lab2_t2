<script setup lang="ts">
import type { RewardChoice, RewardKind } from '../types/game.ts'

defineProps<{
  kind: RewardKind | null
}>()

const emit = defineEmits<{
  choose: [choice: RewardChoice]
}>()
</script>

<template>
  <div v-if="kind" class="modal modal-open" role="dialog" aria-modal="true">
    <div class="modal-box border border-primary/30 bg-base-100">
      <p class="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        {{ kind === 'level' ? 'Підвищення рівня' : 'Новий ранг майстра' }}
      </p>
      <h2 class="mt-2 text-2xl font-bold">
        {{ kind === 'level' ? 'Обери покращення' : 'Обери професійний бонус' }}
      </h2>
      <p class="mt-2 text-sm text-base-content/60">
        {{
          kind === 'level'
            ? 'Кожен звичайний рівень посилює одну характеристику та повністю її відновлює.'
            : 'Кожні п’ять рівнів відкривають ранг майстра.'
        }}
      </p>

      <div class="mt-6 grid gap-3 sm:grid-cols-2">
        <template v-if="kind === 'level'">
          <button
            class="btn btn-outline h-auto min-h-24 flex-col gap-1 py-4"
            type="button"
            @click="emit('choose', 'health')"
          >
            <span class="text-lg">❤️ +15 здоров’я</span>
            <span class="text-xs font-normal opacity-70">Максимум зросте, здоров’я відновиться</span>
          </button>
          <button
            class="btn btn-outline h-auto min-h-24 flex-col gap-1 py-4"
            type="button"
            @click="emit('choose', 'mana')"
          >
            <span class="text-lg">🔷 +15 мани</span>
            <span class="text-xs font-normal opacity-70">Максимум зросте, мана відновиться</span>
          </button>
        </template>
        <template v-else>
          <button
            class="btn btn-outline h-auto min-h-24 flex-col gap-1 py-4"
            type="button"
            @click="emit('choose', 'trade')"
          >
            <span class="text-lg">🪙 Торгівля +5%</span>
            <span class="text-xs font-normal opacity-70">Більший прибуток із продажу зіль</span>
          </button>
          <button
            class="btn btn-outline h-auto min-h-24 flex-col gap-1 py-4"
            type="button"
            @click="emit('choose', 'discount')"
          >
            <span class="text-lg">🌿 Знижка +5%</span>
            <span class="text-xs font-normal opacity-70">Дешевші інгредієнти на ринку</span>
          </button>
        </template>
      </div>
    </div>
    <div class="modal-backdrop bg-black/70" />
  </div>
</template>
