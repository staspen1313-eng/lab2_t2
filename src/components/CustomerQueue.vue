<script setup lang="ts">
import type { CustomerOrder, Potion } from '../../shared/contracts.ts'

const props = defineProps<{
  orders: CustomerOrder[]
  potions: Potion[]
  stock: Record<string, number>
  selling: boolean
}>()

const emit = defineEmits<{
  fulfill: [order: CustomerOrder]
}>()

function potionFor(order: CustomerOrder): Potion | undefined {
  return props.potions.find(
    (potion) => potion.id === order.requestedPotionId,
  )
}
</script>

<template>
  <section class="card border border-base-300 bg-base-100/80 shadow-xl">
    <div class="card-body p-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Торгівля
          </p>
          <h2 class="mt-1 text-xl font-bold">Черга покупців</h2>
        </div>
        <span class="badge badge-secondary badge-outline">{{ orders.length }}</span>
      </div>

      <div v-if="orders.length" class="mt-2 space-y-3">
        <article
          v-for="order in orders"
          :key="order.id"
          class="rounded-2xl border border-base-300 bg-base-200/45 p-3"
        >
          <div class="flex items-start gap-3">
            <span
              class="grid size-10 shrink-0 place-items-center rounded-full bg-secondary/15 text-lg"
              aria-hidden="true"
            >
              🧙
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-semibold">{{ order.customerName }}</p>
              <p class="mt-1 text-sm text-base-content/65">
                Шукає
                <strong class="text-base-content">
                  {{ potionFor(order)?.name ?? 'невідоме зілля' }}
                </strong>
              </p>
              <p class="mt-1 text-xs text-amber-200/80">
                Чайові: {{ order.tip }} золотих
              </p>
            </div>
          </div>
          <button
            class="btn btn-sm btn-secondary mt-3 w-full"
            type="button"
            :disabled="
              selling ||
              (stock[order.requestedPotionId] ?? 0) < 1 ||
              !potionFor(order)
            "
            @click="emit('fulfill', order)"
          >
            {{
              selling
                ? 'Оформлюємо…'
                : `Продати зілля ×${stock[order.requestedPotionId] ?? 0}`
            }}
          </button>
        </article>
      </div>
      <p v-else class="mt-3 rounded-xl bg-base-200/50 p-4 text-sm text-base-content/55">
        Покупців поки немає. Черга оновиться автоматично.
      </p>
    </div>
  </section>
</template>
