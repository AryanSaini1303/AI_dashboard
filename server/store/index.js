// Chooses the active data store at boot. If MongoDB connects we use the
// Mongo-backed store; otherwise we fall back to an in-memory store so the
// app stays fully functional (auth + history + stats) without a database.

import { memoryStore } from './memoryStore.js'
import { mongoStore } from './mongoStore.js'

let active = memoryStore

export function useMongoStore() {
  active = mongoStore
}

export function useMemoryStore() {
  active = memoryStore
}

export function getStore() {
  return active
}
