import { PATTERN_CIF, PATTERN_NIF, LENGTH_CIF_NIF, PATTERN_CIF_AAFF, PATTERN_CODIGO_POSTAL, LENGTH_CODIGO_POSTAL, PATTERN_TELEFONO, MIN_LENGTH_TELEFONO, MAX_LENGTH_TELEFONO, PATTERN_TELEFONO_AULA_VIRTUAL, LENGTH_TELEFONO_AULA_VIRTUAL } from '@/utils/enums.js'

/**
 * Carga los responsables desde el authStore si no están disponibles
 * @param {Object} authStore - Store de autenticación
 * @returns {Promise<void>}
 */
export const loadResponsables = async (authStore) => {
	try {
		// Si no hay responsables cargados, intentar cargarlos
		if (!authStore.getResponsables || authStore.getResponsables.length === 0) {
			await authStore.loadResponsables()
		}
	} catch (error) {
		console.error('Error al cargar responsables:', error)
	}
}

/**
 * Carga los responsables y los transforma para usar en componentes Select
 * @param {Object} authStore - Store de autenticación
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.loadingRef - Referencia reactiva para estado de carga
 * @param {Object} options.errorRef - Referencia reactiva para errores
 * @param {Object} options.responsablesRef - Referencia reactiva para almacenar responsables
 * @returns {Promise<void>}
 */
export const loadResponsablesForSelect = async (authStore, { loadingRef, errorRef, responsablesRef }) => {
	try {
		loadingRef.value = true
		errorRef.value = null

		// Cargar responsables usando la función de utils
		await loadResponsables(authStore)

		// Obtener responsables desde el store
		const responsablesFromStore = authStore.getResponsables

		if (responsablesFromStore && responsablesFromStore.length > 0) {
			// Transformar usuarios al formato esperado por el Select
			responsablesRef.value = responsablesFromStore.map(user => ({
				label: user.displayName || user.userPrincipalName || 'Usuario sin nombre',
				value: user.id, // Usar el Azure ID como value
				email: user.mail,
				jobTitle: user.jobTitle,
				department: user.department
			}))

		} else {
			console.warn('No hay responsables disponibles en localStorage')
			responsablesRef.value = []
		}
	} catch (error) {
		console.error('Error al cargar responsables desde localStorage:', error)
		errorRef.value = 'Error al cargar responsables'
		responsablesRef.value = []
	} finally {
		loadingRef.value = false
	}
}

/**
 * Obtiene el nombre de un usuario por su Azure ID
 * @param {string} azureId - ID de Azure del usuario
 * @param {Object} authStore - Store de autenticación
 * @returns {string} Nombre del usuario o '-'
 */
export const getUsuarioNombre = (azureId, authStore) => {
	if (!azureId) return '-'

	const responsables = authStore.getResponsables
	const usuario = responsables.find(r => r.id === azureId)
	return usuario ? usuario.displayName : `ID: ${azureId}`
}


/**
 * Convierte una fecha en formato ISO (2024-06-30T00:00:00.000Z) a formato dd/mm/yyyy
 * @param {string|Date} date - Fecha en formato ISO o objeto Date
 * @param {string} fallback - Texto a mostrar si la fecha es inválida (por defecto: '')
 * @returns {string} Fecha formateada como dd/mm/yyyy
 */
