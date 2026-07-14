import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import OnboardingCoachMark from '../components/OnboardingCoachMark'
import { PageTransition } from '../components/motion'

const titles = {
  '/': ['Overview', 'Live snapshot of everything the model has seen today'],
  '/detect': ['Identify Mineral', 'Upload a sample image and run live inference'],
  '/compare': ['Compare Samples', 'Run two images through the model side by side'],
  '/analytics': ['Analytics', 'Trends across predictions, minerals and accuracy'],
  // '/history': ['Prediction History', 'Every inference the platform has recorded'],
  // '/model': ['Model Management', 'Swap the active model without touching the frontend'],
  // '/health': ['API Health', 'Live status of the inference service'],
  // '/settings': ['Settings', 'Preferences for this workspace']
}

export default function DashboardLayout() {
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [title, subtitle] = titles[pathname] || ['MineralVision', '']

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto crystal-bg p-4 sm:p-6">
          <PageTransition key={pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <OnboardingCoachMark />
    </div>
  )
}
