import { mockHistory, mockStats, mockModel, mockApiHealth } from './mockData'
import axios from 'axios'

// Mineral service has its own backend, separate from the
// weighbridge API so changing one never breaks the other.
const mineralApi = axios.create({
  baseURL: import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:5001'
})

// Prediction API
export async function predictImage(file) {
  const form = new FormData()

  // Backend expects "file"
  form.append('file', file)

  try {
    const { data } = await mineralApi.post('/predict', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-api-key':
          import.meta.env.VITE_MODEL_API_KEY || 'mysecret123'
      }
    })

    return {
      prediction: data.prediction,
      confidence: data.confidence,
      inferenceTimeMs: data.inferenceTimeMs || 0,
      probabilities:
        data.all_probabilities?.map((item) => ({
          mineral: item.class,
          value: item.confidence
        })) || []
    }
  } catch (e) {
    console.error('Prediction Error:', e)
    throw e
  }
}

export async function compareImages(fileA, fileB) {
  const form = new FormData()
  form.append('imageA', fileA)
  form.append('imageB', fileB)

  try {
    const { data } = await mineralApi.post('/predict/compare', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  } catch (e) {
    console.warn('[demo mode] /predict/compare unreachable, returning mock comparison')
    await new Promise((r) => setTimeout(r, 900))
    return {
      a: { prediction: 'Granite', confidence: 0.91 },
      b: { prediction: 'Limestone', confidence: 0.88 },
      similarity: 0.18,
      verdict: 'Different Minerals'
    }
  }
}

export async function getStats() {
  try {
    const { data } = await mineralApi.get('/stats')
    return data
  } catch (e) {
    console.warn('[demo mode] /stats unreachable, returning mock stats')
    return mockStats
  }
}

export async function getHistory({ search = '', page = 1 } = {}) {
  try {
    const { data } = await mineralApi.get('/history', {
      params: { search, page }
    })
    return data
  } catch (e) {
    return mockHistory
  }
}

export async function deleteHistoryItem(id) {
  try {
    await mineralApi.delete(`/history/${id}`)
  } catch (e) {
    console.warn('[demo mode] delete not persisted')
  }
}

export async function getModelInfo() {
  try {
    const { data } = await mineralApi.get('/model')
    return data
  } catch (e) {
    return mockModel
  }
}

export async function uploadModel(file, onProgress) {
  const form = new FormData()
  form.append('model', file)

  try {
    const { data } = await mineralApi.post('/model/upload', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (evt) =>
        onProgress?.(Math.round((evt.loaded / evt.total) * 100))
    })

    return data
  } catch (e) {
    console.warn('[demo mode] model upload not persisted')
    return { ok: true, version: 'v-local' }
  }
}

export async function getApiHealth() {
  try {
    const { data } = await mineralApi.get('/health')
    return data
  } catch (e) {
    console.warn('[demo mode] /health unreachable')
    return mockApiHealth
  }
}