import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    if (token) {
      sessionStorage.setItem('codalyx_access_token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Redirect immediately; AuthContext will re-verify on next load via sessionStorage
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return null
}
