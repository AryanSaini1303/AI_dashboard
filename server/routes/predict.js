import { Router } from 'express'
import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'
import { upload } from '../middleware/upload.js'
import { requireAuth } from '../middleware/auth.js'
import { getStore } from '../store/index.js'

const router = Router()
const ML_URL = process.env.ML_SERVICE_URL
const ML_API_KEY = process.env.ML_API_KEY

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded (field name must be "image")' })
    }

    const form = new FormData()
    form.append('file', fs.createReadStream(req.file.path))

    const mlRes = await fetch(`${ML_URL}/predict`, {
      method: 'POST',
      body: form,
      headers: { 'x-api-key': ML_API_KEY }
    })
    if (!mlRes.ok) throw new Error(`ml-service responded ${mlRes.status}`)
    const result = await mlRes.json()

    const record = await getStore().predictions.create({
      user: req.user.id,
      imagePath: req.file.path,
      prediction: result.prediction,
      confidence: result.confidence,
      inferenceTimeMs: result.inference_time_ms,
      probabilities: result.probabilities
    })

    res.json({
      prediction: record.prediction,
      confidence: record.confidence,
      inferenceTimeMs: record.inferenceTimeMs,
      probabilities: record.probabilities
    })
  } catch (err) {
    res.status(502).json({ message: 'Prediction failed — is ml-service running?', error: err.message })
  }
})

router.post('/compare', requireAuth, upload.fields([{ name: 'imageA' }, { name: 'imageB' }]), async (req, res) => {
  try {
    const fileA = req.files?.imageA?.[0]
    const fileB = req.files?.imageB?.[0]
    if (!fileA || !fileB) {
      return res.status(400).json({ message: 'Two images are required (fields "imageA" and "imageB")' })
    }

    const form = new FormData()
    form.append('fileA', fs.createReadStream(fileA.path))
    form.append('fileB', fs.createReadStream(fileB.path))

    const mlRes = await fetch(`${ML_URL}/compare`, {
      method: 'POST',
      body: form,
      headers: { 'x-api-key': ML_API_KEY }
    })
    if (!mlRes.ok) throw new Error(`ml-service responded ${mlRes.status}`)
    const result = await mlRes.json()

    res.json(result)
  } catch (err) {
    res.status(502).json({ message: 'Comparison failed — is ml-service running?', error: err.message })
  }
})

export default router