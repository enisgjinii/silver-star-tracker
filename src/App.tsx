import { useState } from 'react'
import { Layout } from "@/components/Layout"
import { Dashboard } from "@/components/Dashboard"
import { FocusMode } from "@/components/FocusMode"
import { Stats } from "@/components/Stats"
import { CalendarView } from "@/components/CalendarView"
import { DataManager } from "@/components/DataManager"
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'calendar':
        return <CalendarView />
      case 'focus':
        return <FocusMode />
      case 'stats':
        return <Stats />
      case 'data':
        return <DataManager />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  )
}

export default App
