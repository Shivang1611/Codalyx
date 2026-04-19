import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [accessToken, setToken]     = useState(null)
  const [isLoading, setIsLoading]   = useState(true)

  // On mount: restore token from sessionStorage and verify
  useEffect(() => {
    console.log('Auth Check Started')
    const token = sessionStorage.getItem('codalyx_access_token')
    if (token) {
      console.log('Token found in session')
      setToken(token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/me')
        .then(res => {
          console.log('User verified')
          setUser(res.data)
        })
        .catch(() => {
          console.log('Verification failed, trying refresh')
          return tryRefresh()
        })
        .finally(() => {
          console.log('Loading finished (token branch)')
          setIsLoading(false)
        })
    } else {
      console.log('No token found, trying refresh')
      tryRefresh().finally(() => {
        console.log('Loading finished (refresh branch)')
        setIsLoading(false)
      })
    }
  }, [])

  async function tryRefresh() {
    try {
      const res   = await api.post('/auth/refresh')
      const token = res.data.accessToken
      sessionStorage.setItem('codalyx_access_token', token)
      setToken(token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const userRes = await api.get('/auth/me')
      setUser(userRes.data)
      console.log('Refresh successful')
    } catch (err) {
      console.log('Refresh failed:', err.message)
      setUser(null)
      setToken(null)
      sessionStorage.removeItem('codalyx_access_token')
    }
  }


  function loginWithGoogle() {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
    const cleanBase = baseUrl.replace(/\/api$/, '') // Remove /api suffix for passport redirect
    window.location.href = `${cleanBase}/api/auth/google`
  }

  function loginWithGitHub() {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
    const cleanBase = baseUrl.replace(/\/api$/, '') // Remove /api suffix for passport redirect
    window.location.href = `${cleanBase}/api/auth/github`
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {})
    sessionStorage.removeItem('codalyx_access_token')
    setUser(null)
    setToken(null)
    delete api.defaults.headers.common['Authorization']
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading,
      loginWithGoogle, loginWithGitHub, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
