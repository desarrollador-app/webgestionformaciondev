/**
 * Utilidades para formateo de fechas en el backend
 */

/**
 * Convierte una fecha en formato ISO (2024-06-30T00:00:00.000Z) a formato dd/mm/yyyy
 * @param {string|Date} date - Fecha en formato ISO o objeto Date
 * @param {string} fallback - Texto a mostrar si la fecha es inválida (por defecto: '')
 * @returns {string} Fecha formateada como dd/mm/yyyy
 */
const formatDateToDDMMYYYY = (date, fallback = '') => {
    if (!date) return fallback
    
    try {
        // Crear objeto Date si es string
        const dateObj = typeof date === 'string' ? new Date(date) : date
        
        // Verificar que la fecha es válida
        if (isNaN(dateObj.getTime())) {
            console.warn('Fecha inválida para formatear:', date)
            return fallback
        }
        
        // Obtener día, mes y año
        const day = dateObj.getDate().toString().padStart(2, '0')
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0') // getMonth() devuelve 0-11
        const year = dateObj.getFullYear()
        
        return `${day}/${month}/${year}`
    } catch (error) {
        console.error('Error al formatear fecha:', error)
        return fallback
    }
}

module.exports = {
    formatDateToDDMMYYYY
}
