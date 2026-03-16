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

export const getAllCostesGrupo = async (filters = {}) => {
	try {
		const queryParams = new URLSearchParams()
		queryParams.append('include', 'grupo.accionFormativa.plan')
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				queryParams.append(key, value)
			}
		})
		
		const response = await apiClient.get(`/api/costes-grupo?${queryParams.toString()}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener los costes de grupo:', error)
		throw error
	}
}

export const getCosteGrupoById = async (id) => {
	try {
		const response = await apiClient.get(`/api/costes-grupo/${id}?include=grupo.accionFormativa.plan`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el coste de grupo:', error)
		throw error
	}
}

export const getCostesByGrupo = async (idGrupo) => {
	try {
		const response = await apiClient.get(`/api/costes-grupo/grupo/${idGrupo}?include=grupo.accionFormativa.plan`)
		return response.data
	} catch (error) {
		console.error('Error al obtener los costes por grupo:', error)
		throw error
	}
}

export const createCosteGrupo = async (costeData) => {
	try {
		const response = await apiClient.post('/api/costes-grupo', costeData)
		return response.data
	} catch (error) {
		console.error('Error al crear el coste de grupo:', error)
		throw error
	}
}

export const updateCosteGrupo = async (id, costeData) => {
	try {
		const response = await apiClient.put(`/api/costes-grupo/${id}`, costeData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar el coste de grupo:', error)
		throw error
	}
}

export const deleteCosteGrupo = async (id) => {
	try {
		await apiClient.delete(`/api/costes-grupo/${id}`)
		return true
	} catch (error) {
		console.error('Error al eliminar el coste de grupo:', error)
		throw error
	}
}
