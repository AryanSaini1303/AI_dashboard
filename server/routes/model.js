import { Router } from 'express'
import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'
import { upload } from '../middleware/upload.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

router.get('/', requireAuth, async (req, res) => {
  try {
    const r = await fetch(`${ML_URL}/model-info`)
    const data = await r.json()
    res.json(data)
  } catch (err) {
    res.status(502).json({ message: 'Could not reach ml-service', error: err.message })
  }
})

router.post('/upload', requireAuth, upload.single('model'), async (req, res) => {
  try {
    const form = new FormData()
    form.append('file', fs.createReadStream(req.file.path))
    const r = await fetch(`${ML_URL}/model-upload`, { method: 'POST', body: form })
    const data = await r.json()
    res.json(data)
  } catch (err) {
    res.status(502).json({ message: 'Model upload failed', error: err.message })
  }
})

export default router
