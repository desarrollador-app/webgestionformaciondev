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

export const getAllPlans = async () => {
	try {
		const response = await apiClient.get('/api/planes')
		return response.data
	} catch (error) {
		console.error('Error al obtener los planes:', error)
		throw error
	}
}

export const getPlanById = async (id) => {
	try {
		const response = await apiClient.get(`/api/planes/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener el plan:', error)
		throw error
	}
}

export const createPlan = async (planData) => {
	try {
		const response = await apiClient.post('/api/planes', planData)
		return response.data
	} catch (error) {
		console.error('Error al crear el plan:', error)
		throw error
	}
}

export const updatePlan = async (id, planData) => {
	try {
		const response = await apiClient.put(`/api/planes/${id}`, planData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar el plan:', error)
		throw error
	}
}

export const deletePlan = async (id) => {
	try {
		const response = await apiClient.delete(`/api/planes/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar el plan:', error)
		throw error
	}
}