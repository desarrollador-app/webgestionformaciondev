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

export const getAllDiasImparticionPresencial = async (filters = {}) => {
	try {
		const queryParams = new URLSearchParams()
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				queryParams.append(key, value)
			}
		})
		
		const response = await apiClient.get(`/api/dias-imparticion-grupo-presencial?${queryParams.toString()}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener los días de impartición presenciales:', error)
		throw error
	}
}

export const getDiaImparticionPresencialById = async (id) => {
	try {
		const response = await apiClient.get(`/api/dias-imparticion-grupo-presencial/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el día de impartición presencial:', error)
		throw error
	}
}

export const createDiaImparticionPresencial = async (diaData) => {
	try {
		const response = await apiClient.post('/api/dias-imparticion-grupo-presencial', diaData)
		return response.data
	} catch (error) {
		console.error('Error al crear el día de impartición presencial:', error)
		throw error
	}
}

export const updateDiaImparticionPresencial = async (id, diaData) => {
	try {
		const response = await apiClient.put(`/api/dias-imparticion-grupo-presencial/${id}`, diaData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar el día de impartición presencial:', error)
		throw error
	}
}

export const deleteDiaImparticionPresencial = async (id) => {
	try {
		const response = await apiClient.delete(`/api/dias-imparticion-grupo-presencial/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar el día de impartición presencial:', error)
		throw error
	}
}
