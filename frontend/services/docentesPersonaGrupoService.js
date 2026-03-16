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

export const getAllDocentesPersonaGrupo = async (filters = {}) => {
	try {
		const params = new URLSearchParams()
		if (filters.id_persona) {
			params.append('id_persona', filters.id_persona)
		}
		if (filters.id_grupo) {
			params.append('id_grupo', filters.id_grupo)
		}
		if (filters.tutoria !== undefined) {
			params.append('tutoria', filters.tutoria)
		}
		
		const queryString = params.toString()
		const url = queryString ? `/api/docentes-persona-grupo?${queryString}` : '/api/docentes-persona-grupo'
		
		const response = await apiClient.get(url)
		return response.data
	} catch (error) {
		console.error('Error al obtener los docentes en grupos:', error)
		throw error
	}
}

export const getDocentesByGrupo = async (grupoId, modalidad = null) => {
	try {
		let url = `/api/docentes-persona-grupo?id_grupo=${grupoId}`
		if (modalidad) {
			url += `&modalidad=${modalidad}`
		}
		const response = await apiClient.get(url)
		return response.data
	} catch (error) {
		console.error('Error al obtener los docentes del grupo:', error)
		throw error
	}
}

export const getDocentePersonaGrupoById = async (id) => {
	try {
		const response = await apiClient.get(`/api/docentes-persona-grupo/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el docente en grupo:', error)
		throw error
	}
}

export const createDocentePersonaGrupo = async (docenteData) => {
	try {
		const response = await apiClient.post('/api/docentes-persona-grupo', docenteData)
		return response.data
	} catch (error) {
		console.error('Error al crear el docente en grupo:', error)
		throw error
	}
}

export const updateDocentePersonaGrupo = async (id, docenteData) => {
	try {
		const response = await apiClient.put(`/api/docentes-persona-grupo/${id}`, docenteData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar el docente en grupo:', error)
		throw error
	}
}

export const deleteDocentePersonaGrupo = async (id) => {
	try {
		const response = await apiClient.delete(`/api/docentes-persona-grupo/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar el docente del grupo:', error)
		throw error
	}
}

export const getDocentesConHoras = async (filters = {}) => {
	try {
		const params = new URLSearchParams()
		if (filters.id_grupo) {
			params.append('id_grupo', filters.id_grupo)
		}
		if (filters.id_persona) {
			params.append('id_persona', filters.id_persona)
		}
		if (filters.modalidad) {
			params.append('modalidad', filters.modalidad)
		}
		
		const queryString = params.toString()
		const url = queryString ? `/api/docentes-persona-grupo/horas?${queryString}` : '/api/docentes-persona-grupo/horas'
		
		const response = await apiClient.get(url)
		return response.data
	} catch (error) {
		console.error('Error al obtener los docentes con horas:', error)
		throw error
	}
}

export const getDocentesGrupoConHoras = async (grupoId, modalidad = null) => {
	try {
		let url = `/api/docentes-persona-grupo/grupo/${grupoId}/horas`
		if (modalidad) {
			url += `?modalidad=${modalidad}`
		}
		const response = await apiClient.get(url)
		return response.data
	} catch (error) {
		console.error('Error al obtener los docentes del grupo con horas:', error)
		throw error
	}
}