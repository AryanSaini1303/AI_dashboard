import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getStore } from '../store/index.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const stats = await getStore().predictions.stats({
      activeModel: process.env.ACTIVE_MODEL_NAME || 'SqueezeNet1.1 v2.0'
    })
    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: 'Failed to load stats', error: err.message })
  }
})

export default router
