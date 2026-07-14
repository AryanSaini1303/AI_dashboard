export const mockStats = {
  totalPredictions: 4820,
  todaysUploads: 96,
  accuracy: 94.2,
  activeModel: 'SqueezeNet1.1 v2.0',
  mineralDistribution: [
    { name: 'Granite', value: 42 },
    { name: 'Limestone', value: 35 },
    { name: 'Calcite', value: 23 }
  ],
  predictionCounts: [
    { name: 'Granite', count: 210 },
    { name: 'Limestone', count: 174 },
    { name: 'Calcite', count: 132 }
  ],
  dailyPredictions: [
    { day: 'Mon', count: 60 },
    { day: 'Tue', count: 92 },
    { day: 'Wed', count: 74 },
    { day: 'Thu', count: 110 },
    { day: 'Fri', count: 88 },
    { day: 'Sat', count: 40 },
    { day: 'Sun', count: 35 }
  ],
  accuracyTrend: [
    { week: 'W1', accuracy: 91.1 },
    { week: 'W2', accuracy: 92.4 },
    { week: 'W3', accuracy: 93.6 },
    { week: 'W4', accuracy: 94.2 }
  ]
}

export const mockHistory = {
  total: 3,
  items: [
    { id: '1', date: '2026-07-07', image: 'granite_04.jpg', prediction: 'Granite', confidence: 96.3, timeMs: 45 },
    { id: '2', date: '2026-07-07', image: 'limestone_11.jpg', prediction: 'Limestone', confidence: 91.1, timeMs: 42 },
    { id: '3', date: '2026-07-06', image: 'calcite_02.jpg', prediction: 'Calcite', confidence: 88.6, timeMs: 48 }
  ]
}

export const mockModel = {
  name: 'SqueezeNet1.1',
  accuracy: null,
  version: 'v2.0',
  sizeMb: 2.8,
  uploadedAt: 'July 2026',
  framework: 'PyTorch',
  classes: ['Calcite', 'Granite', 'Limestone']
}

export const mockApiHealth = {
  status: 'online',
  latencyMs: 82,
  modelLoaded: true,
  gpu: false,
  ramGb: 3.2
}
