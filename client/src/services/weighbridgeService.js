import api from './api'

// Calls go through OUR backend now (which proxies to the weighbridge
// service server-to-server), avoiding the browser CORS restriction.

export async function checkWeighbridgeHealth() {
  try {
    const { data } = await api.get('/weighbridge/health')
    return data
  } catch (e) {
    console.error('Weighbridge health check error:', e)
    throw e
  }
}

export async function processWeighbridgeImage(file) {
  const form = new FormData()
  form.append('file', file)

  try {
    const { data } = await api.post('/weighbridge/process', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  } catch (e) {
    console.error('Weighbridge process error:', e)
    throw e
  }
}