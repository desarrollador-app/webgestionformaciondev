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

export const getAllEmpresas = async () => {
	try {
		const response = await apiClient.get('/api/empresas')
		return response.data
	} catch (error) {
		console.error('Error al obtener las empresas:', error)
		throw error
	}
}

export const getEmpresaById = async (id) => {
	try {
		const response = await apiClient.get(`/api/empresas/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener la empresa:', error)
		throw error
	}
}

export const createEmpresa = async (empresaData) => {
	try {
		const response = await apiClient.post('/api/empresas', empresaData)
		return response.data
	} catch (error) {
		console.error('Error al crear la empresa:', error)
		throw error
	}
}

export const updateEmpresa = async (id, empresaData) => {
	try {
		const response = await apiClient.put(`/api/empresas/${id}`, empresaData)
		return response.data
	} catch (error) {
		console.error('Error al actualizar la empresa:', error)
		throw error
	}
}

export const deleteEmpresa = async (id) => {
	try {
		const response = await apiClient.delete(`/api/empresas/${id}`)
		return response.data
	} catch (error) {
		console.error('Error al eliminar la empresa:', error)
		throw error
	}
}