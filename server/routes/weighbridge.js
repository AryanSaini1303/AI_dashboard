import express from 'express'
import multer from 'multer'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

const WEIGHBRIDGE_BASE_URL = 'https://weighbridge.rymgrenergy.com'

router.post('/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' })
    }

    const form = new FormData()
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype })
    form.append('file', blob, req.file.originalname)

    const response = await fetch(`${WEIGHBRIDGE_BASE_URL}/process`, {
      method: 'POST',
      body: form
    })

    const rawText = await response.text()
    console.log('Weighbridge raw response:', response.status, rawText)

    let data
    try {
      data = JSON.parse(rawText)
    } catch {
      return res.status(502).json({
        message: 'Weighbridge service returned a non-JSON response',
        upstreamStatus: response.status,
        raw: rawText
      })
    }

    res.status(response.status).json(data)
  } catch (err) {
    console.error('Weighbridge proxy error:', err)
    res.status(500).json({ message: 'Failed to reach weighbridge service' })
  }
})

router.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${WEIGHBRIDGE_BASE_URL}/health`)
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to reach weighbridge service' })
  }
})

export default router