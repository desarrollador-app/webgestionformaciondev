import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3000' 
  : window.location.origin

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
})

/**
 * Interceptor para manejar errores de autenticación
 * Si el token ha expirado, no es válido, no está presente, redirigir al login.
 * Para otros errores 401, también redirigir al login.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      console.log('Sesión expirada o usuario no autenticado, redirigiendo al login')
      await authStore.logout()
    }
  }
)

export { apiClient }