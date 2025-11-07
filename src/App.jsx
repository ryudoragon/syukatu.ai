import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Home, Building2, Mail, Map, Settings, Moon, Sun, Menu, X, CheckSquare, LogOut, User, Scale } from 'lucide-react'
import './App.css'

// Pages
import HomePage from './pages/HomePage'
import CompanyPage from './pages/CompanyPage'
import EmailGeneratorPage from './pages/EmailGeneratorPage'
import RoadmapPage from './pages/RoadmapPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import TaskPage from './pages/TaskPage'

// Context for theme and auth
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'

// Components
import { TextLogo } from './components/Logo'

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { logout, currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { icon: Home, label: 'ホーム', path: '/' },
    { icon: Building2, label: '企業情報', path: '/company' },
    { icon: CheckSquare, label: 'タスク', path: '/tasks' },
    { icon: Mail, label: 'メール生成', path: '/email' },
    { icon: Map, label: 'ロードマップ', path: '/roadmap' },
    { icon: Settings, label: '設定', path: '/settings' },
  ]

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full py-4">
        {/* Logo/Title */}
        <div className="px-4 mb-8 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <TextLogo className={`transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className={`whitespace-nowrap transition-opacity ${
                    isExpanded ? 'opacity-100' : 'opacity-0 w-0'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* User Info */}
        {currentUser && (
          <div className="px-2 mb-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/30">
              <User className="w-5 h-5 flex-shrink-0 text-sidebar-accent-foreground" />
              <span
                className={`whitespace-nowrap transition-opacity text-sm font-medium text-sidebar-accent-foreground ${
                  isExpanded ? 'opacity-100' : 'opacity-0 w-0'
                }`}
              >
                {currentUser.username}
              </span>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <div className="px-2 mb-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            <span
              className={`whitespace-nowrap transition-opacity ${
                isExpanded ? 'opacity-100' : 'opacity-0 w-0'
              }`}
            >
              {theme === 'dark' ? 'ライト' : 'ダーク'}
            </span>
          </button>
        </div>

        {/* Logout */}
        <div className="px-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span
              className={`whitespace-nowrap transition-opacity ${
                isExpanded ? 'opacity-100' : 'opacity-0 w-0'
              }`}
            >
              ログアウト
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-16 transition-all duration-300 min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/company/:id" element={<CompanyPage />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/email" element={<EmailGeneratorPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App