export const formatDateToDDMMYYYY = (date, fallback = '') => {
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


/**
 * Formatea un tiempo a formato HH:MM para inputs de tipo time
 * @param {string|Date} time - Tiempo en cualquier formato
 * @returns {string} Tiempo formateado como HH:MM
 */
export const formatTimeToHHMM = (time) => {
	if (!time) return ''

	// Si ya es un string en formato HH:MM, devolverlo tal como está
	if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
		return time
	}

	// Si es un string de tiempo (HH:MM:SS o HH:MM), extraer directamente
	if (typeof time === 'string' && /^\d{1,2}:\d{2}(:\d{2})?/.test(time)) {
		const timeParts = time.split(':')
		const hours = timeParts[0].padStart(2, '0')
		const minutes = timeParts[1].padStart(2, '0')
		return `${hours}:${minutes}`
	}

	// Si es un objeto Date, usar métodos UTC para evitar conversión de timezone
	if (time instanceof Date) {
		const hours = time.getUTCHours().toString().padStart(2, '0')
		const minutes = time.getUTCMinutes().toString().padStart(2, '0')
		return `${hours}:${minutes}`
	}

	// Si es un string de fecha completa, extraer la parte de tiempo directamente
	if (typeof time === 'string' && time.includes('T')) {
		// Extraer la parte de tiempo del string ISO (después de la T)
		const timePart = time.split('T')[1]
		if (timePart) {
			// Remover la parte de timezone si existe (Z o +XX:XX)
			const timeOnly = timePart.split(/[Z+-]/)[0]
			const timeParts = timeOnly.split(':')
			const hours = timeParts[0].padStart(2, '0')
			const minutes = timeParts[1].padStart(2, '0')
			return `${hours}:${minutes}`
		}
	}

	// Fallback: crear Date y usar UTC
	const date = new Date(time)
	if (isNaN(date.getTime())) {
		console.warn('Tiempo inválido para formatear:', time)
		return ''
	}

	// Usar UTC para evitar problemas de timezone
	const hours = date.getUTCHours().toString().padStart(2, '0')
	const minutes = date.getUTCMinutes().toString().padStart(2, '0')

	return `${hours}:${minutes}`
}

/**
 * Convierte una cadena en camelCase a texto legible con espacios
 * @param {string} key - Cadena en camelCase (ej: 'fechaInicio')
 * @returns {string} Texto formateado (ej: 'Fecha Inicio')
 */
