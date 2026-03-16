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

export const getAllAccionesFormativas = async (filters = {}) => {
	try {
		const queryParams = new URLSearchParams()
		queryParams.append('include', 'plan')
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				queryParams.append(key, value)
			}
		})
		
		const url = `/api/acciones-formativas?${queryParams.toString()}`		
		const response = await apiClient.get(url)
		return response.data
	} catch (error) {
		console.error('Error al obtener las acciones formativas:', error)
		throw error
	}
}

export const getAccionFormativaById = async (id) => {
	try {
		const response = await apiClient.get(`/api/acciones-formativas/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener la acción formativa:', error)
		throw error
	}
}

export const checkNumeroAccionExistsInPlan = async (numeroAccion, idPlan) => {
	try {
		const response = await apiClient.get(`/api/acciones-formativas?numero_accion=${numeroAccion}&id_plan=${idPlan}&exact_match=true`)
		return response.data.length > 0
	} catch (error) {
		console.error('Error al verificar número de acción:', error)
		return false
	}
}

export const createAccionFormativa = async (accionData) => {
	try {
		const response = await apiClient.post('/api/acciones-formativas', accionData)
		return response.data
	} catch (error) {
		console.error('Error al crear la acción formativa:', error)
		// Re-lanzar el error con información más detallada
		if (error.response?.data) {
			throw {
				...error,
				message: error.response.data.error || 'Error al crear la acción formativa',
				details: error.response.data.details || []
			}
		}
		throw error
	}
}

export const updateAccionFormativa = async (id, accionData) => {
	try {
		const response = await apiClient.put(`/api/acciones-formativas/${id}`, accionData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar la acción formativa:', error)
		// Re-lanzar el error con información más detallada
		if (error.response?.data) {
			throw {
				...error,
				message: error.response.data.error || 'Error al actualizar la acción formativa',
				details: error.response.data.details || []
			}
		}
		throw error
	}
}

export const deleteAccionFormativa = async (id) => {
	try {
		const response = await apiClient.delete(`/api/acciones-formativas/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar la acción formativa:', error)
		throw error
	}
}
