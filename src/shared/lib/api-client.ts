import axios from 'axios'
import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nquoc.vn'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: gắn Bearer JWT từ Supabase session
apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: redirect về nquoc.vn/login nếu 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = 'https://nquoc.vn/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
