import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true'
  })
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated)
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
  }, [isAuthenticated, currentUser])

  const login = (username, password) => {
    // Simple mock authentication
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find((u) => u.username === username && u.password === password)
    
    if (user) {
      setIsAuthenticated(true)
      setCurrentUser({ username: user.username, email: user.email })
      return true
    }
    return false
  }

  const register = (username, email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // Check if user already exists
    if (users.some((u) => u.username === username)) {
      return false
    }

    users.push({ username, email, password })
    localStorage.setItem('users', JSON.stringify(users))
    
    setIsAuthenticated(true)
    setCurrentUser({ username, email })
    return true
  }

  const logout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
  }

  const updateUser = (updates) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const userIndex = users.findIndex((u) => u.username === currentUser.username)
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem('users', JSON.stringify(users))
      setCurrentUser({ ...currentUser, ...updates })
      return true
    }
    return false
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

