import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import { SkeletonCard } from './components/Skeleton'

const Overview = lazy(() => import('./pages/Overview'))
const MineralDetection = lazy(() => import('./pages/MineralDetection'))
const CompareImages = lazy(() => import('./pages/CompareImages'))
const Analytics = lazy(() => import('./pages/Analytics'))
const PredictionHistory = lazy(() => import('./pages/PredictionHistory'))
const ModelManagement = lazy(() => import('./pages/ModelManagement'))
const ApiHealth = lazy(() => import('./pages/ApiHealth'))
const Settings = lazy(() => import('./pages/Settings'))
const WeighbridgeCheck = lazy(() => import('./pages/WeighbridgeCheck'))

function PageFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Suspense fallback={<PageFallback />}><Overview /></Suspense>} />
        <Route path="/detect" element={<Suspense fallback={<PageFallback />}><MineralDetection /></Suspense>} />
        <Route path="/compare" element={<Suspense fallback={<PageFallback />}><CompareImages /></Suspense>} />
        <Route path="/analytics" element={<Suspense fallback={<PageFallback />}><Analytics /></Suspense>} />
        <Route path="/history" element={<Suspense fallback={<PageFallback />}><PredictionHistory /></Suspense>} />
        <Route path="/model" element={<Suspense fallback={<PageFallback />}><ModelManagement /></Suspense>} />
        <Route path="/health" element={<Suspense fallback={<PageFallback />}><ApiHealth /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageFallback />}><Settings /></Suspense>} />
        <Route path="/weighbridge" element={<Suspense fallback={<PageFallback />}><WeighbridgeCheck /></Suspense>} />
      </Route>
    </Routes>
  )
}