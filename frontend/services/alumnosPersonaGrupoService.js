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

export const getAllAlumnosPersonaGrupo = async (filters = {}) => {
	try {
		const params = new URLSearchParams()
		if (filters.id_persona) {
			params.append('id_persona', filters.id_persona)
		}
		if (filters.id_grupo) {
			params.append('id_grupo', filters.id_grupo)
		}
		if (filters.id_centro) {
			params.append('id_centro', filters.id_centro)
		}
		if (filters.estado_curso) {
			params.append('estado_curso', filters.estado_curso)
		}
		
		const queryString = params.toString()
		const url = queryString ? `/api/alumnos-persona-grupo?${queryString}` : '/api/alumnos-persona-grupo'
		
		const response = await apiClient.get(url)
		return response.data
	} catch (error) {
		console.error('Error al obtener los alumnos en grupos:', error)
		throw error
	}
}

export const getAlumnosByGrupo = async (grupoId) => {
	try {
		const response = await apiClient.get(`/api/alumnos-persona-grupo?id_grupo=${grupoId}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener los alumnos del grupo:', error)
		throw error
	}
}

export const getAlumnoPersonaGrupoById = async (id) => {
	try {
		const response = await apiClient.get(`/api/alumnos-persona-grupo/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el alumno en grupo:', error)
		throw error
	}
}

export const createAlumnoPersonaGrupo = async (alumnoData) => {
	try {
		const response = await apiClient.post('/api/alumnos-persona-grupo', alumnoData)
		return response.data
	} catch (error) {
		console.error('Error al crear el alumno en grupo:', error)
		throw error
	}
}

export const updateAlumnoPersonaGrupo = async (id, alumnoData) => {
	try {
		const response = await apiClient.put(`/api/alumnos-persona-grupo/${id}`, alumnoData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar el alumno en grupo:', error)
		throw error
	}
}

export const deleteAlumnoPersonaGrupo = async (id) => {
	try {
		const response = await apiClient.delete(`/api/alumnos-persona-grupo/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar el alumno del grupo:', error)
		throw error
	}
}
