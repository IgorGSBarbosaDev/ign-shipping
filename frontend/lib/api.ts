import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(error)
    }

    const { status, data } = error.response

    if (status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      return Promise.reject(error)
    }

    if (status === 422) {
      // Return formatted validation errors
      const validationErrors: Record<string, string[]> = {}
      if (data?.errors && Array.isArray(data.errors)) {
        for (const err of data.errors) {
          const field = err.field || 'general'
          if (!validationErrors[field]) {
            validationErrors[field] = []
          }
          validationErrors[field].push(err.message || 'Erro de validação')
        }
      }
      return Promise.reject({ ...error, validationErrors })
    }

    return Promise.reject(error)
  }
)

export default api
