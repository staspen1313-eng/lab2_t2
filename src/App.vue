<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import CauldronPanel from './components/CauldronPanel.vue'
import CustomerQueue from './components/CustomerQueue.vue'
import MarketPanel from './components/MarketPanel.vue'
import PlayerStats from './components/PlayerStats.vue'
import RecipeBook from './components/RecipeBook.vue'
import RewardModal from './components/RewardModal.vue'
import VitrinePanel from './components/VitrinePanel.vue'
import { useGame } from './composables/useGame.ts'

const game = reactive(useGame())

onMounted(() => {
  void game.initialize()
})
</script>

<template>
  <div data-theme="night" class="min-h-screen text-base-content">
    <header class="border-b border-base-300/80 bg-base-100/55 backdrop-blur">
      <div class="navbar mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div class="flex-1 gap-3">
          <div
            class="grid size-12 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-2xl"
            aria-hidden="true"
          >
            ⚗️
          </div>
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              Лавка алхіміка
            </p>
            <h1 class="text-lg font-bold leading-tight sm:text-xl">
              Синтез зілля та торгівля
            </h1>
          </div>
        </div>
        <div class="hidden items-center gap-2 text-xs text-base-content/50 sm:flex">
          <span class="size-2 rounded-full bg-success" />
          Прогрес зберігається автоматично
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div
        v-if="game.notice"
        class="alert mb-4 shadow-lg"
        :class="{
          'alert-success': game.notice.kind === 'success',
          'alert-warning': game.notice.kind === 'warning',
          'alert-error': game.notice.kind === 'error',
          'alert-info': game.notice.kind === 'info',
        }"
        role="status"
        aria-live="polite"
      >
        <span>{{ game.notice.message }}</span>
        <button
          class="btn btn-ghost btn-sm btn-square"
          type="button"
          aria-label="Закрити повідомлення"
          @click="game.dismissNotice"
        >
          ✕
        </button>
      </div>

      <div v-if="game.storageError" class="alert alert-warning mb-4" role="alert">
        <span>{{ game.storageError }}</span>
      </div>

      <div
        v-if="game.apiError"
        class="alert alert-error mb-4"
        role="alert"
      >
        <span class="flex-1">{{ game.apiError }}</span>
        <button
          v-if="!game.catalog"
          class="btn btn-sm"
          type="button"
          @click="game.initialize"
        >
          Спробувати ще
        </button>
        <button
          v-else
          class="btn btn-ghost btn-sm btn-square"
          type="button"
          aria-label="Закрити помилку"
          @click="game.clearApiError"
        >
          ✕
        </button>
      </div>

      <section
        v-if="game.loading"
        class="grid min-h-[50vh] place-content-center justify-items-center gap-4 text-center"
        aria-live="polite"
      >
        <span class="loading loading-spinner loading-lg text-primary" />
        <p class="text-sm text-base-content/60">Готуємо крамницю…</p>
      </section>

      <section
        v-else-if="game.catalog"
        class="space-y-6"
        aria-label="Ігровий модуль алхімічної крамниці"
      >
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
          <div class="relative overflow-hidden rounded-3xl border border-amber-100/10 bg-gradient-to-br from-amber-950/50 via-base-100/90 to-emerald-950/30 p-5 shadow-xl sm:p-7">
            <div class="pointer-events-none absolute -right-6 -top-10 text-[10rem] opacity-[0.07]" aria-hidden="true">
              ⚗
            </div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/75">
              Варіант 3 · Алхімічна майстерня
            </p>
            <h2 class="mt-3 max-w-2xl text-2xl font-black leading-tight sm:text-3xl">
              Експериментуй із рецептами. Доведи, що ти майстер.
            </h2>
            <p class="mt-3 max-w-2xl text-sm leading-relaxed text-base-content/65">
              Купуй сировину, відкривай формули в гримуарі та виконуй замовлення.
              Та пам’ятай: невдалий дослід може коштувати здоров’я і рівня.
            </p>
          </div>

          <PlayerStats
            :state="game.state"
            :experience-percent="game.experiencePercent"
          />
        </div>

        <div class="grid items-start gap-6 xl:grid-cols-[minmax(17rem,0.9fr)_minmax(22rem,1.2fr)_minmax(17rem,0.9fr)]">
          <div class="grid gap-6">
            <MarketPanel
              :ingredients="game.catalog.ingredients"
              :inventory="game.state.ingredients"
              :gold="game.state.gold"
              :discount-percent="game.state.marketDiscountPercent"
              @buy="game.buyIngredient"
            />
            <RecipeBook
              :recipes="game.catalog.recipes"
              :ingredients="game.catalog.ingredients"
              :discovered-ids="game.state.discoveredRecipeIds"
            />
          </div>

          <CauldronPanel
            :ingredients="game.catalog.ingredients"
            :inventory="game.state.ingredients"
            :selected-ids="game.state.cauldronSlots"
            :mana="game.state.mp"
            :can-brew="game.canBrew"
            :brewing="game.brewing"
            @select="game.selectIngredient"
            @remove="game.returnIngredient"
            @brew="game.brew"
          />

          <div class="grid gap-6">
            <CustomerQueue
              :orders="game.state.customerOrders"
              :potions="game.potionList"
              :stock="game.state.potions"
              :selling="game.selling"
              @fulfill="game.fulfillOrder"
            />
            <VitrinePanel
              :potions="game.potionList"
              :stock="game.state.potions"
              @use="game.usePotion"
            />
          </div>
        </div>
      </section>

      <section
        v-else
        class="alert alert-error mx-auto mt-12 max-w-xl"
        role="alert"
      >
        <span>Не вдалося завантажити каталог крамниці. Перевір підключення до API.</span>
        <button class="btn btn-sm" type="button" @click="game.initialize">
          Повторити
        </button>
      </section>
    </main>

    <RewardModal
      :kind="game.pendingReward"
      @choose="game.chooseReward"
    />
  </div>
</template>
