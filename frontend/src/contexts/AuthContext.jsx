import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hl_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('hl_token')
    if (token) {
      authAPI.me()
        .then(res => { setUser(res.data.user); saveUser(res.data.user) })
        .catch(() => { logout() })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const saveUser = (u) => localStorage.setItem('hl_user', JSON.stringify(u))

  const login = async (data) => {
    const res = await authAPI.login(data)
    localStorage.setItem('hl_token', res.data.token)
    saveUser(res.data.user)
    setUser(res.data.user)
    return res.data
  }

  const signup = async (data) => {
    const res = await authAPI.signup(data)
    localStorage.setItem('hl_token', res.data.token)
    saveUser(res.data.user)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('hl_token')
    localStorage.removeItem('hl_user')
    setUser(null)
  }

  const updateUser = (updated) => {
    setUser(updated)
    saveUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
