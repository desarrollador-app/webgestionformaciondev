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

export const getAllAreasProfesionales = async () => {
	try {
		const response = await apiClient.get('/api/areas-profesionales')
		return response.data
	} catch (error) {
		console.error('Error al obtener las áreas profesionales:', error)
		throw error
	}
}

export const getAreasProfesionalesConDesgloses = async () => {
	try {
		const response = await apiClient.get('/api/areas-profesionales/con-desgloses')
		return response.data
	} catch (error) {
		console.error('Error al obtener las áreas profesionales con desgloses:', error)
		throw error
	}
}

export const getAreaProfesionalById = async (id) => {
	try {
		const response = await apiClient.get(`/api/areas-profesionales/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el área profesional:', error)
		throw error
	}
}
