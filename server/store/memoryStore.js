// In-memory data layer used when no MONGO_URI is configured, so the whole
// app (auth, prediction history, stats) works end-to-end for local dev and
// demos without a database. Data lives only for the lifetime of the process.

import crypto from 'crypto'
import { computeStats } from './computeStats.js'

const users = []
const predictions = []

function id() {
  return crypto.randomUUID()
}

export const memoryStore = {
  mode: 'memory',

  users: {
    async findByEmail(email) {
      return users.find((u) => u.email === email) || null
    },
    async create({ email, passwordHash, role }) {
      const user = {
        _id: id(),
        email,
        passwordHash,
        role: role || 'client',
        createdAt: new Date()
      }
      users.push(user)
      return user
    }
  },

  predictions: {
    async create(doc) {
      const record = {
        _id: id(),
        user: doc.user,
        imagePath: doc.imagePath,
        prediction: doc.prediction,
        confidence: doc.confidence,
        inferenceTimeMs: doc.inferenceTimeMs,
        probabilities: doc.probabilities || [],
        createdAt: new Date()
      }
      predictions.push(record)
      return record
    },

    async list({ userId, search = '', page = 1, limit = 25 }) {
      let items = predictions.filter((p) => p.user === userId)
      if (search) {
        const re = new RegExp(search, 'i')
        items = items.filter((p) => re.test(p.prediction || ''))
      }
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const total = items.length
      const start = (Number(page) - 1) * Number(limit)
      const paged = items.slice(start, start + Number(limit))
      return { total, items: paged }
    },

    async delete(itemId, userId) {
      const idx = predictions.findIndex(
        (p) => p._id === itemId && p.user === userId
      )
      if (idx !== -1) predictions.splice(idx, 1)
      return idx !== -1
    },

    async stats({ activeModel } = {}) {
      return computeStats(predictions, { activeModel })
    }
  }
}
