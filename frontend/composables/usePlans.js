import { ref, onMounted } from 'vue'
import { getAllPlans } from '../services/plansService.js'

export function usePlans() {
    const planes = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchPlans = async () => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getAllPlans()
            planes.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar los planes'
            console.error('Error fetching plans:', err)
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        fetchPlans()
    })

    return {
        planes,
        loading,
        error,
        fetchPlans
    }
}
