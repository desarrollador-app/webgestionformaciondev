import { ref, onMounted } from 'vue'
import { getAllAccionesFormativas } from '../services/accionesFormativasService.js'

export function useAccionesFormativas() {
    const accionesFormativas = ref([])
    const loading = ref(false)
    const error = ref(null)

    const getExpedientePlan = (accion) => {
        if (accion.plan && accion.plan.expediente) {
            return accion.plan.expediente
        }
        return accion.id_plan ? `ID: ${accion.id_plan}` : '-'
    }

    const fetchAccionesFormativas = async (filters = {}) => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getAllAccionesFormativas(filters)
            accionesFormativas.value = data.map(accion => ({
                ...accion,
                expediente_plan: getExpedientePlan(accion)
            }))
        } catch (err) {
            error.value = err.message || 'Error al cargar las acciones formativas'
            console.error('Error fetching acciones formativas:', err)
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        fetchAccionesFormativas()
    })

    return {
        accionesFormativas,
        loading,
        error,
        fetchAccionesFormativas
    }
}