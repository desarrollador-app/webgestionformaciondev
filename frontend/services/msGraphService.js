import axios from 'axios'

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
 * Obtiene la lista de usuarios de un grupo específico de Azure AD
 * @returns {Promise<Object>} Respuesta con los usuarios del grupo
 */
export const getGroupUsers = async () => {
	try {
		const response = await apiClient.get('/api/ms-graph/group-users')
		return response.data
	} catch (error) {
		console.error('Error al obtener usuarios del grupo:', error)
		throw error
	}
}
