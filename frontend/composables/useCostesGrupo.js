import { ref, onMounted, computed } from 'vue'
import { 
  getAllCostesGrupo, 
  getCosteGrupoById, 
  getCostesByGrupo,
  createCosteGrupo,
  updateCosteGrupo,
  deleteCosteGrupo
} from '../services/costesGrupoService.js'

export function useCostesGrupo() {
    const costes = ref([])
    const coste = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const fetchCostes = async (filters = {}) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getAllCostesGrupo(filters)
            costes.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar los costes de grupo'
            console.error('Error fetching costes:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchCosteById = async (id) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getCosteGrupoById(id)
            coste.value = data
            return data
        } catch (err) {
            error.value = err.message || 'Error al cargar el coste de grupo'
            console.error('Error fetching coste:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchCostesByGrupo = async (idGrupo) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getCostesByGrupo(idGrupo)
            costes.value = data
            return data
        } catch (err) {
            error.value = err.message || 'Error al cargar los costes del grupo'
            console.error('Error fetching costes by grupo:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const createCoste = async (costeData) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await createCosteGrupo(costeData)
            costes.value.push(data)
            return data
        } catch (err) {
            error.value = err.message || 'Error al crear el coste de grupo'
            console.error('Error creating coste:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateCoste = async (id, costeData) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await updateCosteGrupo(id, costeData)
            const index = costes.value.findIndex(c => c.id_coste === id)
            if (index !== -1) {
                costes.value[index] = data
            }
            if (coste.value && coste.value.id_coste === id) {
                coste.value = data
            }
            return data
        } catch (err) {
            error.value = err.message || 'Error al actualizar el coste de grupo'
            console.error('Error updating coste:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const removeCoste = async (id) => {
        loading.value = true
        error.value = null
        
        try {
            await deleteCosteGrupo(id)
            costes.value = costes.value.filter(c => c.id_coste !== id)
            if (coste.value && coste.value.id_coste === id) {
                coste.value = null
            }
            return true
        } catch (err) {
            error.value = err.message || 'Error al eliminar el coste de grupo'
            console.error('Error deleting coste:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        costes,
        coste,
        loading,
        error,
        fetchCostes,
        fetchCosteById,
        fetchCostesByGrupo,
        createCoste,
        updateCoste,
        removeCoste
    }
}
