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

export const getAllPersonas = async (filters = {}) => {
	try {
		const params = new URLSearchParams()
		if (filters.es_docente !== undefined) {
			params.append('es_docente', filters.es_docente)
		}
		if (filters.es_alumno !== undefined) {
			params.append('es_alumno', filters.es_alumno)
		}
		
		const queryString = params.toString()
		const url = queryString ? `/api/personas?${queryString}` : '/api/personas'
		
		const response = await apiClient.get(url)
		return response.data
	} catch (error) {
		console.error('Error al obtener las personas:', error)
		throw error
	}
}

export const getPersonaById = async (id) => {
	try {
		const response = await apiClient.get(`/api/personas/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener la persona:', error)
		throw error
	}
}

export const createPersona = async (personaData) => {
	try {
		const response = await apiClient.post('/api/personas', personaData)
		return response.data
	} catch (error) {
		console.error('Error al crear la persona:', error)
		throw error
	}
}

export const updatePersona = async (id, personaData) => {
	try {
		const response = await apiClient.put(`/api/personas/${id}`, personaData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar la persona:', error)
		throw error
	}
}

export const deletePersona = async (id) => {
	try {
		const response = await apiClient.delete(`/api/personas/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar la persona:', error)
		throw error
	}
}

export const importarPersonasExcel = async (file) => {
	try {
		const formData = new FormData()
		formData.append('excelFile', file)

		const response = await apiClient.post('/api/personas/importar-excel', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			timeout: 300000 // 5 minutos para archivos grandes
		})
		return response.data
	} catch (error) {
		console.error('Error al importar Excel:', error)
		throw error
	}
}