export const formatLabel = (key) => {
	if (!key || typeof key !== 'string') return ''
	return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

/**
 * Valida patrón CIF/NIF según XSD InicioGrupos
 * @param {Object} errors - Objeto reactivo de errores del componente
 * @param {string} fieldName - Nombre del campo a validar
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido, false si no
 */
export const validateCifNif = (errors, fieldName, value) => {
	if (!value) {
		errors[fieldName] = ''
		return true
	}

	if (value.length !== LENGTH_CIF_NIF) {
		errors[fieldName] = `El CIF o NIF debe tener exactamente ${LENGTH_CIF_NIF} caracteres`
		return false
	}

	// Verificar primero si es CIF
	if (PATTERN_CIF.test(value)) {
		errors[fieldName] = ''
		return true
	}

	// Verificar si es NIF
	if (PATTERN_NIF.test(value)) {
		errors[fieldName] = ''
		return true
	}

	// Si no coincide con ninguno, determinar qué tipo se intentó validar
	if (/^[AaBbCcDdEeFfGgHhKkLlMmNnPpQqSsJjUuVvWwRr]/.test(value)) {
		errors[fieldName] = 'El formato del CIF no es válido'
	} else {
		errors[fieldName] = 'El formato del NIF no es válido'
	}

	return false
}
/**
 * Valida solo CIF según XSD InicioGrupos
 * @param {Object} errors - Objeto reactivo de errores del componente
 * @param {string} fieldName - Nombre del campo a validar
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido, false si no
 */
export const validateCif = (errors, fieldName, value) => {
	if (!value) {
		errors[fieldName] = ''
		return true
	}

	if (value.length !== LENGTH_CIF_NIF) {
		errors[fieldName] = `El CIF debe tener exactamente ${LENGTH_CIF_NIF} caracteres`
		return false
	}

	if (!PATTERN_CIF.test(value)) {
		errors[fieldName] = 'El formato del CIF no es válido'
		return false
	}

	errors[fieldName] = ''
	return true
}


/**
 * Valida solo NIF según XSD InicioGrupos
 * @param {Object} errors - Objeto reactivo de errores del componente
 * @param {string} fieldName - Nombre del campo a validar
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido, false si no
 */
export const validateNif = (errors, fieldName, value) => {
	if (!value) {
		errors[fieldName] = ''
		return true
	}

	if (value.length !== LENGTH_CIF_NIF) {
		errors[fieldName] = `El NIF debe tener exactamente ${LENGTH_CIF_NIF} caracteres`
		return false
	}

	if (!PATTERN_NIF.test(value)) {
		errors[fieldName] = 'El formato del NIF no es válido'
		return false
	}

	errors[fieldName] = ''
	return true
}

/**
 * Valida código postal (5 dígitos) según XSD
 * @param {Object} errors - Objeto reactivo de errores del componente
 * @param {string} fieldName - Nombre del campo a validar
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido, false si no
 */
export const validateCodigoPostal = (errors, fieldName, value) => {
	if (!value) {
		errors[fieldName] = ''
		return true
	}

	if (!PATTERN_CODIGO_POSTAL.test(value)) {
		errors[fieldName] = `El código postal debe tener exactamente ${LENGTH_CODIGO_POSTAL} dígitos`
		return false
	}
	errors[fieldName] = ''
	return true
}

/**
 * Valida teléfono (9-12 dígitos) según XSD
 * @param {Object} errors - Objeto reactivo de errores del componente
 * @param {string} fieldName - Nombre del campo a validar
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido, false si no
 */
export const validateTelefono = (errors, fieldName, value) => {
	if (!value) {
		errors[fieldName] = ''
		return true
	}

	if (!PATTERN_TELEFONO.test(value)) {
		errors[fieldName] = `El teléfono debe tener entre ${MIN_LENGTH_TELEFONO} y ${MAX_LENGTH_TELEFONO} dígitos`
		return false
	}
	errors[fieldName] = ''
	return true
}

/**
 * Valida teléfono aula virtual (9 dígitos exactos) según XSD
 * @param {Object} errors - Objeto reactivo de errores del componente
 * @param {string} fieldName - Nombre del campo a validar
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido, false si no
 */
export const validateTelefonoAulaVirtual = (errors, fieldName, value) => {
	if (!value) {
		errors[fieldName] = ''
		return true
	}

	if (!PATTERN_TELEFONO_AULA_VIRTUAL.test(value)) {
		errors[fieldName] = `El teléfono debe tener exactamente ${LENGTH_TELEFONO_AULA_VIRTUAL} dígitos`
		return false
	}
	errors[fieldName] = ''
	return true
}

/**
 * Valida patrón CIF según XSD AAFF_Inicio
 * @param {Object} errors - Objeto reactivo de errores del componente
 * @param {string} fieldName - Nombre del campo a validar
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido, false si no
 */
export const validateCifPlataforma = (errors, fieldName, value) => {
	if (!value) {
		errors[fieldName] = ''
		return true
	}

	if (!PATTERN_CIF_AAFF.test(value)) {
		errors[fieldName] = 'El formato del CIF no es válido'
		return false
	}

	errors[fieldName] = ''
	return true
}

/**
 * Valida longitud máxima de campos
 * @param {Object} errors - Objeto reactivo de errores del componente
 * @param {string} fieldName - Nombre del campo a validar
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {boolean} true si es válido, false si no
 */
export const validateFieldLength = (errors, fieldName, value, maxLength) => {
	if (!value) {
		errors[fieldName] = ''
		return true
	}
	if (value.length > maxLength) {
		errors[fieldName] = `Este campo no puede exceder ${maxLength} caracteres (actual: ${value.length})`
		return false
	}
	errors[fieldName] = ''
	return true
}

/**
 * Valida longitud mínima de campos
 * @param {Object} errors - Objeto reactivo de errores del componente
 * @param {string} fieldName - Nombre del campo a validar
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima requerida
 * @returns {boolean} true si es válido, false si no
 */
export const validateFieldMinLength = (errors, fieldName, value, minLength) => {
	if (!value) {
		errors[fieldName] = ''
		return true
	}
	if (value.length < minLength) {
		errors[fieldName] = `Este campo debe tener al menos ${minLength} caracteres`
		return false
	}
	errors[fieldName] = ''
	return true
}