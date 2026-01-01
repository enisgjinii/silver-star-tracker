import { useState } from 'react'
import { Layout } from "@/components/Layout"
import { Dashboard } from "@/components/Dashboard"
import { PomodoroTimer } from "@/components/PomodoroTimer"
import { Stats } from "@/components/Stats"
import { CalendarView } from "@/components/CalendarView"
import { DataManager } from "@/components/DataManager"
import { Gamification } from "@/components/Gamification"
import { PrivacySettings } from "@/components/PrivacySettings"
import { AICoach } from "@/components/AICoach"
import { IntegrationsManager } from "@/components/IntegrationsManager"
import { TaskManager } from "@/components/TaskManager"
import { ThemeCustomizer } from "@/components/ThemeCustomizer"
import { CustomDashboard } from "@/components/CustomDashboard"
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
        return <PomodoroTimer />
      case 'stats':
        return <Stats />
      case 'data':
        return <DataManager />
      case 'tasks':
        return <TaskManager />
      case 'integrations':
        return <IntegrationsManager />
      case 'achievements':
        return <Gamification />
      case 'settings':
        return <ThemeCustomizer />
      case 'privacy':
        return <PrivacySettings />
      case 'coach':
        return <AICoach />
      case 'custom-dashboard':
        return <CustomDashboard />
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
