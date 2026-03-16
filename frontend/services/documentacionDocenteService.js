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

export const getAllDocumentacionDocente = async (filters = {}) => {
	try {
		const params = new URLSearchParams()
		if (filters.id_persona) {
			params.append('id_persona', filters.id_persona)
		}
		if (filters.tipo_documento) {
			params.append('tipo_documento', filters.tipo_documento)
		}
		
		const queryString = params.toString()
		const url = queryString ? `/api/documentacion-docente-persona?${queryString}` : '/api/documentacion-docente-persona'
		
		const response = await apiClient.get(url)
		return response.data
	} catch (error) {
		console.error('Error al obtener la documentación del docente:', error)
		throw error
	}
}

export const getDocumentoById = async (id) => {
	try {
		const response = await apiClient.get(`/api/documentacion-docente-persona/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el documento:', error)
		throw error
	}
}

export const createDocumento = async (documentoData) => {
	try {
		const formData = new FormData()
		formData.append('id_persona', documentoData.id_persona)
		formData.append('tipo_documento', documentoData.tipo_documento)
		formData.append('observaciones', documentoData.observaciones || '')
		formData.append('archivo', documentoData.archivo)

		const response = await apiClient.post('/api/documentacion-docente-persona', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		return response.data
	} catch (error) {
		console.error('Error al crear el documento:', error)
		throw error
	}
}

export const updateDocumento = async (id, documentoData) => {
	try {
		const response = await apiClient.put(`/api/documentacion-docente-persona/${id}`, documentoData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar el documento:', error)
		throw error
	}
}

export const deleteDocumento = async (id) => {
	try {
		const response = await apiClient.delete(`/api/documentacion-docente-persona/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar el documento:', error)
		throw error
	}
}

export const getSignedUrl = async (id) => {
	try {
		const response = await apiClient.get(`/api/documentacion-docente-persona/${id}/signed-url`)
		return response.data
	} catch (error) {
		console.error('Error al obtener URL firmada:', error)
		throw error
	}
}
