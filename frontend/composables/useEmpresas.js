import { ref, onMounted } from 'vue'
import { getAllEmpresas } from '../services/empresasService.js'

export function useEmpresas() {
    const empresas = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchEmpresas = async () => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getAllEmpresas()
            empresas.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar las empresas'
            console.error('Error fetching empresas:', err)
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        fetchEmpresas()
    })

    return {
        empresas,
        loading,
        error,
        fetchEmpresas
    }
}