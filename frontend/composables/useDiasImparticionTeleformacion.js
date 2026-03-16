import { ref, computed } from 'vue'
import { 
    getAllDiasImparticionTeleformacion, 
    getDiaImparticionTeleformacionById,
    createDiaImparticionTeleformacion,
    updateDiaImparticionTeleformacion,
    deleteDiaImparticionTeleformacion
} from '../services/diasImparticionTeleformacionService.js'

export function useDiasImparticionTeleformacion() {
    const dias = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchDias = async (filters = {}) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getAllDiasImparticionTeleformacion(filters)
            dias.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar los días de impartición de teleformación'
            console.error('Error fetching días teleformación:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchDiaById = async (id) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getDiaImparticionTeleformacionById(id)
            return data
        } catch (err) {
            error.value = err.message || 'Error al cargar el día de impartición de teleformación'
            console.error('Error fetching día teleformación:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const createDia = async (diaData) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await createDiaImparticionTeleformacion(diaData)
            await fetchDias() // Refrescar la lista
            return data
        } catch (err) {
            error.value = err.message || 'Error al crear el día de impartición de teleformación'
            console.error('Error creating día teleformación:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateDia = async (id, diaData) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await updateDiaImparticionTeleformacion(id, diaData)
            await fetchDias() // Refrescar la lista
            return data
        } catch (err) {
            error.value = err.message || 'Error al actualizar el día de impartición de teleformación'
            console.error('Error updating día teleformación:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteDia = async (id) => {
        loading.value = true
        error.value = null
        
        try {
            await deleteDiaImparticionTeleformacion(id)
            await fetchDias() // Refrescar la lista
        } catch (err) {
            error.value = err.message || 'Error al eliminar el día de impartición de teleformación'
            console.error('Error deleting día teleformación:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const diasPorGrupo = computed(() => {
        const grupos = {}
        dias.value.forEach(dia => {
            if (!grupos[dia.id_grupo]) {
                grupos[dia.id_grupo] = []
            }
            grupos[dia.id_grupo].push(dia)
        })
        return grupos
    })

    const diasOrdenadosPorFecha = computed(() => {
        return [...dias.value].sort((a, b) => new Date(a.fecha_imparticion) - new Date(b.fecha_imparticion))
    })

    return {
        dias,
        loading,
        error,
        fetchDias,
        fetchDiaById,
        createDia,
        updateDia,
        deleteDia,
        diasPorGrupo,
        diasOrdenadosPorFecha
    }
}
