import { Router } from 'express'
import fetch from 'node-fetch'

const router = Router()
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

router.get('/', async (req, res) => {
  try {
    const start = Date.now()
    const r = await fetch(`${ML_URL}/health`)
    const data = await r.json()
    res.json({ ...data, latencyMs: Date.now() - start })
  } catch (err) {
    res.json({ status: 'offline', latencyMs: null, modelLoaded: false, gpu: false, ramGb: null })
  }
})

export default router
