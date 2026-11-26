import assert from 'node:assert/strict'
import test from 'node:test'
import { GameError, GameService } from '../src/services/gameService.ts'

test('known ingredient pairs brew the same potion in either order', () => {
  const service = new GameService()

  const first = service.brew(['red-mushroom', 'moon-water'])
  const second = service.brew(['moon-water', 'red-mushroom'])

  assert.equal(first.outcome, 'success')
  assert.equal(second.outcome, 'success')
  assert.equal(first.potion.id, 'healing-draught')
  assert.equal(second.potion.id, first.potion.id)
})

test('unknown recipes explode and keep critical damage within the stated range', () => {
  const values = [0.1, 0.5]
  const service = new GameService(undefined, () => values.shift() ?? 0)

  const result = service.brew(['ember-flower', 'cave-crystal'])

  assert.equal(result.outcome, 'explosion')
  assert.equal(result.critical, true)
  assert.ok(result.damage >= 45 && result.damage <= 90)
})

test('sales reject potions that do not match the customer order', () => {
  const service = new GameService()

  assert.throws(
    () => service.sell('mana-tonic', 'healing-draught', 5, 4),
    GameError,
  )
})

test('sale bonus and customer tip are included in the payout', () => {
  const service = new GameService()

  assert.deepEqual(service.sell('healing-draught', 'healing-draught', 10, 4), {
    goldEarned: 33,
    experienceEarned: 20,
  })
})

test('customer orders request distinct random potions and avoid queued orders', () => {
  const service = new GameService(undefined, () => 0)

  const orders = service.createOrders(3)
  const requestedPotionIds = orders.map((order) => order.requestedPotionId)

  assert.equal(new Set(requestedPotionIds).size, orders.length)

  const nextOrder = service.createOrders(1, requestedPotionIds)[0]
  assert.ok(!requestedPotionIds.includes(nextOrder.requestedPotionId))
})
