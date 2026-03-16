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

export const getAllCentrosTrabajo = async (idEmpresa = null) => {
	try {
		const params = idEmpresa ? { id_empresa: idEmpresa } : {}
		const response = await apiClient.get('/api/centros-trabajo', { params })
		return response.data
	} catch (error) {
		console.error('Error al obtener los centros de trabajo:', error)
		throw error
	}
}

export const getCentroTrabajoById = async (id) => {
	try {
		const response = await apiClient.get(`/api/centros-trabajo/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el centro de trabajo:', error)
		throw error
	}
}

export const createCentroTrabajo = async (centroData) => {
	try {
		const response = await apiClient.post('/api/centros-trabajo', centroData)
		return response.data
	} catch (error) {
		console.error('Error al crear el centro de trabajo:', error)
		throw error
	}
}

export const updateCentroTrabajo = async (id, centroData) => {
	try {
		const response = await apiClient.put(`/api/centros-trabajo/${id}`, centroData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar el centro de trabajo:', error)
		throw error
	}
}

export const deleteCentroTrabajo = async (id) => {
	try {
		const response = await apiClient.delete(`/api/centros-trabajo/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar el centro de trabajo:', error)
		throw error
	}
}
