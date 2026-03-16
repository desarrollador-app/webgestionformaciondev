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

export const getAllSesiones = async (filters = {}) => {
	try {
		const queryParams = new URLSearchParams()
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				queryParams.append(key, value)
			}
		})
		
		const response = await apiClient.get(`/api/sesiones?${queryParams.toString()}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener las sesiones:', error)
		throw error
	}
}

export const getSesionById = async (id) => {
	try {
		const response = await apiClient.get(`/api/sesiones/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener la sesión:', error)
		throw error
	}
}

export const createSesion = async (sesionData) => {
	try {
		const response = await apiClient.post('/api/sesiones', sesionData)
		return response.data
	} catch (error) {
		console.error('Error al crear la sesión:', error)
		throw error
	}
}

export const updateSesion = async (id, sesionData) => {
	try {
		const response = await apiClient.put(`/api/sesiones/${id}`, sesionData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar la sesión:', error)
		throw error
	}
}

export const deleteSesion = async (id) => {
	try {
		const response = await apiClient.delete(`/api/sesiones/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar la sesión:', error)
		throw error
	}
}

export const getHorasTotalesGrupo = async (id_grupo, modalidad) => {
	try {
		const response = await apiClient.get(`/api/sesiones/horas-totales?id_grupo=${id_grupo}&modalidad=${modalidad}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener las horas totales del grupo:', error)
		throw error
	}
}