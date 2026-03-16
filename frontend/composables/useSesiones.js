import { ref, computed } from 'vue'
import { 
    getAllSesiones, 
    getSesionById,
    createSesion as createSesionService,
    updateSesion as updateSesionService,
    deleteSesion as deleteSesionService
} from '../services/sesionesService.js'

export function useSesiones() {
    const sesiones = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchSesiones = async (filters = {}) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getAllSesiones(filters)
            sesiones.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar las sesiones'
            console.error('Error fetching sesiones:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchSesionById = async (id) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getSesionById(id)
            return data
        } catch (err) {
            error.value = err.message || 'Error al cargar la sesión'
            console.error('Error fetching sesión:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const createSesion = async (sesionData) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await createSesionService(sesionData)
            await fetchSesiones() // Refrescar la lista
            return data
        } catch (err) {
            error.value = err.message || 'Error al crear la sesión'
            console.error('Error creating sesión:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateSesion = async (id, sesionData) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await updateSesionService(id, sesionData)
            await fetchSesiones() // Refrescar la lista
            return data
        } catch (err) {
            error.value = err.message || 'Error al actualizar la sesión'
            console.error('Error updating sesión:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteSesion = async (id) => {
        loading.value = true
        error.value = null
        
        try {
            await deleteSesionService(id)
            await fetchSesiones() // Refrescar la lista
        } catch (err) {
            error.value = err.message || 'Error al eliminar la sesión'
            console.error('Error deleting sesión:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const sesionesPorGrupo = computed(() => {
        const grupos = {}
        sesiones.value.forEach(sesion => {
            const grupoId = sesion.diaTeleformacion?.id_grupo || sesion.diaPresencial?.id_grupo
            if (grupoId) {
                if (!grupos[grupoId]) {
                    grupos[grupoId] = []
                }
                grupos[grupoId].push(sesion)
            }
        })
        return grupos
    })

    const sesionesPorDia = computed(() => {
        const dias = {}
        sesiones.value.forEach(sesion => {
            const diaId = sesion.id_dia_tele || sesion.id_dia_pres
            if (diaId) {
                if (!dias[diaId]) {
                    dias[diaId] = []
                }
                dias[diaId].push(sesion)
            }
        })
        return dias
    })

    const sesionesOrdenadasPorHorario = computed(() => {
        return [...sesiones.value].sort((a, b) => {
            const horaA = new Date(`1970-01-01T${a.horario_inicio}`)
            const horaB = new Date(`1970-01-01T${b.horario_inicio}`)
            return horaA - horaB
        })
    })

    return {
        sesiones,
        loading,
        error,
        fetchSesiones,
        fetchSesionById,
        createSesion,
        updateSesion,
        deleteSesion,
        sesionesPorGrupo,
        sesionesPorDia,
        sesionesOrdenadasPorHorario
    }
}
