import { ref, onMounted } from 'vue'
import { getAllPersonas } from '../services/personasService.js'

export function usePersonas(filters = {}) {
    const personas = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchPersonas = async (newFilters = {}) => {
        loading.value = true
        error.value = null
        
        try {
            const mergedFilters = { ...filters, ...newFilters }
            const data = await getAllPersonas(mergedFilters)
            personas.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar las personas'
            console.error('Error fetching personas:', err)
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        fetchPersonas()
    })

    return {
        personas,
        loading,
        error,
        fetchPersonas
    }
}
