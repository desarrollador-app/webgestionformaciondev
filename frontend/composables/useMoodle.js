import { ref } from 'vue'
import { 
    matricularAlumnosGrupo, 
    matricularAlumnoIndividual, 
    verificarConfiguracionMoodle,
    obtenerCredencialesMoodle 
} from '@/services/moodleService.js'

export const useMoodle = () => {
    const loading = ref(false)
    const error = ref(null)
    const configuracion = ref(null)
    const resultados = ref(null)

    /**
     * Verifica la configuración de Moodle para un grupo
     */
    const verificarConfiguracion = async (grupoId) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await verificarConfiguracionMoodle(grupoId)
            configuracion.value = data
            return data
        } catch (err) {
            error.value = 'Error al verificar configuración de Moodle'
            console.error('Error verificando configuración Moodle:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Matricula todos los alumnos de un grupo en Moodle
     */
    const matricularTodosAlumnos = async (grupoId) => {
        loading.value = true
        error.value = null
        resultados.value = null
        
        try {
            const data = await matricularAlumnosGrupo(grupoId)
            resultados.value = data
            return data
        } catch (err) {
            error.value = 'Error al matricular alumnos en Moodle'
            console.error('Error matriculando alumnos:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Matricula un alumno específico en Moodle
     */
    const matricularAlumno = async (alumnoId) => {
        loading.value = true
        error.value = null
        resultados.value = null
        
        try {
            const data = await matricularAlumnoIndividual(alumnoId)
            resultados.value = data
            return data
        } catch (err) {
            error.value = 'Error al matricular alumno en Moodle'
            console.error('Error matriculando alumno:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Obtiene las credenciales generadas para un NIF
     */
    const obtenerCredenciales = async (nif) => {
        try {
            const data = await obtenerCredencialesMoodle(nif)
            return data
        } catch (err) {
            error.value = 'Error al obtener credenciales de Moodle'
            console.error('Error obteniendo credenciales:', err)
            throw err
        }
    }

    /**
     * Valida si la configuración de Moodle está completa
     */
    const isConfiguracionValida = () => {
        if (!configuracion.value) return false
        
        return (
            configuracion.value.moodle.url !== 'No configurado' &&
            configuracion.value.moodle.token === 'Configurado' &&
            configuracion.value.grupo.moodle_grupo_id &&
            configuracion.value.cursoMoodle?.existe === true
        )
    }

    /**
     * Obtiene mensajes de error de configuración
     */
    const getMensajesErrorConfiguracion = () => {
        if (!configuracion.value) return ['Configuración no verificada']
        
        const errores = []
        
        if (configuracion.value.moodle.url === 'No configurado') {
            errores.push('URL de Moodle no configurada')
        }
        
        if (configuracion.value.moodle.token === 'No configurado') {
            errores.push('Token de Moodle no configurado')
        }
        
        if (!configuracion.value.grupo.moodle_grupo_id) {
            errores.push('ID de curso de Moodle no configurado en el grupo')
        }
        
        if (configuracion.value.cursoMoodle?.existe === false) {
            errores.push('El curso no existe en Moodle')
        }
        
        return errores
    }

    /**
     * Limpia el estado del composable
     */
    const limpiarEstado = () => {
        loading.value = false
        error.value = null
        configuracion.value = null
        resultados.value = null
    }

    return {
        // Estado
        loading,
        error,
        configuracion,
        resultados,
        
        // Métodos
        verificarConfiguracion,
        matricularTodosAlumnos,
        matricularAlumno,
        obtenerCredenciales,
        isConfiguracionValida,
        getMensajesErrorConfiguracion,
        limpiarEstado
    }
}
