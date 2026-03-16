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

export const getAllDesgloseAreasProfesionales = async (idArea = null) => {
	try {
		const params = idArea ? { id_area: idArea } : {}
		const response = await apiClient.get('/api/desglose-areas-profesionales', { params })
		return response.data
	} catch (error) {
		console.error('Error al obtener los desgloses de áreas profesionales:', error)
		throw error
	}
}

export const getDesgloseById = async (id) => {
	try {
		const response = await apiClient.get(`/api/desglose-areas-profesionales/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el desglose:', error)
		throw error
	}
}
