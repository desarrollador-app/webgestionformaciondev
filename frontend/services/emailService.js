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

// Cliente específico para emails de diploma con timeout extendido
const diplomaApiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 120000, // 2 minutos para generación de diplomas
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
})

/**
 * Servicio para manejo de emails
 */
export const emailService = {
  /**
   * Obtiene los alumnos de un grupo con su estado de emails
   * @param {number} idGrupo - ID del grupo
   * @param {string} tipoEmail - Tipo de email ('diploma' o 'bienvenida')
   * @returns {Promise<Object>} - Datos de alumnos con estado de emails
   */
  async getGroupStudentsWithEmailStatus(idGrupo, tipoEmail = null) {
    try {
      const params = tipoEmail ? { tipoEmail } : {}
      const response = await apiClient.get(`/api/emails/group/${idGrupo}/students`, { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener alumnos con estado de emails:', error)
      throw error
    }
  },

  /**
   * Envía email de bienvenida a un alumno
   * @param {Object} data - Datos del email
   * @param {number} data.idGrupo - ID del grupo
   * @param {number} data.idPersona - ID de la persona
   * @param {string} data.email - Email del destinatario
   * @param {string} data.nombre - Nombre del destinatario
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendWelcomeEmail(data) {
    try {
      const response = await apiClient.post('/api/emails/send/welcome', data)
      return response.data
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error)
      throw error
    }
  },

  /**
   * Envía email de diploma a un alumno
   * @param {Object} data - Datos del email
   * @param {number} data.idGrupo - ID del grupo
   * @param {number} data.idPersona - ID de la persona
   * @param {string} data.email - Email del destinatario
   * @param {string} data.nombre - Nombre del destinatario
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendDiplomaEmail(data) {
    try {
      const response = await diplomaApiClient.post('/api/emails/send/diploma', data)
      return response.data
    } catch (error) {
      console.error('Error al enviar email de diploma:', error)
      throw error
    }
  },

  /**
   * Obtiene el historial de emails enviados
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} - Historial de emails
   */
  async getEmailLogs(filters = {}) {
    try {
      const response = await apiClient.get('/api/emails/logs', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error al obtener logs de emails:', error)
      throw error
    }
  },

  /**
   * Obtiene estadísticas de emails por grupo
   * @param {number} idGrupo - ID del grupo
   * @returns {Promise<Object>} - Estadísticas del grupo
   */
  async getEmailStatsByGroup(idGrupo) {
    try {
      const response = await apiClient.get(`/api/emails/stats/group/${idGrupo}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas de emails:', error)
      throw error
    }
  },

  /**
   * Obtiene estadísticas de emails por persona
   * @param {number} idPersona - ID de la persona
   * @returns {Promise<Object>} - Estadísticas de la persona
   */
  async getEmailStatsByPerson(idPersona) {
    try {
      const response = await apiClient.get(`/api/emails/stats/person/${idPersona}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas de emails:', error)
      throw error
    }
  },

  /**
   * Descarga un diploma generado para un alumno
   * @param {number} idGrupo - ID del grupo
   * @param {number} idPersona - ID de la persona
   * @returns {Promise<Object>} - URL de descarga del diploma
   */
  async downloadDiploma(idGrupo, idPersona) {
    try {
      const response = await apiClient.get(`/api/emails/diploma/${idGrupo}/${idPersona}`)
      return response.data
    } catch (error) {
      console.error('Error al descargar diploma:', error)
      throw error
    }
  }
}
