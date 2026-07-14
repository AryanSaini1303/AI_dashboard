// MongoDB-backed data layer (used when MONGO_URI is set). Exposes the same
// interface as memoryStore so routes never care which backend is active.

import User from '../models/User.js'
import Prediction from '../models/Prediction.js'
import { computeStats } from './computeStats.js'

export const mongoStore = {
  mode: 'mongo',

  users: {
    async findByEmail(email) {
      return User.findOne({ email })
    },
    async create({ email, passwordHash, role }) {
      return User.create({ email, passwordHash, role })
    }
  },

  predictions: {
    async create(doc) {
      return Prediction.create(doc)
    },

    async list({ userId, search = '', page = 1, limit = 25 }) {
      const query = { user: userId }
      if (search) query.prediction = new RegExp(search, 'i')

      const items = await Prediction.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean()

      const total = await Prediction.countDocuments(query)
      return { total, items }
    },

    async delete(itemId, userId) {
      const res = await Prediction.deleteOne({ _id: itemId, user: userId })
      return res.deletedCount > 0
    },

    async stats({ activeModel } = {}) {
      const all = await Prediction.find({})
        .select('prediction confidence createdAt')
        .lean()
      return computeStats(all, { activeModel })
    }
  }
}
