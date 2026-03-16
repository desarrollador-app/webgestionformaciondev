import { ref, computed } from 'vue'
import { 
    getAllDiasImparticionPresencial, 
    getDiaImparticionPresencialById,
    createDiaImparticionPresencial,
    updateDiaImparticionPresencial,
    deleteDiaImparticionPresencial
} from '../services/diasImparticionPresencialService.js'

export function useDiasImparticionPresencial() {
    const dias = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchDias = async (filters = {}) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getAllDiasImparticionPresencial(filters)
            dias.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar los días de impartición presenciales'
            console.error('Error fetching días presenciales:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchDiaById = async (id) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getDiaImparticionPresencialById(id)
            return data
        } catch (err) {
            error.value = err.message || 'Error al cargar el día de impartición presencial'
            console.error('Error fetching día presencial:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const createDia = async (diaData) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await createDiaImparticionPresencial(diaData)
            await fetchDias() // Refrescar la lista
            return data
        } catch (err) {
            error.value = err.message || 'Error al crear el día de impartición presencial'
            console.error('Error creating día presencial:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateDia = async (id, diaData) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await updateDiaImparticionPresencial(id, diaData)
            await fetchDias() // Refrescar la lista
            return data
        } catch (err) {
            error.value = err.message || 'Error al actualizar el día de impartición presencial'
            console.error('Error updating día presencial:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteDia = async (id) => {
        loading.value = true
        error.value = null
        
        try {
            await deleteDiaImparticionPresencial(id)
            await fetchDias() // Refrescar la lista
        } catch (err) {
            error.value = err.message || 'Error al eliminar el día de impartición presencial'
            console.error('Error deleting día presencial:', err)
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
