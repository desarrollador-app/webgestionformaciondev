/**
 * Utilidades generales del backend
 */

/**
 * Obtiene el nombre de un usuario por su Azure ID usando Microsoft Graph
 * @param {string} azureId - ID de Azure del usuario
 * @returns {Promise<string>} Nombre del usuario o '-'
 */
const getUsuarioNombre = async (azureId) => {
    if (!azureId) return '-'
    
    try {
        const axios = require('axios')
        const { getApplicationAccessToken } = require('../controllers/msGraphController')
        
        // Obtener token de aplicación
        const accessToken = await getApplicationAccessToken()
        
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
        
        // Obtener información del usuario por su ID
        const graphUrl = `https://graph.microsoft.com/v1.0/users/${azureId}`
        
        const response = await axios.get(graphUrl, { headers })
        
        return response.data.displayName || `ID: ${azureId}`
        
    } catch (error) {
        console.error('Error obteniendo nombre de usuario:', error)
        return `ID: ${azureId}`
    }
}

/**
 * Trunca un string a una longitud máxima según el tipo de campo XSD
 * @param {string|number} value - Valor a truncar
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {string} String truncado o vacío si no hay valor
 */
const truncateString = (value, maxLength) => {
    if (!value) return '';
    const str = String(value);
    return str.length > maxLength ? str.substring(0, maxLength) : str;
}

module.exports = {
    getUsuarioNombre,
    truncateString
}
