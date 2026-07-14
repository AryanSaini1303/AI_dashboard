import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import authRoutes from './routes/auth.js'
import predictRoutes from './routes/predict.js'
import historyRoutes from './routes/history.js'
import modelRoutes from './routes/model.js'
import statsRoutes from './routes/stats.js'
import healthRoutes from './routes/health.js'
import weighbridgeRoutes from './routes/weighbridge.js'
import { useMongoStore } from './store/index.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/predict', predictRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/model', modelRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/weighbridge', weighbridgeRoutes)

app.use('/uploads', express.static('uploads'))

const PORT = process.env.PORT || 5000

async function start() {
  // Fail fast instead of buffering queries for 10s if the DB is unreachable.
  mongoose.set('bufferCommands', false)

  if (process.env.MONGO_URI) {
    console.log("MONGO URI =", process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    })

    useMongoStore()
    console.log('MongoDB connected — using persistent store')
  } catch (err) {
  console.log("================ ERROR ================");
  console.dir(err, { depth: null });
  console.log("======================================");
}
} else {
    console.warn('No MONGO_URI set — using in-memory store (data will not persist)')
  }

  app.listen(PORT, () => console.log(`MineralVision API running on port ${PORT}`))
}

start()