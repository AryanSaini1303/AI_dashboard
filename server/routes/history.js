import { Router } from 'express'
import path from 'path'
import { requireAuth } from '../middleware/auth.js'
import { getStore } from '../store/index.js'

const router = Router()

// Normalise a stored prediction into the shape the frontend table expects
// (id/date/image/prediction/confidence-as-percent/timeMs).
function toClient(p) {
  const confidence = typeof p.confidence === 'number' ? p.confidence : 0
  return {
    id: String(p._id),
    date: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : '',
    image: p.imagePath ? path.basename(p.imagePath) : '—',
    prediction: p.prediction,
    confidence: Math.round(confidence * 1000) / 10,
    timeMs: p.inferenceTimeMs ?? 0
  }
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 25 } = req.query
    const { total, items } = await getStore().predictions.list({
      userId: req.user.id,
      search,
      page,
      limit
    })
    res.json({ total, items: items.map(toClient) })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load history', error: err.message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const ok = await getStore().predictions.delete(req.params.id, req.user.id)
    res.json({ ok })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete', error: err.message })
  }
})

export default router
