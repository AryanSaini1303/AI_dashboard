// Shared analytics computation so the MongoDB-backed and in-memory stores
// return identical shapes. Takes a plain array of prediction records
// ({ prediction, confidence, createdAt }) and derives every field the
// dashboard's Overview + Analytics pages expect.

const DAY_MS = 24 * 60 * 60 * 1000
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function computeStats(predictions, { activeModel } = {}) {
  const now = new Date()

  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const totalPredictions = predictions.length
  const todaysUploads = predictions.filter(
    (p) => new Date(p.createdAt) >= startOfDay
  ).length

  // Count + average confidence per mineral.
  const byMineral = new Map()
  let confidenceSum = 0
  let confidenceCount = 0
  for (const p of predictions) {
    if (p.prediction) {
      byMineral.set(p.prediction, (byMineral.get(p.prediction) || 0) + 1)
    }
    if (typeof p.confidence === 'number') {
      confidenceSum += p.confidence
      confidenceCount += 1
    }
  }

  const mineralEntries = [...byMineral.entries()].sort((a, b) => b[1] - a[1])

  // Last 7 days, oldest -> newest.
  const dailyPredictions = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setHours(0, 0, 0, 0)
    dayStart.setTime(dayStart.getTime() - i * DAY_MS)
    const dayEnd = new Date(dayStart.getTime() + DAY_MS)
    const count = predictions.filter((p) => {
      const t = new Date(p.createdAt)
      return t >= dayStart && t < dayEnd
    }).length
    dailyPredictions.push({ day: WEEKDAYS[dayStart.getDay()], count })
  }

  // Last 4 weeks avg confidence (as %), oldest -> newest.
  const accuracyTrend = []
  for (let w = 3; w >= 0; w--) {
    const weekEnd = new Date(now.getTime() - w * 7 * DAY_MS)
    const weekStart = new Date(weekEnd.getTime() - 7 * DAY_MS)
    const inWeek = predictions.filter((p) => {
      const t = new Date(p.createdAt)
      return t >= weekStart && t < weekEnd
    })
    const avg =
      inWeek.length > 0
        ? inWeek.reduce((s, p) => s + (p.confidence || 0), 0) / inWeek.length
        : null
    accuracyTrend.push({
      week: `W${4 - w}`,
      accuracy: avg != null ? Math.round(avg * 1000) / 10 : 0
    })
  }

  const avgConfidence =
    confidenceCount > 0 ? confidenceSum / confidenceCount : null

  return {
    totalPredictions,
    todaysUploads,
    accuracy: avgConfidence != null ? Math.round(avgConfidence * 1000) / 10 : null,
    activeModel: activeModel || 'SqueezeNet1.1 v2.0',
    mineralDistribution: mineralEntries.map(([name, count]) => ({ name, value: count })),
    predictionCounts: mineralEntries.map(([name, count]) => ({ name, count })),
    dailyPredictions,
    accuracyTrend
  }
}
