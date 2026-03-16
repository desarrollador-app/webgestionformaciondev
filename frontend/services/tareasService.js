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

export const getAllTareas = async (params = {}) => {
	try {
		const response = await apiClient.get('/api/tareas', { params })
		return response.data
	} catch (error) {
		console.error('Error al obtener las tareas:', error)
		throw error
	}
}

export const getTareaById = async (id) => {
	try {
		const response = await apiClient.get(`/api/tareas/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener la tarea:', error)
		throw error
	}
}

export const createTarea = async (tareaData) => {
	try {
		const response = await apiClient.post('/api/tareas', tareaData)
		return response.data
	} catch (error) {
		console.error('Error al crear la tarea:', error)
		throw error
	}
}

export const createDefaultGrupoTareas = async (id_grupo) => {
	try {
		const response = await apiClient.post('/api/tareas/default', { id_grupo })
		return response.data
	} catch (error) {
		console.error('Error al crear las tareas por defecto:', error)
		throw error
	}
}

export const updateTarea = async (id, tareaData) => {
	try {
		const response = await apiClient.put(`/api/tareas/${id}`, tareaData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar la tarea:', error)
		throw error
	}
}

export const completeTarea = async (id) => {
	try {
		const response = await apiClient.patch(`/api/tareas/${id}/complete`)
		return response.data
	} catch (error) {
		console.error('Error al completar la tarea:', error)
		throw error
	}
}

export const deleteTarea = async (id) => {
	try {
		const response = await apiClient.delete(`/api/tareas/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar la tarea:', error)
		throw error
	}
}
