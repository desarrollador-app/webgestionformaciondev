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

export const getAllGrupos = async (filters = {}) => {
	try {
		const queryParams = new URLSearchParams()
		queryParams.append('include', 'accionFormativa.plan')
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				queryParams.append(key, value)
			}
		})
		
		const response = await apiClient.get(`/api/grupos?${queryParams.toString()}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener los grupos:', error)
		throw error
	}
}

export const getGrupoById = async (id) => {
	try {
		const response = await apiClient.get(`/api/grupos/${id}?include=accionFormativa.plan`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el grupo:', error)
		throw error
	}
}

export const createGrupo = async (grupoData) => {
	try {
		const response = await apiClient.post('/api/grupos', grupoData)
		return response.data
	} catch (error) {
		console.error('Error al crear el grupo:', error)
		throw error
	}
}

export const updateGrupo = async (id, grupoData) => {
	try {
		const response = await apiClient.put(`/api/grupos/${id}`, grupoData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar el grupo:', error)
		throw error
	}
}

export const deleteGrupo = async (id) => {
	try {
		const response = await apiClient.delete(`/api/grupos/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar el grupo:', error)
		throw error
	}
}

export const getNextGroupCode = async (idAccion) => {
	try {
		const response = await apiClient.get(`/api/grupos/next-code/${idAccion}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el siguiente código de grupo:', error)
		throw error
	}
}