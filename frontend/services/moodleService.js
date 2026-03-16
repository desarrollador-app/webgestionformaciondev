import axios from 'axios'

const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3000' 
  : window.location.origin

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000, // Aumentado para operaciones de Moodle
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
})

/**
 * Matricula todos los alumnos de un grupo en Moodle
 * @param {number} grupoId - ID del grupo
 * @returns {Promise<Object>} - Resultado de la matriculación
 */
export const matricularAlumnosGrupo = async (grupoId) => {
	try {
		const response = await apiClient.post(`/api/moodle/grupo/${grupoId}/matricular-alumnos`)
		return response.data
	} catch (error) {
		console.error('Error al matricular alumnos del grupo:', error)
		throw error
	}
}

/**
 * Matricula un alumno específico en Moodle
 * @param {number} alumnoId - ID del alumno
 * @returns {Promise<Object>} - Resultado de la matriculación
 */
export const matricularAlumnoIndividual = async (alumnoId) => {
	try {
		const response = await apiClient.post(`/api/moodle/alumno/${alumnoId}/matricular`)
		return response.data
	} catch (error) {
		console.error('Error al matricular alumno individual:', error)
		throw error
	}
}

/**
 * Verifica la configuración de Moodle para un grupo
 * @param {number} grupoId - ID del grupo
 * @returns {Promise<Object>} - Configuración de Moodle
 */
export const verificarConfiguracionMoodle = async (grupoId) => {
	try {
		const response = await apiClient.get(`/api/moodle/grupo/${grupoId}/configuracion`)
		return response.data
	} catch (error) {
		console.error('Error al verificar configuración de Moodle:', error)
		throw error
	}
}

/**
 * Obtiene las credenciales generadas para un NIF
 * @param {string} nif - NIF del alumno
 * @returns {Promise<Object>} - Credenciales generadas
 */
export const obtenerCredencialesMoodle = async (nif) => {
	try {
		const response = await apiClient.get(`/api/moodle/credenciales/${encodeURIComponent(nif)}`)
		return response.data
	} catch (error) {
		console.error('Error al obtener credenciales de Moodle:', error)
		throw error
	}
}
