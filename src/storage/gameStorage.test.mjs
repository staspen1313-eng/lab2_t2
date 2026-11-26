import assert from 'node:assert/strict'
import test from 'node:test'

const storage = new Map()
globalThis.localStorage = {
  getItem(key) {
    return storage.get(key) ?? null
  },
  setItem(key, value) {
    storage.set(key, value)
  },
}

const { createInitialGameState, restoreGameState, saveGameState } =
  await import('./gameStorage.ts')

test('game progress is saved and restored from local storage', () => {
  const state = createInitialGameState()
  state.gold = 83
  state.ingredients['moon-water'] = 2
  state.discoveredRecipeIds.push('healing-draught')
  state.cauldronSlots.push('moon-water')

  saveGameState(state)

  assert.deepEqual(restoreGameState(), { state, warning: null })
})

test('corrupted save data is surfaced instead of silently accepted', () => {
  storage.set('alchemy-shop-save-v1', '{')

  const restored = restoreGameState()

  assert.equal(restored.state.gold, 50)
  assert.match(restored.warning, /Не вдалося відновити збереження/)
})
