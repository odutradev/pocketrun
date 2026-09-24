import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ManagerUser } from '../services/api'
import { fetchManagerMe } from '../services/api'

interface AuthContextType {
  user: ManagerUser | null
  token: string | null
  loading: boolean
  login: (token: string, user: ManagerUser) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ManagerUser | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('pocketrun_manager_token'))
  const [loading, setLoading] = useState<boolean>(true)

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('pocketrun_manager_token')
    if (!savedToken) {
      setUser(null)
      setToken(null)
      setLoading(false)
      return
    }

    try {
      const u = await fetchManagerMe()
      setUser(u)
      setToken(savedToken)
    } catch {
      localStorage.removeItem('pocketrun_manager_token')
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = (newToken: string, newUser: ManagerUser) => {
    localStorage.setItem('pocketrun_manager_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('pocketrun_manager_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
