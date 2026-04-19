import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && envUrl.includes('onrender.com')) return envUrl
  
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return 'https://codalyx.onrender.com/api'
  }
  return envUrl || 'http://localhost:4000/api'
}

const api = axios.create({ 
  baseURL: getBaseURL(), 
  withCredentials: true 
})

// Response interceptor: on 401 try silent refresh once
let isRefreshing = false
let queue = []

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry && !original.url.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          queue.push({ resolve, reject })
        ).then(token => {
          original.headers['Authorization'] = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        const res   = await api.post('/auth/refresh')
        const token = res.data.accessToken
        sessionStorage.setItem('codalyx_access_token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        queue.forEach(p => p.resolve(token))
        queue = []
        original.headers['Authorization'] = `Bearer ${token}`
        return api(original)
      } catch (refreshErr) {
        queue.forEach(p => p.reject(refreshErr))
        queue = []
        sessionStorage.removeItem('codalyx_access_token')
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
